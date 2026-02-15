"use client";

import { useEffect, useMemo, useState, ChangeEvent } from "react";
import { db, storage } from "@/lib/firebaseClient";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "sonner";
import {
  X,
  UploadCloud,
  FileText,
  Loader2,
  Users,
  Mail,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

type StatusType =
  | "draft"
  | "pending"
  | "submitted"
  | "paid"
  | "processing"
  | "issued"
  | "rejected";

type DocKind = "passport" | "photo" | "ticket";

type UploadedDoc = {
  name: string;
  url: string;
  path: string;
  size?: number;
  type?: string;
  uploadedAt?: string;
};

type ApplicantUploadedDocs = Record<DocKind, UploadedDoc[]>;

interface ApplicationDrawerProps {
  open: boolean;
  appId: string | null;
  onClose: () => void;
  onStatusChanged?: () => void; // ✅ optional (refresh table)
}

type ApplicantEmailTarget = {
  name: string;
  email: string;
  phone?: string;
  nationality?: string;
  passportNumber?: string;
  status?: StatusType; // ✅ per-applicant status
  visaFile?: UploadedDoc | null; // ✅ per-applicant visa
  raw?: any;
};

function safeStr(v: any) {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

function formatBytes(bytes?: number) {
  const b = Number(bytes || 0);
  if (!b) return "";
  const kb = b / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(2)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(2)} GB`;
}

function isImageFile(file: UploadedDoc) {
  const url = safeStr(file?.url);
  const cleanUrl = url.split("?")[0];
  return (
    /\.(png|jpe?g|webp|gif)$/i.test(cleanUrl) ||
    safeStr(file?.type).startsWith("image/")
  );
}

function compactName(first?: string, last?: string) {
  return [first, last].filter(Boolean).join(" ").trim();
}

function initials(name: string) {
  const parts = name.split(" ").filter(Boolean);
  const a = parts[0]?.[0] || "A";
  const b = parts[1]?.[0] || "";
  return (a + b).toUpperCase();
}

function normalizeDocuments(docs: any): ApplicantUploadedDocs[] {
  if (Array.isArray(docs)) return docs as ApplicantUploadedDocs[];

  if (docs && typeof docs === "object") {
    const keys = Object.keys(docs);
    const hasNumeric = keys.some((k) => String(Number(k)) === k);
    if (hasNumeric) {
      const arr: ApplicantUploadedDocs[] = [];
      keys
        .sort((a, b) => Number(a) - Number(b))
        .forEach((k) => arr.push(docs[k]));
      return arr;
    }

    if ("passport" in docs || "photo" in docs || "ticket" in docs) {
      return [docs as ApplicantUploadedDocs];
    }
  }

  return [];
}
function normalizeApplicants(applicants: any): any[] {
  if (Array.isArray(applicants)) return applicants;

  if (applicants && typeof applicants === "object") {
    const keys = Object.keys(applicants);
    const hasNumeric = keys.some((k) => String(Number(k)) === k);

    if (hasNumeric) {
      return keys
        .sort((a, b) => Number(a) - Number(b))
        .map((k) => applicants[k]);
    }
  }

  return [];
}


// ✅ Derive overall status from per-applicant statuses (Rule A)
function computeOverallStatus(statuses: StatusType[]): StatusType {
  if (statuses.some((s) => s === "rejected")) return "rejected";
  if (statuses.length > 0 && statuses.every((s) => s === "issued")) return "issued";
  if (statuses.some((s) => s === "processing")) return "processing";
  if (statuses.some((s) => s === "paid")) return "paid";
  if (statuses.some((s) => s === "submitted")) return "submitted";
  if (statuses.some((s) => s === "pending")) return "pending";
  return "draft";
}


/**
 * POST /api/email/application-status
 * - send to ONE applicant or MANY (we just pass one in applicants[])
 */
async function sendStatusEmail(payload: {
  applicationId: string;
  trackingId: string;
  status: StatusType;
  previousStatus?: StatusType;
  applicants: Array<{
    name: string;
    email: string;
    phone?: string;
    nationality?: string;
    passportNumber?: string;
  }>;
  plan?: any;
  visaFileUrl?: string; // ✅ pass visa url when issued
}) {
  const res = await fetch("/api/email/application-status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Email request failed");
  }

  return res.json().catch(() => ({}));
}

export default function ApplicationDrawer({
  open,
  appId,
  onClose,
  onStatusChanged,
}: ApplicationDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [uploadingVisa, setUploadingVisa] = useState(false);

  const [data, setData] = useState<any | null>(null);

  // ✅ overall derived status (still stored for backward compatibility)
  const [status, setStatus] = useState<StatusType>("draft");

  // legacy visaFile (root). We will keep it, but per-applicant visa is source of truth.
  const [visaFile, setVisaFile] = useState<any | null>(null);

  const [activeApplicantIdx, setActiveApplicantIdx] = useState(0);

  useEffect(() => {
    if (!open || !appId) return;

    const load = async () => {
      setLoading(true);
      try {
        const refDoc = doc(db, "applications", appId);
        const snap = await getDoc(refDoc);

        if (!snap.exists()) {
          toast.error("Application not found");
          return;
        }

        const d = snap.data() as any;

        // normalize docs into array
        const documentsArray = normalizeDocuments(d.documents);
        d.documents = documentsArray;

        // ✅ ensure applicants exists + each applicant has status + visaFile
      const applicantsArr = normalizeApplicants(d.applicants);

        const normalizedApplicants = applicantsArr.map((a: any) => ({
          ...a,
          status: (a?.status as StatusType) || "draft",
          visaFile: a?.visaFile || null,
        }));
        d.applicants = normalizedApplicants;

        const derivedOverall = computeOverallStatus(
          normalizedApplicants.map(
            (a: any) => (a?.status as StatusType) || "draft",
          ),
        );

        setData({ id: snap.id, ...d });
        setStatus(derivedOverall || (d.status as StatusType) || "draft");
        setVisaFile(d.visaFile || null);

        setActiveApplicantIdx(0);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load application");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open, appId]);

  const createdAt = useMemo(() => {
    if (!data?.createdAt) return "";
    const v = data.createdAt;
    const dt = new Date(v.seconds ? v.seconds * 1000 : v);
    return dt.toLocaleString();
  }, [data]);

  const applicants = useMemo<ApplicantEmailTarget[]>(() => {
    const arr = Array.isArray(data?.applicants) ? data.applicants : [];
    return arr.map((a: any) => ({
      name: compactName(a?.firstName, a?.lastName) || safeStr(a?.name) || "Applicant",
      email: safeStr(a?.email),
      phone: safeStr(a?.phone),
      nationality: safeStr(a?.nationality),
      passportNumber: safeStr(a?.passportNumber),
      status: (a?.status as StatusType) || "draft",
      visaFile: a?.visaFile || null,
      raw: a,
    }));
  }, [data]);

  const documentsByApplicant: ApplicantUploadedDocs[] = useMemo(() => {
    const arr = Array.isArray(data?.documents) ? data.documents : [];
    return arr;
  }, [data]);

  const currentDocs: ApplicantUploadedDocs | null = useMemo(() => {
    return documentsByApplicant?.[activeApplicantIdx] || null;
  }, [documentsByApplicant, activeApplicantIdx]);

  const docsCounts = useMemo(() => {
    const arr = documentsByApplicant || [];
    return arr.map((d) => ({
      passport: (d?.passport || []).length,
      photo: (d?.photo || []).length,
      ticket: (d?.ticket || []).length,
    }));
  }, [documentsByApplicant]);

  const trackingId = safeStr(data?.trackingId || data?.id || appId || "");

  const close = () => {
    if (loading || savingStatus || uploadingVisa || sendingEmail) return;
    onClose();
  };

  const safeStatusBadge = (s: StatusType) => {
    const base = "rounded-full px-2 py-0.5 text-[10px] capitalize";
    if (s === "issued") return `${base} bg-[#DEE05B]/20 text-[#DEE05B]`;
    if (s === "paid") return `${base} bg-emerald-500/20 text-emerald-300`;
    if (s === "pending") return `${base} bg-amber-500/20 text-amber-300`;
    if (s === "processing") return `${base} bg-sky-500/20 text-sky-200`;
    if (s === "rejected") return `${base} bg-rose-500/20 text-rose-200`;
    if (s === "submitted") return `${base} bg-violet-500/20 text-violet-200`;
    return `${base} bg-slate-700/40 text-slate-300`;
  };

  // ✅ Send email to a specific subset (usually ONE applicant)
  const triggerEmailForSpecificApplicants = async (args: {
    nextStatus: StatusType;
    prevStatus?: StatusType;
    recipients: ApplicantEmailTarget[];
    visaFileUrl?: string;
  }) => {
    const { nextStatus, prevStatus, recipients, visaFileUrl } = args;

    const valid = recipients.filter(
      (a): a is ApplicantEmailTarget & { email: string } =>
        typeof a.email === "string" && a.email.trim().length > 0,
    );

    if (valid.length === 0) return;

    setSendingEmail(true);
    try {
      await sendStatusEmail({
        applicationId: appId!,
        trackingId,
        status: nextStatus,
        previousStatus: prevStatus,
        applicants: valid.map((a) => ({
          name: a.name,
          email: a.email,
          phone: a.phone,
          nationality: a.nationality,
          passportNumber: a.passportNumber,
        })),
        plan: data?.plan || null,
        visaFileUrl: visaFileUrl || undefined,
      });

      toast.success(valid.length === 1 ? "Email sent to applicant" : "Emails sent");
    } catch (e) {
      console.error(e);
      toast.error("Status updated, but email failed to send");
    } finally {
      setSendingEmail(false);
    }
  };

  // ===================== UPDATE PER-APPLICANT STATUS =====================
const handleApplicantStatusSave = async (idx: number, value: StatusType) => {
  if (!appId || !data) return;

  const currentApplicants = normalizeApplicants(data.applicants);
  const prevApplicant = (currentApplicants?.[idx]?.status as StatusType) || "draft";
  if (value === prevApplicant) return;

  setSavingStatus(true);
  try {
    const refDoc = doc(db, "applications", appId);

    const updatedApplicants = [...currentApplicants];
    updatedApplicants[idx] = { ...updatedApplicants[idx], status: value };

    const derivedOverall = computeOverallStatus(
      updatedApplicants.map((a: any) => (a?.status as StatusType) || "draft"),
    );

    // ✅ single write, and forces array shape
    await updateDoc(refDoc, {
      applicants: updatedApplicants,
      status: derivedOverall,
      updatedAt: serverTimestamp(),
    });

    setData((prev: any) =>
      prev ? { ...prev, applicants: updatedApplicants, status: derivedOverall } : prev,
    );
    setStatus(derivedOverall);

    toast.success("Applicant status updated");
    onStatusChanged?.();

    // ✅ email ONLY that applicant
    const recipient = applicants[idx];
    if (recipient) {
      await triggerEmailForSpecificApplicants({
        nextStatus: value,
        prevStatus: prevApplicant,
        recipients: [recipient],
        visaFileUrl:
          value === "issued" ? (recipient?.visaFile?.url || undefined) : undefined,
      });
    }
  } catch (e) {
    console.error(e);
    toast.error("Failed to update applicant status");
  } finally {
    setSavingStatus(false);
  }
};


  // ===================== BULK SET ALL APPLICANTS STATUS =====================
  const handleSetAllApplicantsStatus = async (value: StatusType) => {
    if (!appId || !data) return;

    setSavingStatus(true);
    try {
      const arr = Array.isArray(data.applicants) ? data.applicants : [];
      const updatedApplicants = arr.map((a: any) => ({ ...a, status: value }));

      const derivedOverall = computeOverallStatus(
        updatedApplicants.map((a: any) => (a?.status as StatusType) || "draft"),
      );

      await updateDoc(doc(db, "applications", appId), {
        applicants: updatedApplicants,
        status: derivedOverall,
        updatedAt: serverTimestamp(),
      });

      setData((prev: any) =>
        prev
          ? { ...prev, applicants: updatedApplicants, status: derivedOverall }
          : prev,
      );
      setStatus(derivedOverall);

      toast.success("All applicants updated");
      onStatusChanged?.();

      // ⚠️ No email blast by default (avoids spamming)
    } catch (e) {
      console.error(e);
      toast.error("Failed to update all applicants");
    } finally {
      setSavingStatus(false);
    }
  };

  // ===================== VISA FILE UPLOAD (PER APPLICANT) =====================
  const handleVisaUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!appId || !data) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const idx = activeApplicantIdx;

    setUploadingVisa(true);
    try {
      const prevApplicantStatus =
        (data?.applicants?.[idx]?.status as StatusType) || "draft";

      const path = `applications/${appId}/applicant_${idx}/visa/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, path);

      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      const meta: UploadedDoc = {
        name: file.name,
        url,
        path,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
      };

      const arr = Array.isArray(data.applicants) ? data.applicants : [];
      const updatedApplicants = [...arr];

      // ✅ ONLY selected applicant gets visa + issued
      updatedApplicants[idx] = {
        ...updatedApplicants[idx],
        visaFile: meta,
        status: "issued" as StatusType,
      };

      const derivedOverall = computeOverallStatus(
        updatedApplicants.map((a: any) => (a?.status as StatusType) || "draft"),
      );

      // Backward compatibility:
      // root visaFile should ONLY be set when all issued
      const rootUpdate: any = {
        applicants: updatedApplicants,
        status: derivedOverall,
        updatedAt: serverTimestamp(),
      };

      if (derivedOverall === "issued") {
        rootUpdate.visaFile = meta;
      }

      await updateDoc(doc(db, "applications", appId), rootUpdate);

      // local state
      setData((prev: any) =>
        prev
          ? {
              ...prev,
              applicants: updatedApplicants,
              status: derivedOverall,
              ...(derivedOverall === "issued" ? { visaFile: meta } : {}),
            }
          : prev,
      );
      setStatus(derivedOverall);

      if (derivedOverall === "issued") setVisaFile(meta);

      toast.success("Visa uploaded for selected applicant");
      onStatusChanged?.();

      // ✅ email ONLY this applicant + include visa url
      const recipient = applicants[idx];
      if (recipient) {
        await triggerEmailForSpecificApplicants({
          nextStatus: "issued",
          prevStatus: prevApplicantStatus,
          recipients: [recipient],
          visaFileUrl: meta.url,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Visa upload failed");
    } finally {
      setUploadingVisa(false);
      e.target.value = "";
    }
  };

  // ✅ show selected applicant visa first; fallback to root legacy
  const selectedApplicantVisa = applicants?.[activeApplicantIdx]?.visaFile || null;
  const displayVisa: UploadedDoc | null =
    (selectedApplicantVisa as any) || (visaFile as any) || null;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* overlay */}
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={close} />

      {/* drawer */}
      <div className="relative w-full max-w-xl bg-[#050818] text-slate-100 shadow-xl border-l border-white/10 flex flex-col">
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
              Application Details
            </p>

            <div className="flex items-center gap-2 mt-1">
              <h2 className="text-sm font-semibold">{trackingId}</h2>
              <span className={safeStatusBadge(status)}>{status}</span>
            </div>

            {createdAt && (
              <p className="text-[10px] text-slate-500 mt-0.5">
                Created: {createdAt}
              </p>
            )}
          </div>

          <button
            onClick={close}
            className="h-8 w-8 inline-flex items-center justify-center rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {/* STATUS SECTION */}
          <section className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                  Overall status
                </p>
                <p className="text-xs mt-1">
                  Derived:{" "}
                  <span className="font-semibold capitalize">{status}</span>
                </p>

                <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-500">
                  <Users className="h-3.5 w-3.5" />
                  <span>
                    Applicants:{" "}
                    <span className="text-slate-300 font-semibold">
                      {applicants.length}
                    </span>
                  </span>

                  {(savingStatus || sendingEmail) && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-slate-900/60 px-2 py-0.5 text-[10px] text-slate-300">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      {savingStatus ? "Saving…" : "Sending email…"}
                    </span>
                  )}
                </div>
              </div>

              {/* Bulk helper */}
<select
  value={applicants[activeApplicantIdx]?.status || "draft"}
  onChange={(e) =>
    handleApplicantStatusSave(activeApplicantIdx, e.target.value as StatusType)
  }
  disabled={savingStatus || sendingEmail || uploadingVisa}
  className="h-8 rounded-full bg-slate-900 border border-white/15 text-[11px] px-3 outline-none"
  title="Updates selected applicant only (email goes to selected applicant)"
>
  <option value="draft">Draft</option>
  <option value="pending">Pending</option>
  <option value="submitted">Submitted</option>
  <option value="paid">Paid</option>
  <option value="processing">Processing</option>
  <option value="issued">Issued</option>
  <option value="rejected">Rejected</option>
</select>


            </div>

            {/* VISA UPLOAD */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <div className="flex items-center gap-2">
                <UploadCloud className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-[11px] font-semibold text-slate-200">
                    Visa File (Selected applicant)
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Upload final visa (PDF / image) for{" "}
                    <span className="text-slate-200 font-semibold">
                      {applicants?.[activeApplicantIdx]?.name || "Applicant"}
                    </span>
                  </p>
                </div>
              </div>

              <label className="inline-flex items-center justify-center rounded-full bg-[#DEE05B] text-slate-900 text-[11px] font-semibold px-3 py-1.5 cursor-pointer hover:bg-[#f1f48b]">
                {uploadingVisa ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                    Uploading…
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-3.5 w-3.5 mr-1" />
                    {displayVisa ? "Replace" : "Upload"}
                  </>
                )}
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  className="hidden"
                  onChange={handleVisaUpload}
                />
              </label>
            </div>

            {/* VISA CARD (shows selected applicant’s visa first) */}
            {displayVisa && (
              <div className="mt-3 rounded-xl bg-slate-900/70 px-3 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-3.5 w-3.5 text-slate-300" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold truncate">
                      {displayVisa.name}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {formatBytes(displayVisa.size)}{" "}
                      {displayVisa.uploadedAt
                        ? `• ${new Date(displayVisa.uploadedAt).toLocaleString()}`
                        : ""}
                    </p>
                  </div>
                </div>

                <a
                  href={displayVisa.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-[#DEE05B] underline whitespace-nowrap"
                >
                  View
                </a>
              </div>
            )}
          </section>

          {/* APPLICANTS (Tabs) */}
          <section className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                Applicants
              </p>

              <div className="inline-flex items-center gap-2 text-[10px] text-slate-500">
                <Mail className="h-3.5 w-3.5" />
                <span>Emails are sent only to the selected applicant</span>
              </div>
            </div>

            {applicants.length === 0 ? (
              <p className="mt-3 text-[11px] text-slate-500">
                No applicants found.
              </p>
            ) : (
              <>
                <div className="mt-3 flex flex-wrap gap-2">
                  {applicants.map((a, idx) => {
                    const selected = idx === activeApplicantIdx;
                    const counts = docsCounts[idx] || {
                      passport: 0,
                      photo: 0,
                      ticket: 0,
                    };
                    const totalDocs = counts.passport + counts.photo + counts.ticket;

                    const hasVisa = !!a.visaFile?.url;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveApplicantIdx(idx)}
                        className={[
                          "group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] transition",
                          selected
                            ? "border-[#DEE05B]/40 bg-[#DEE05B]/10 text-[#DEE05B]"
                            : "border-white/10 bg-slate-900/40 text-slate-200 hover:border-white/20",
                        ].join(" ")}
                      >
                        <span
                          className={[
                            "h-6 w-6 rounded-full grid place-items-center text-[10px] font-bold",
                            selected
                              ? "bg-[#DEE05B] text-slate-900"
                              : "bg-slate-800 text-slate-200",
                          ].join(" ")}
                        >
                          {initials(a.name)}
                        </span>

                        <span className="max-w-[140px] truncate">{a.name}</span>

                        <span className="rounded-full border border-white/10 bg-slate-950/50 px-2 py-0.5 text-[10px] text-slate-300">
                          {totalDocs} docs
                        </span>

                        <span className={safeStatusBadge(a.status || "draft")}>
                          {a.status || "draft"}
                        </span>

                        {/* ✅ tiny visa indicator */}
                        {hasVisa && (
                          <span className="rounded-full border border-[#DEE05B]/30 bg-[#DEE05B]/10 px-2 py-0.5 text-[10px] text-[#DEE05B]">
                            visa
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Applicant quick info */}
                <div className="mt-4 grid grid-cols-2 gap-3 text-[11px]">
                  <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3">
                    <p className="text-slate-500">Name</p>
                    <p className="text-slate-100 font-semibold truncate">
                      {applicants[activeApplicantIdx]?.name}
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3">
                    <p className="text-slate-500">Email</p>
                    <p className="text-slate-100 font-semibold truncate">
                      {applicants[activeApplicantIdx]?.email || "—"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3">
                    <p className="text-slate-500">Phone</p>
                    <p className="text-slate-100 font-semibold truncate">
                      {applicants[activeApplicantIdx]?.phone || "—"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3">
                    <p className="text-slate-500">Nationality</p>
                    <p className="text-slate-100 font-semibold truncate">
                      {applicants[activeApplicantIdx]?.nationality || "—"}
                    </p>
                  </div>
                </div>

                {/* ✅ Per-applicant status control */}
                <div className="mt-3 rounded-xl border border-white/10 bg-slate-900/40 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                        Applicant status
                      </p>
                      <p className="text-[11px] text-slate-300 mt-1">
                        Updates this applicant only. Email goes only to this applicant.
                      </p>
                    </div>

                    <select
                      value={applicants[activeApplicantIdx]?.status || "draft"}
                      onChange={(e) =>
                        handleApplicantStatusSave(
                          activeApplicantIdx,
                          e.target.value as StatusType,
                        )
                      }
                      disabled={savingStatus || sendingEmail || uploadingVisa}
                      className="h-8 rounded-full bg-slate-900 border border-white/15 text-[11px] px-3 outline-none"
                    >
                      <option value="draft">Draft</option>
                      <option value="pending">Pending</option>
                      <option value="submitted">Submitted</option>
                      <option value="paid">Paid</option>
                      <option value="processing">Processing</option>
                      <option value="issued">Issued</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  {/* ✅ Per applicant visa button */}
                  {applicants?.[activeApplicantIdx]?.visaFile?.url && (
                    <div className="mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[#DEE05B]" />
                        <div>
                          <p className="text-[11px] font-semibold text-slate-200">
                            Visa available for this applicant
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {safeStr(applicants[activeApplicantIdx]?.visaFile?.name)}
                          </p>
                        </div>
                      </div>

                      <a
                        href={safeStr(applicants[activeApplicantIdx]?.visaFile?.url)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#DEE05B] px-3 py-1 text-[10px] font-semibold text-slate-900 hover:bg-[#f1f48b]"
                        title="Open visa"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Open
                      </a>
                    </div>
                  )}
                </div>
              </>
            )}
          </section>

          {/* DOCUMENTS PER APPLICANT */}
          <section className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 space-y-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
              Documents •{" "}
              {applicants[activeApplicantIdx]?.name ||
                `Applicant ${activeApplicantIdx + 1}`}
            </p>

            {!currentDocs ? (
              <p className="text-[11px] text-slate-500">No documents found.</p>
            ) : (
              <div className="space-y-4">
                {(["photo", "passport", "ticket"] as DocKind[]).map((kind) => {
                  const files = currentDocs?.[kind] || [];
                  if (!Array.isArray(files) || files.length === 0) return null;

                  return (
                    <div key={kind} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-semibold capitalize text-slate-300">
                          {kind}
                        </p>
                        <span className="text-[10px] text-slate-500">
                          {files.length} file{files.length > 1 ? "s" : ""}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {files.map((file: UploadedDoc, i: number) => {
                          const url = safeStr(file?.url);
                          const name = safeStr(file?.name || "File");
                          const path = safeStr(file?.path || "");
                          const shortPath =
                            path.length > 28 ? `${path.slice(0, 28)}…` : path || "—";
                          const img = isImageFile(file);

                          return (
                            <div
                              key={i}
                              className="rounded-xl bg-slate-900/60 p-3 flex items-center justify-between gap-3 border border-white/5 hover:border-white/10 transition"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                {img ? (
                                  <img
                                    src={url}
                                    alt={name}
                                    className="h-10 w-10 shrink-0 object-cover rounded-md border border-white/10"
                                  />
                                ) : (
                                  <div className="h-10 w-10 shrink-0 rounded-md border border-white/10 bg-slate-900/60 grid place-items-center">
                                    <FileText className="h-4 w-4 text-slate-300" />
                                  </div>
                                )}

                                <div className="min-w-0">
                                  <p className="text-[11px] font-semibold text-slate-200 truncate">
                                    {name}
                                  </p>
                                  <p className="text-[10px] text-slate-500 truncate">
                                    {shortPath}
                                  </p>
                                  {(file?.size || 0) > 0 && (
                                    <p className="text-[10px] text-slate-500">
                                      {formatBytes(file.size)}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <a
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-[#DEE05B] font-semibold underline whitespace-nowrap shrink-0"
                              >
                                Open
                              </a>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {(["photo", "passport", "ticket"] as DocKind[]).every(
                  (k) => !(currentDocs?.[k] || []).length,
                ) && (
                  <p className="text-[11px] text-slate-500">
                    No documents uploaded.
                  </p>
                )}
              </div>
            )}
          </section>

          {/* tiny safety note */}
          {status === "rejected" && (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-[11px] text-rose-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <div>
                  <p className="font-semibold">Rejected status present</p>
                  <p className="mt-1 text-rose-200/80">
                    Overall status becomes rejected if any applicant is rejected.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* footer spacing */}
        <div className="h-3" />
      </div>
    </div>
  );
}
