"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Search,
  Clock,
  Plane,
  CheckCircle2,
  AlertCircle,
  Mail,
  MessageCircle,
  PhoneCall,
  Users,
  Download,
} from "lucide-react";

import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

type ApplicationStatus = "submitted" | "paid" | "issued" | "rejected";

// Raw statuses we may store per applicant (or globally)
type RawStatus =
  | "draft"
  | "pending"
  | "submitted"
  | "paid"
  | "processing"
  | "issued"
  | "rejected";

type ApplicantTrackingRow = {
  name: string;
  passportNumber?: string;
  status: ApplicationStatus;
  visaFileUrl?: string | null; // ✅ per applicant visa
};

type TrackingResult = {
  id: string;

  // ✅ computed overall status (based on per-applicant rule)
  status: ApplicationStatus;

  // ✅ per applicant rows
  applicants: ApplicantTrackingRow[];

  visaType: string;
  country: string;
  createdAt: string;
  updatedAt: string;

  tentativeTravelDate?: string;
  visaFileUrl?: string | null;
};

/* -------------------------------------------------------
   STATUS MAPPER → Firebase status → UI status
------------------------------------------------------- */
const mapStatus = (raw: any): ApplicationStatus => {
  const s = String(raw || "")
    .trim()
    .toLowerCase();

  switch (s) {
    case "draft":
    case "pending":
    case "submitted":
      return "submitted";

    case "paid":
    case "processing":
      return "paid";

    case "issued":
      return "issued";

    case "rejected":
      return "rejected";

    default:
      return "submitted";
  }
};

const compactName = (first?: string, last?: string) =>
  [first, last].filter(Boolean).join(" ").trim();

const safeStr = (v: any) =>
  typeof v === "string" ? v : v == null ? "" : String(v);

/* -------------------------------------------------------
   OVERALL RULE (per-applicant + safe fallback)
   Priority:
   - if ANY rejected => rejected
   - else if ALL issued (and at least 1 applicant) => issued
   - else if ANY paid/processing => paid
   - else => submitted
------------------------------------------------------- */
const computeOverallStatus = (
  applicants: ApplicantTrackingRow[],
  fallbackGlobalRawStatus?: any,
): ApplicationStatus => {
  if (Array.isArray(applicants) && applicants.length > 0) {
    const statuses = applicants.map((a) => a.status);

    if (statuses.some((s) => s === "rejected")) return "rejected";
    if (statuses.every((s) => s === "issued")) return "issued";
    if (statuses.some((s) => s === "paid")) return "paid";

    return "submitted";
  }

  // fallback if per-applicant not present yet
  return mapStatus(fallbackGlobalRawStatus);
};

/* -------------------------------------------------------
   Extract per-applicant raw statuses from Firestore doc
   Supports multiple shapes so it won't break:

   1) data.applicants[i].status
   2) data.applicantsStatus[i]  (array)
   3) data.applicantStatuses[i] (array)
   4) data.applicant_statuses[i] (array)
   5) data.perApplicantStatus[i] (array)
------------------------------------------------------- */
const getApplicantRawStatusAt = (
  data: any,
  idx: number,
): RawStatus | undefined => {
  const a = Array.isArray(data?.applicants) ? data.applicants[idx] : null;
  const direct = a?.status ?? a?.appStatus ?? a?.applicationStatus;
  if (direct) return String(direct).toLowerCase() as RawStatus;

  const candidates = [
    data?.applicantsStatus,
    data?.applicantStatuses,
    data?.applicant_statuses,
    data?.perApplicantStatus,
  ];

  for (const c of candidates) {
    if (Array.isArray(c) && c[idx]) {
      return String(c[idx]).toLowerCase() as RawStatus;
    }
  }

  return undefined;
};

