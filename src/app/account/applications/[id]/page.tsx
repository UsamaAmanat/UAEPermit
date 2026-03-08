"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  Download,
  CreditCard,
  FileText,
  MapPin,
  CalendarDays,
  Zap,
} from "lucide-react";

type AppStatus = "submitted" | "pending_payment" | "paid" | "issued" | "rejected";

function mapStatus(raw: any): AppStatus {
  const s = String(raw || "").trim().toLowerCase();
  if (["draft", "pending", "submitted", "incomplete"].includes(s)) return "pending_payment";
  if (["paid", "processing"].includes(s)) return "paid";
  if (s === "issued") return "issued";
  if (s === "rejected") return "rejected";
  return "submitted";
}

function formatDate(v: any): string {
  if (!v) return "—";
  const d = v?.seconds != null ? new Date(v.seconds * 1000) : new Date(v);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

function getApplicantRawStatusAt(data: any, idx: number): string | undefined {
  const a = Array.isArray(data?.applicants) ? data.applicants[idx] : null;
  const direct = a?.status ?? a?.appStatus ?? a?.applicationStatus;
  if (direct) return String(direct).toLowerCase();
  const candidates = [data?.applicantsStatus, data?.applicantStatuses, data?.applicant_statuses, data?.perApplicantStatus];
  for (const c of candidates) {
    if (Array.isArray(c) && c[idx]) return String(c[idx]).toLowerCase();
  }
  return undefined;
}

function initials(first?: string, last?: string): string {
  const a = (first || "").trim()[0] || "";
  const b = (last || "").trim()[0] || "";
  return (a + b).toUpperCase() || "?";
}

export default function AccountApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const id = params?.id;
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    if (!id || !user) return;
    const ref = doc(db, "applications", id);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          setData(null);
          setForbidden(false);
          return;
        }
        const d = snap.data() as any;
        if (d.userId !== user.uid) {
          setForbidden(true);
          setData(null);
        } else {
          setData({ id: snap.id, ...d });
          setForbidden(false);
        }
      },
      (err) => {
        console.error(err);
        setData(null);
      }
    );
    setLoading(false);
    return () => unsub();
  }, [id, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (forbidden || !data) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
          <AlertCircle className="h-6 w-6 text-slate-400" />
        </div>
        <p className="mt-4 text-slate-600 font-medium">{forbidden ? "You don't have access to this application." : "Application not found."}</p>
        <Link href="/account/applications" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Back to applications
        </Link>
      </div>
    );
  }

  const plan = data.plan ?? {};
  const applicantsArr = Array.isArray(data.applicants) ? data.applicants : [];
  const trackingId = data.trackingId || data.id;
  const overallStatus = mapStatus(data.status);
  const createdStr = formatDate(data.createdAt);
  const updatedStr = formatDate(data.updatedAt);
  const extraFastSelected = !!data.extraFastSelected;
  const extraFastFee = Number(data.extraFastFeePerApplicant || 0);
  const planPrice = Number(plan.price || 0);
  const applicantsCount = applicantsArr.length || 1;
  const paidAmount = Number(data.paidAmount ?? data.grandTotal ?? data.totalAmount ?? 0);
  const grandTotal = paidAmount > 0 ? paidAmount : (planPrice * applicantsCount + (extraFastSelected ? extraFastFee * applicantsCount : 0));

  const statusColor: Record<AppStatus, { bg: string; text: string; icon: string; border: string }> = {
    submitted: { bg: "bg-amber-50", text: "text-amber-700", icon: "text-amber-500", border: "border-amber-200" },
    pending_payment: { bg: "bg-orange-50", text: "text-orange-700", icon: "text-orange-500", border: "border-orange-200" },
    paid: { bg: "bg-sky-50", text: "text-sky-700", icon: "text-sky-500", border: "border-sky-200" },
    issued: { bg: "bg-emerald-50", text: "text-emerald-700", icon: "text-emerald-500", border: "border-emerald-200" },
    rejected: { bg: "bg-rose-50", text: "text-rose-700", icon: "text-rose-500", border: "border-rose-200" },
  };

  const statusLabels: Record<AppStatus, string> = {
    submitted: "Submitted",
    pending_payment: "Pending Payment",
    paid: "Payment Completed",
    issued: "Visa Issued",
    rejected: "Rejected",
  };

  const stepOrder: AppStatus[] = ["submitted", "paid", "issued"];
  const activeIndex = Math.max(
    0,
    stepOrder.findIndex((s) => (overallStatus === "rejected" ? s === "issued" : s === overallStatus))
  );

  const timelineSteps = [
    { key: "submitted" as const, label: "Application Submitted", desc: "Documents received and under review", icon: FileText },
    { key: "paid" as const, label: "Payment Confirmed", desc: "Payment processed successfully", icon: CreditCard },
    { key: "issued" as const, label: "Visa Issued", desc: "Your visa is ready for download", icon: CheckCircle2 },
  ];

  const sc = statusColor[overallStatus];

  return (
    <div className="space-y-6">
      <Link
        href="/account/applications"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to applications
      </Link>

      {/* ─── Status header card ─── */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r from-slate-50 via-white to-emerald-50/30 px-6 py-5 border-b border-slate-100 gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 rounded-full border ${sc.border} ${sc.bg} px-3.5 py-1.5 text-xs font-semibold ${sc.text}`}>
                {overallStatus === "rejected" ? <AlertCircle className="h-3.5 w-3.5" /> : overallStatus === "issued" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                {statusLabels[overallStatus]}
              </span>
              {extraFastSelected && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                  <Zap className="h-3 w-3" /> Extra Fast
                </span>
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-slate-600">
              <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-slate-400" />{plan.country || "—"}</span>
              <span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-slate-400" />{plan.visa || "—"}</span>
              <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-slate-400" />{applicantsCount} applicant{applicantsCount > 1 ? "s" : ""}</span>
            </div>
          </div>

          {overallStatus === "pending_payment" && (
            <button
              onClick={() => {
                window.location.href = `/apply/payment?appId=${encodeURIComponent(id || "")}&amount=${encodeURIComponent(grandTotal)}`;
              }}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(5,150,105,0.25)] transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-[0_16px_32px_rgba(5,150,105,0.3)] active:translate-y-0"
            >
              <CreditCard className="h-4 w-4" />
              Pay Now
            </button>
          )}
        </div>

        <div className="grid gap-px bg-slate-100 sm:grid-cols-4">
          {[
            { label: "Tracking ID", value: trackingId, mono: true },
            { label: "Created", value: createdStr },
            { label: "Last Updated", value: updatedStr },
            { label: "Total Amount", value: `$${grandTotal.toFixed(2)} USD`, highlight: true },
          ].map((item) => (
            <div key={item.label} className="bg-white px-5 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{item.label}</p>
              <p className={`mt-1 text-sm font-semibold ${item.highlight ? "text-emerald-600" : "text-slate-900"} ${item.mono ? "font-mono" : ""}`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Timeline ─── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-5">Application Journey</h2>
        <div className="relative">
          {/* Progress line */}
          <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-slate-100 sm:hidden" />

          <div className="flex flex-col gap-6 sm:flex-row sm:gap-0">
            {timelineSteps.map((step, index) => {
              const sIndex = stepOrder.indexOf(step.key);
              const isDone = activeIndex > sIndex;
              const isActive = activeIndex === sIndex;
              const Icon = step.icon;
              return (
                <div key={step.key} className="flex flex-1 items-start gap-4 sm:flex-col sm:items-center sm:text-center relative">
                  {/* Connector line (desktop) */}
                  {index < timelineSteps.length - 1 && (
                    <div className={`hidden sm:block absolute top-[18px] left-[calc(50%+20px)] right-[calc(-50%+20px)] h-0.5 ${isDone ? "bg-emerald-400" : "bg-slate-100"}`} />
                  )}
                  <div className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    isDone ? "border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-200" :
                    isActive ? "border-emerald-500 bg-white text-emerald-600 shadow-md shadow-emerald-100 ring-4 ring-emerald-50" :
                    "border-slate-200 bg-white text-slate-400"
                  }`}>
                    {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 sm:mt-3">
                    <p className={`text-sm font-semibold ${isDone || isActive ? "text-slate-900" : "text-slate-400"}`}>{step.label}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Pricing breakdown ─── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Pricing Breakdown</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">{plan.visa || "Visa"} × {applicantsCount}</span>
            <span className="font-semibold text-slate-900">${(planPrice * applicantsCount).toFixed(2)}</span>
          </div>
          {extraFastSelected && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                Extra Fast Processing × {applicantsCount}
              </span>
              <span className="font-semibold text-amber-700">${(extraFastFee * applicantsCount).toFixed(2)}</span>
            </div>
          )}
          <div className="border-t border-dashed border-slate-200 pt-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-900">Total</span>
            <span className="text-lg font-bold text-emerald-600">${grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* ─── Applicants ─── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Applicants</h2>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
            <Users className="h-3.5 w-3.5" />
            {applicantsArr.length} applicant{applicantsArr.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="space-y-3">
          {applicantsArr.map((a: any, idx: number) => {
            const firstName = a.firstName || "";
            const lastName = a.lastName || "";
            const name = [firstName, lastName].filter(Boolean).join(" ").trim() || (a?.name ?? `Applicant ${idx + 1}`);
            const rawStatus = a?.status ?? a?.appStatus ?? a?.applicationStatus ?? getApplicantRawStatusAt(data, idx) ?? data?.status;
            const appStatus = mapStatus(rawStatus);
            const sc2 = statusColor[appStatus];
            const visaUrl = a?.visaFile?.url ?? a?.visa_file?.url ?? null;
            return (
              <div key={idx} className="rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50/80 to-white p-4 transition hover:shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                      {initials(firstName, lastName)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{name}</p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 mt-0.5">
                        {a.passportNumber && (
                          <p className="text-xs text-slate-500">Passport: <span className="font-medium text-slate-700">{a.passportNumber}</span></p>
                        )}
                        {a.email && <p className="text-xs text-slate-500">{a.email}</p>}
                        {a.tentativeTravelDate && (
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" /> {a.tentativeTravelDate}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border ${sc2.border} ${sc2.bg} px-3 py-1 text-xs font-semibold ${sc2.text}`}>
                      {appStatus === "issued" ? <CheckCircle2 className="h-3.5 w-3.5" /> : appStatus === "rejected" ? <AlertCircle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                      {statusLabels[appStatus]}
                    </span>
                    {visaUrl && (
                      <a href={visaUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm transition">
                        <Download className="h-3.5 w-3.5" />
                        Download Visa
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Documents ─── */}
      {data.documents && Array.isArray(data.documents) && data.documents.some((d: any) => (d?.passport?.length || d?.photo?.length || d?.ticket?.length)) && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-5">Uploaded Documents</h2>
          <div className="space-y-5">
            {data.documents.map((docSet: any, dIdx: number) => {
              const applicantName = applicantsArr[dIdx]
                ? [applicantsArr[dIdx].firstName, applicantsArr[dIdx].lastName].filter(Boolean).join(" ") || `Applicant ${dIdx + 1}`
                : `Applicant ${dIdx + 1}`;
              const passport = docSet?.passport || [];
              const photo = docSet?.photo || [];
              const ticket = docSet?.ticket || [];
              const extractUrl = (item: any): string => {
                if (typeof item === "string") return item;
                if (item && typeof item === "object" && item.url) return item.url;
                return "";
              };
              const extractType = (item: any): string => {
                if (item && typeof item === "object" && item.type) return item.type;
                return "";
              };
              const allDocs = [
                ...passport.map((item: any) => ({ url: extractUrl(item), label: "Passport", fileType: extractType(item) })),
                ...photo.map((item: any) => ({ url: extractUrl(item), label: "Photo", fileType: extractType(item) })),
                ...ticket.map((item: any) => ({ url: extractUrl(item), label: "Travel ticket", fileType: extractType(item) })),
              ].filter((d) => d.url);
              if (allDocs.length === 0) return null;
              return (
                <div key={dIdx} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                  <p className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">
                      {initials(applicantsArr[dIdx]?.firstName, applicantsArr[dIdx]?.lastName)}
                    </span>
                    {applicantName}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {allDocs.map((d: { url: string; label: string; fileType: string }, i: number) => {
                      const isImage = /\.(jpg|jpeg|png|gif|webp|bmp|svg)/i.test(d.url) || d.fileType.startsWith("image/");
                      const isPdf = /\.pdf/i.test(d.url) || d.fileType === "application/pdf";
                      return (
                        <a
                          key={i}
                          href={d.url}
                          target="_blank"
                          rel="noreferrer"
                          className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-emerald-200 transition-all"
                        >
                          <div className="aspect-[4/3] bg-slate-50 flex items-center justify-center">
                            {isImage ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={d.url}
                                alt={d.label}
                                className="h-full w-full object-cover transition group-hover:scale-105"
                              />
                            ) : isPdf ? (
                              <div className="flex flex-col items-center gap-1.5">
                                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-50 border border-red-200">
                                  <span className="text-[11px] font-black text-red-600">PDF</span>
                                </div>
                                <span className="text-[10px] text-slate-500 font-medium">Click to view</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-1">
                                <Download className="h-6 w-6 text-slate-400" />
                                <span className="text-[10px] text-slate-500">File</span>
                              </div>
                            )}
                          </div>
                          <div className="px-2.5 py-2 border-t border-slate-100">
                            <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">{d.label}{isPdf ? " (PDF)" : ""}</p>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