/* -------------------------------------------------------
   Transform Firestore doc → TrackingResult
------------------------------------------------------- */
const transform = (id: string, data: any): TrackingResult => {
  const applicantsArr = Array.isArray(data?.applicants) ? data.applicants : [];

  const applicantRows: ApplicantTrackingRow[] = applicantsArr.map(
    (applicant: any, idx: number) => {
      const fullName =
        compactName(applicant?.firstName, applicant?.lastName) ||
        safeStr(applicant?.name) ||
        `Applicant ${idx + 1}`;

      const passport =
        safeStr(applicant?.passportNumber) ||
        safeStr(applicant?.passport_no) ||
        "";

      const applicantRaw =
        applicant?.status ??
        applicant?.appStatus ??
        applicant?.applicationStatus;
      const raw = (applicantRaw ??
        getApplicantRawStatusAt(data, idx) ??
        data?.status) as any;
      const uiStatus = mapStatus(raw);

      const visaUrl =
        applicant?.visaFile?.url || applicant?.visa_file?.url || null;

      return {
        name: fullName.toUpperCase(),
        passportNumber: passport || "—",
        status: uiStatus,
        visaFileUrl: visaUrl,
      };
    },
  );

  const overall = computeOverallStatus(applicantRows, data?.status);

  const createdAt = data.createdAt?.toDate
    ? data.createdAt.toDate().toLocaleString()
    : data.createdAt
      ? new Date(
          data.createdAt.seconds
            ? data.createdAt.seconds * 1000
            : data.createdAt,
        ).toLocaleString()
      : "—";

  const updatedAt = data.updatedAt?.toDate
    ? data.updatedAt.toDate().toLocaleString()
    : data.updatedAt
      ? new Date(
          data.updatedAt.seconds
            ? data.updatedAt.seconds * 1000
            : data.updatedAt,
        ).toLocaleString()
      : "—";

  return {
    id,
    status: overall,
    applicants: applicantRows,

    visaType: data.plan?.visa ?? "",
    country: data.plan?.country ?? "",

    createdAt,
    updatedAt,

    tentativeTravelDate: data.tentativeTravelDate ?? "",
    visaFileUrl: data.visaFile?.url ?? null, // legacy (all issued case)
  };
};

export default function TrackPageClient() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("appId") ?? "";

  const [trackingId, setTrackingId] = useState(initialId);
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [notFound, setNotFound] = useState(false);

  // prevent stacking multiple snapshot listeners
  const unsubRef = useRef<null | (() => void)>(null);

  /* Auto-search if coming from success page */
  useEffect(() => {
    if (initialId) {
      handleSearch(initialId, { silent: true }).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialId]);

  /* -------------------------------------------------------
     FIRESTORE FETCH + REAL-TIME TRACKING
  ------------------------------------------------------- */
  const handleSearch = async (
    id: string,
    opts?: { silent?: boolean },
  ): Promise<void> => {
    setNotFound(false);
    setResult(null);

    // stop previous listener
    if (unsubRef.current) {
      unsubRef.current();
      unsubRef.current = null;
    }

    if (!id) {
      if (!opts?.silent) toast.error("Please enter your tracking ID.");
      return;
    }

    if (!opts?.silent) {
      toast.dismiss();
      toast.loading("Looking up your application…");
    }

    setIsSearching(true);

    try {
      const ref = doc(db, "applications", id);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        setNotFound(true);
        if (!opts?.silent) {
          toast.dismiss();
          toast.error("Application not found", {
            description: "Please check your tracking ID and try again.",
          });
        }
        setIsSearching(false);
        return;
      }

      // INITIAL RESULT
      const data = transform(id, snap.data());
      setResult(data);

      if (!opts?.silent) {
        toast.dismiss();
        toast.success("Application found", {
          description: `Current status: ${formatStatus(data.status)}`,
        });
      }

      // REAL-TIME UPDATES
      unsubRef.current = onSnapshot(ref, (liveSnap) => {
        if (!liveSnap.exists()) return;
        setResult(transform(id, liveSnap.data()));
      });
    } catch (e: any) {
      console.error("Track error", e);
      setNotFound(true);

      toast.dismiss();
      toast.error("Couldn't fetch your application", {
        description:
          e?.message ||
          "Please refresh the page or try again in a few moments.",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchClick = async () => {
    await handleSearch(trackingId.trim());
  };

  /* -------------------------------------------------------
     Status UI Formatting
  ------------------------------------------------------- */
  function formatStatus(status: ApplicationStatus) {
    switch (status) {
      case "submitted":
        return "Application submitted";
      case "paid":
        return "Payment completed";
      case "issued":
        return "Visa issued";
      case "rejected":
        return "Application decision";
      default:
        return status;
    }
  }

  const statusColorClasses: Record<ApplicationStatus, string> = {
    submitted: "bg-amber-50 text-amber-700 border-amber-200",
    paid: "bg-sky-50 text-sky-700 border-sky-200",
    issued: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-rose-50 text-rose-700 border-rose-200",
  };

  const statusIcon = (status: ApplicationStatus) => {
    if (status === "rejected") return <AlertCircle className="h-4 w-4" />;
    if (status === "issued") return <CheckCircle2 className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  /* -------------------------------------------------------
     Timeline Steps
  ------------------------------------------------------- */
  const timelineSteps: {
    key: ApplicationStatus;
    label: string;
    desc: string;
  }[] = [
    {
      key: "submitted",
      label: "Application submitted",
      desc: "We have received your application and documents.",
    },
    {
      key: "paid",
      label: "Payment completed",
      desc: "Your payment has been confirmed successfully.",
    },
    {
      key: "issued",
      label: "Visa issued",
      desc: "Your visa has been approved and issued.",
    },
  ];

  const stepOrder: ApplicationStatus[] = ["submitted", "paid", "issued"];
  const activeIndex = result
    ? Math.max(
        0,
        stepOrder.findIndex((s) =>
          result.status === "rejected" ? s === "issued" : s === result.status,
        ),
      )
    : -1;

  /* -------------------------------------------------------
     UI START
  ------------------------------------------------------- */
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F5F6FB] via-white to-[#fdf7e3] px-4 pt-28 pb-10 md:px-6 md:pt-32 md:pb-16">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 lg:flex-row">
        {/* LEFT SIDE */}
        <section className="flex-1 space-y-6">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
            Track your visa application
          </h1>
          <p className="text-sm text-slate-600 max-w-xl">
            Enter the tracking ID you received after payment to see status
            updates, timelines, and important details.
          </p>

          {/* SEARCH BAR */}
          <div className="rounded-2xl border border-slate-100 bg-white/90 p-4 shadow md:p-5">
            <p className="text-[11px] uppercase tracking-[0.16em] font-semibold text-slate-500">
              Tracking ID
            </p>

            <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 rounded-full border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs shadow-inner focus-within:border-[#3C4161] focus-within:bg-white">
                <div className="flex items-center gap-2">
                  <Search className="h-3.5 w-3.5 text-slate-400" />
                  <input
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    placeholder="e.g. V8bffgCu..."
                    className="w-full bg-transparent text-xs text-slate-800 outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleSearchClick}
                disabled={!trackingId.trim() || isSearching}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#3C4161] px-5 py-2 text-xs font-semibold text-white shadow-lg hover:opacity-90 disabled:opacity-50 transition"
              >
                {isSearching ? (
                  <>
                    <span className="h-3 w-3 animate-spin rounded-full border-[2px] border-white/70 border-t-transparent" />
                    Checking…
                  </>
                ) : (
                  <>
                    <Search className="h-3.5 w-3.5" />
                    Track application
                  </>
                )}
              </button>
            </div>
          </div>

          {/* LOADING */}
          {isSearching && (
            <div className="animate-pulse rounded-2xl border border-slate-100 bg-white/80 p-4 md:p-5">
              <div className="h-4 w-32 rounded bg-slate-100" />
              <div className="mt-4 h-3 w-48 rounded bg-slate-100" />
              <div className="mt-2 h-3 w-64 rounded bg-slate-100" />
              <div className="mt-4 h-20 rounded-xl bg-slate-50" />
            </div>
          )}

          {/* NOT FOUND */}
          {!isSearching && notFound && (
            <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-xs text-rose-700">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4" />
                <div>
                  <p className="font-semibold">We couldn't find this ID</p>
                  <p className="mt-1">
                    Please check your tracking ID and try again.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* RESULT */}
          {!isSearching && result && (
            <>
              {/* STATUS CARD */}
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow md:p-5 text-xs">
                <p className="text-[11px] uppercase font-semibold tracking-[0.16em] text-slate-500">
                  Current status
                </p>

                <div className="mt-2 inline-flex items-center gap-2">
                  <span
                    className={[
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold",
                      statusColorClasses[result.status],
                    ].join(" ")}
                  >
                    {statusIcon(result.status)}
                    {formatStatus(result.status)}
                  </span>

                  <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] text-slate-500">
                    {result.visaType} · {result.country}
                  </span>
                </div>

                <div className="mt-3 grid gap-1 text-[11px] text-slate-500 md:grid-cols-2">
                  <p>
                    <span className="text-slate-800 font-medium">
                      Tracking ID:
                    </span>{" "}
                    <span className="font-mono">{result.id}</span>
                  </p>

                  <p className="md:text-right">
                    <span className="text-slate-800 font-medium">
                      Last updated:
                    </span>{" "}
                    {result.updatedAt}
                  </p>

                  <p>
                    <span className="text-slate-800 font-medium">Created:</span>{" "}
                    {result.createdAt}
                  </p>
                </div>
              </div>

              {/* TIMELINE */}
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow md:p-5 text-xs">
                <p className="text-[11px] uppercase font-semibold tracking-[0.16em] text-slate-500">
                  Application journey
                </p>

                <div className="mt-4 flex flex-col md:flex-row gap-4 md:gap-6">
                  {timelineSteps.map((step, index) => {
                    const sIndex = stepOrder.indexOf(step.key);
                    const isDone = activeIndex > sIndex;
                    const isActive = activeIndex === sIndex;

                    return (
                      <div
                        key={step.key}
                        className="flex flex-1 items-start gap-3"
                      >
                        <div className="flex flex-col items-center relative">
                          <div
                            className={[
                              "flex h-7 w-7 items-center justify-center rounded-full border text-[10px]",
                              isDone || isActive
                                ? "border-[#3C4161] bg-[#3C4161] text-white shadow"
                                : "border-slate-300 bg-white text-slate-400",
                            ].join(" ")}
                          >
                            {isDone ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : (
                              index + 1
                            )}
                          </div>

                          {index < timelineSteps.length - 1 && (
                            <div className="hidden md:block h-px w-16 translate-y-3 bg-slate-200"></div>
                          )}
                        </div>

                        <div className="flex-1">
                          <p
                            className={`text-[11px] font-semibold ${
                              isDone || isActive
                                ? "text-slate-900"
                                : "text-slate-500"
                            }`}
                          >
                            {step.label}
                          </p>
                          <p className="mt-0.5 text-[11px] text-slate-500">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ✅ APPLICANTS (Premium + per-applicant status) */}
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow md:p-5 text-xs">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] uppercase font-semibold tracking-[0.16em] text-slate-500">
                    Applicants
                  </p>

                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-2.5 py-1 text-[10px] text-slate-600">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    {result.applicants.length} applicant
                    {result.applicants.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="mt-3 space-y-3">
                  {result.applicants.map((a, idx) => {
                    const pill =
                      a.status === "issued"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : a.status === "paid"
                          ? "bg-sky-50 text-sky-700 border-sky-200"
                          : a.status === "rejected"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-amber-50 text-amber-700 border-amber-200";

                    const label =
                      a.status === "issued"
                        ? "Visa issued"
                        : a.status === "paid"
                          ? "Payment completed"
                          : a.status === "rejected"
                            ? "Rejected"
                            : "Submitted";

                    return (
                      <div
                        key={`${a.name}-${idx}`}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 flex items-center justify-between gap-4"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">
                            {a.name}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            Passport:{" "}
                            <span className="font-medium text-slate-700">
                              {a.passportNumber || "—"}
                            </span>
                          </p>
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          <span
                            className={[
                              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-semibold",
                              pill,
                            ].join(" ")}
                          >
                            {a.status === "issued" ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : a.status === "rejected" ? (
                              <AlertCircle className="h-3.5 w-3.5" />
                            ) : (
                              <Clock className="h-3.5 w-3.5" />
                            )}
                            {label}
                          </span>

                          {a.visaFileUrl && (
                            <a
                              href={a.visaFileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-full bg-[#62E9C9] px-3 py-1 text-[10px] font-semibold text-[#0c4d3d] shadow-sm hover:opacity-90 transition"
                              title="Download visa"
                            >
                              <Download className="h-3.5 w-3.5" />
                              Download Visa
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <p className="mt-3 text-[10px] text-slate-500">
                  Overall status follows applicants:{" "}
                  <span className="font-medium text-slate-800">
                    rejected if any rejected
                  </span>
                  ,{" "}
                  <span className="font-medium text-slate-800">
                    issued when all are issued
                  </span>
                  , otherwise progresses as payment/submitted.
                </p>
              </div>
            </>
          )}
        </section>

        {/* RIGHT PANEL */}
        <aside className="w-full max-w-md lg:w-80 space-y-4">
          <div className="rounded-2xl border border-slate-900/80 bg-slate-900 p-4 text-xs text-slate-100 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#62E9C9] text-[#0c4d3d] shadow">
                <Plane className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] uppercase text-slate-300 font-semibold tracking-[0.16em]">
                  Need help while tracking?
                </p>
                <p className="mt-1 text-[11px]">
                  Our visa experts are available on WhatsApp & email.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2 rounded-xl bg-slate-800/60 p-3">
              <button className="flex items-center justify-between w-full rounded-full bg-[#62E9C9] px-3 py-2 text-[11px] font-semibold text-[#0c4d3d] shadow hover:-translate-y-0.5 transition">
                <span className="inline-flex items-center gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5" />
                  Chat on WhatsApp
                </span>
                +971 55 871 5533
              </button>

              <button className="flex items-center justify-between w-full rounded-full border border-slate-600 bg-slate-900/60 px-3 py-2 text-[11px] font-semibold text-slate-100 hover:border-slate-400 hover:bg-slate-800">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  Email our team
                </span>
                support@uaepermit.com
              </button>

              <div className="flex items-start gap-2 text-[10px] pt-1">
                <PhoneCall className="h-3.5 w-3.5" />
                Prefer a call? Mention your tracking ID for faster help.
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white/90 p-4 text-[11px] text-slate-600 shadow">
            <p className="font-semibold text-slate-900">Tips for faster help</p>
            <ul className="mt-2 space-y-1.5 list-disc pl-4">
              <li>Keep your passport and tracking ID ready.</li>
              <li>Check spam / promotions folder for our emails.</li>
              <li>
                For urgent travel, use the{" "}
                <span className="font-medium text-slate-800">
                  Express Service
                </span>
                .
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}
