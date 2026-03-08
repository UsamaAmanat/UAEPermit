"use client";

import { useEffect, useState, useMemo, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth, db, storage } from "@/lib/firebaseClient";
import { doc, getDoc, onSnapshot, updateDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import AdminLayout from "@/components/admin/AdminLayout";
import { isAdminEmail } from "@/lib/authConstants";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  UploadCloud,
  FileText,
  Users,
  Mail,
  CheckCircle2,
} from "lucide-react";

type StatusType = "draft" | "pending" | "submitted" | "paid" | "processing" | "issued" | "rejected";

function compactName(first?: string, last?: string) {
  return [first, last].filter(Boolean).join(" ").trim();
}

function safeStr(v: any) {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

function normalizeDocuments(docs: any): any[] {
  if (Array.isArray(docs)) return docs;
  if (docs && typeof docs === "object") {
    const keys = Object.keys(docs);
    const hasNumeric = keys.some((k) => String(Number(k)) === k);
    if (hasNumeric) return keys.sort((a, b) => Number(a) - Number(b)).map((k) => docs[k]);
    if ("passport" in docs || "photo" in docs || "ticket" in docs) return [docs];
  }
  return [];
}

function normalizeApplicants(applicants: any): any[] {
  if (Array.isArray(applicants)) return applicants;
  if (applicants && typeof applicants === "object") {
    const keys = Object.keys(applicants);
    if (keys.some((k) => String(Number(k)) === k)) {
      return keys.sort((a, b) => Number(a) - Number(b)).map((k) => applicants[k]);
    }
  }
  return [];
}

function computeOverallStatus(statuses: StatusType[]): StatusType {
  if (statuses.some((s) => s === "rejected")) return "rejected";
  if (statuses.length > 0 && statuses.every((s) => s === "issued")) return "issued";
  if (statuses.some((s) => s === "processing")) return "processing";
  if (statuses.some((s) => s === "paid")) return "paid";
  if (statuses.some((s) => s === "submitted")) return "submitted";
  if (statuses.some((s) => s === "pending")) return "pending";
  return "draft";
}

async function sendStatusEmail(payload: {
  applicationId: string;
  trackingId: string;
  status: StatusType;
  applicants: Array<{ 
    name: string; 
    email: string;
    passportNumber?: string;
    nationality?: string;
  }>;
  plan?: any;
  visaFileUrl?: string;
}) {
  const res = await fetch("/api/email/application-status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text().catch(() => "Email failed"));
}

export default function AdminApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [internalNotes, setInternalNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [uploadingVisa, setUploadingVisa] = useState<number | null>(null);
        console.log("data", data);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setChecking(false);
        router.replace("/login");
        return;
      }
      if (!isAdminEmail(currentUser.email)) {
        setUser(null);
        setChecking(false);
        router.replace("/login");
        return;
      }
      setUser(currentUser);
      setChecking(false);

    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, "applications", id), (snap) => {
      if (!snap.exists()) {
        setData(null);
        setLoading(false);
        return;
      }
      const d = snap.data() as any;
      setInternalNotes((d?.internalNotes ?? "").toString());
      setData({ id: snap.id, ...d });
      setLoading(false);
    }, (err) => {
      console.error(err);
      setData(null);
      setLoading(false);
    });
    return () => unsub();
  }, [id]);

  const applicants = useMemo(() => {
    const arr = normalizeApplicants(data?.applicants);
    return arr.map((a: any) => ({
      ...a,
      name: compactName(a?.firstName, a?.lastName) || safeStr(a?.name) || "Applicant",
      status: (a?.status as StatusType) || "draft",
    }));
  }, [data]);

  const documentsByApplicant = useMemo(() => {
    return normalizeDocuments(data?.documents) || [];
  }, [data]);

  const trackingId = safeStr(data?.trackingId || data?.id || id);

  const handleSaveNotes = async () => {
    if (!id) return;
    setSavingNotes(true);
    try {
      await updateDoc(doc(db, "applications", id), {
        internalNotes: internalNotes.trim() || null,
        updatedAt: serverTimestamp(),
      });
      toast.success("Notes saved");
    } catch (e) {
      console.error(e);
      toast.error("Failed to save notes");
    } finally {
      setSavingNotes(false);
    }
  };

  const handleApplicantStatusChange = async (idx: number, value: StatusType) => {
    if (!id || !data) return;
    const current = normalizeApplicants(data.applicants);
    const prev = (current[idx]?.status as StatusType) || "draft";
    if (value === prev) return;
    setSavingStatus(true);
    try {
      const updated = [...current];
      updated[idx] = { ...updated[idx], status: value };
      const derived = computeOverallStatus(updated.map((a: any) => (a?.status as StatusType) || "draft"));
      await updateDoc(doc(db, "applications", id), {
        applicants: updated,
        status: derived,
        updatedAt: serverTimestamp(),
      });
      toast.success("Status updated");
      const app = applicants[idx];
      if (app?.email && value !== prev) {
        setSendingEmail(true);
        try {
          await sendStatusEmail({
            applicationId: id,
            trackingId,
            status: value,
            applicants: [{ 
              name: app.name, 
              email: app.email,
              passportNumber: app.passportNumber,
              nationality: app.nationality
            }],
            plan: data?.plan,
            visaFileUrl: value === "issued" ? applicants[idx]?.visaFile?.url : undefined,
          });
          toast.success("Email sent to applicant");
        } catch {
          toast.error("Email failed");
        } finally {
          setSendingEmail(false);
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to update status");
    } finally {
      setSavingStatus(false);
    }
  };

  const handleVisaUpload = async (idx: number, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!id || !data || !file) return;
    setUploadingVisa(idx);
    try {
      const path = `applications/${id}/applicant_${idx}/visa/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      const meta = { name: file.name, url, path, size: file.size, type: file.type, uploadedAt: new Date().toISOString() };
      const current = normalizeApplicants(data.applicants);
      const updated = [...current];
      updated[idx] = { ...updated[idx], visaFile: meta, status: "issued" as StatusType };
      const derived = computeOverallStatus(updated.map((a: any) => (a?.status as StatusType) || "draft"));
      await updateDoc(doc(db, "applications", id), {
        applicants: updated,
        status: derived,
        ...(derived === "issued" ? { visaFile: meta } : {}),
        updatedAt: serverTimestamp(),
      });
      toast.success("Visa uploaded");
      const app = applicants[idx];
      if (app?.email) {
        try {
          await sendStatusEmail({
            applicationId: id,
            trackingId,
            status: "issued",
            applicants: [{ 
              name: app.name, 
              email: app.email,
              passportNumber: app.passportNumber,
              nationality: app.nationality 
            }],
            plan: data?.plan,
            visaFileUrl: url,
          });
        } catch {}
      }
    } catch (err) {
      console.error(err);
      toast.error("Visa upload failed");
    } finally {
      setUploadingVisa(null);
      e.target.value = "";
    }
  };

  const handleTriggerEmail = async (idx: number) => {
    const app = applicants[idx];
    if (!app?.email || !id) return;
    setSendingEmail(true);
    try {
      await sendStatusEmail({
        applicationId: id,
        trackingId,
        status: (app.status as StatusType) || "submitted",
        applicants: [{ 
          name: app.name, 
          email: app.email,
          passportNumber: app.passportNumber,
          nationality: app.nationality
        }],
        plan: data?.plan,
        visaFileUrl: app?.visaFile?.url,
      });
      toast.success("Email sent");
    } catch (e) {
      toast.error("Failed to send email");
    } finally {
      setSendingEmail(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
      </div>
    );
  }
  if (!user) return null;

  return (
    <AdminLayout userEmail={user.email} onLogout={() => signOut(auth)}>
      <div className="space-y-6">
        <Link
          href="/admin/applications"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to applications
        </Link>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
          </div>
        ) : !data ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">
            Application not found.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-lg font-semibold text-slate-900">Application: {trackingId}</h1>
                  <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-800 capitalize">
                    {data.status || "—"}
                  </span>
                  <span className="text-sm text-slate-600">Payment: {(data.paymentStatus || "-").toString()}</span>
                  {data.extraFastSelected && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                      ⚡ Extra Fast Processing
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {data.plan?.country || "—"} · {data.plan?.visa || "—"} · {data.plan?.entry || "—"}
                </p>
              </div>
            </div>

            {/* Plan & Pricing Summary */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50 px-5 py-3">
                <h2 className="text-sm font-semibold text-slate-900">Plan & Pricing Details</h2>
              </div>
              <div className="px-5 py-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
                  <div>
                    <p className="text-xs text-slate-500">Country</p>
                    <p className="font-medium text-slate-900">{data.plan?.country || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Visa Type</p>
                    <p className="font-medium text-slate-900">{data.plan?.visa || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Entry Type</p>
                    <p className="font-medium text-slate-900">{data.plan?.entry || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Price per Applicant</p>
                    <p className="font-medium text-slate-900">$ {data.plan?.price || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Number of Applicants</p>
                    <p className="font-medium text-slate-900">{applicants.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Grand Total</p>
                    <p className="font-semibold text-emerald-700">$ {data.grandTotal ?? "—"}</p>
                  </div>
                  {data.extraFastSelected && (
                    <div>
                      <p className="text-xs text-slate-500">Extra Fast Fee / Applicant</p>
                      <p className="font-medium text-slate-900">$ {data.extraFastFeePerApplicant || "—"}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-slate-500">Tracking ID (nanoid)</p>
                    <p className="font-mono font-medium text-slate-900">{data.trackingId || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Firestore Doc ID</p>
                    <p className="font-mono font-medium text-slate-900">{data.id || id}</p>
                  </div>
                  {data.orderId && (
                    <div>
                      <p className="text-xs text-slate-500">Order / Payment ID</p>
                      <p className="font-mono font-medium text-slate-900">{data.orderId}</p>
                    </div>
                  )}
                  {data.createdAt && (
                    <div>
                      <p className="text-xs text-slate-500">Created At</p>
                      <p className="font-medium text-slate-900">
                        {data.createdAt?.toDate ? data.createdAt.toDate().toLocaleString() : new Date(data.createdAt?.seconds ? data.createdAt.seconds * 1000 : data.createdAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {data.userId && (
                    <div>
                      <p className="text-xs text-slate-500">User ID</p>
                      <p className="font-mono text-xs font-medium text-slate-900">{data.userId}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Internal notes */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900 mb-2">Internal notes</h2>
              <textarea
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Internal notes (not visible to customer)..."
                rows={3}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-600 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="mt-2 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {savingNotes ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save notes
              </button>
            </div>

            {/* Applicants: full details + status + visa upload + trigger email */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Applicants ({applicants.length})
              </h2>
              <ul className="space-y-4">
                {applicants.map((app: any, idx: number) => (
                  <li key={idx} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                    {/* Row 1: Name + actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900 text-base">{app.name}</p>
                        {app.relation && (
                          <span className="inline-block mt-0.5 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                            {app.relation}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={app.status || "draft"}
                          onChange={(e) => handleApplicantStatusChange(idx, e.target.value as StatusType)}
                          disabled={savingStatus || sendingEmail}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500/30"
                        >
                          {(["draft", "pending", "submitted", "paid", "processing", "issued", "rejected"] as const).map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <label className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 cursor-pointer">
                          {uploadingVisa === idx ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />}
                          {app.visaFile?.url ? "Replace visa" : "Upload visa"}
                          <input type="file" accept="application/pdf,image/*" className="hidden" onChange={(e) => handleVisaUpload(idx, e)} />
                        </label>
                        {app.visaFile?.url && (
                          <a
                            href={app.visaFile.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            View visa
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleTriggerEmail(idx)}
                          disabled={sendingEmail || !app.email}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          Send email
                        </button>
                      </div>
                    </div>

                    {/* Row 2: All applicant details grid */}
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm border-t border-slate-200 pt-3">
                      <div>
                        <p className="text-[11px] text-slate-500">Email</p>
                        <p className="font-medium text-slate-900">{app.email || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-500">Phone</p>
                        <p className="font-medium text-slate-900">{app.countryCode || ""}{app.phone || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-500">Nationality</p>
                        <p className="font-medium text-slate-900">{app.nationality || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-500">Applying From</p>
                        <p className="font-medium text-slate-900">{app.applyingFrom || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-500">Passport #</p>
                        <p className="font-mono font-medium text-slate-900">{app.passportNumber || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-500">Profession</p>
                        <p className="font-medium text-slate-900">{app.profession || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-500">Purpose of Travel</p>
                        <p className="font-medium text-slate-900">{app.purposeOfTravel || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-500">Tentative Travel Date</p>
                        <p className="font-medium text-slate-900">{app.tentativeTravelDate || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-500">Date of Birth</p>
                        <p className="font-medium text-slate-900">{app.dob || "—"}</p>
                      </div>
                      {app.passportExpiry && (
                        <div>
                          <p className="text-[11px] text-slate-500">Passport Expiry</p>
                          <p className="font-medium text-slate-900">{app.passportExpiry}</p>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Documents per applicant */}
            {documentsByApplicant.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Uploaded documents
                </h2>
                <div className="space-y-4">
                  {documentsByApplicant.map((docGroup: any, applicantIdx: number) => (
                    <div key={applicantIdx} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                      <p className="text-sm font-semibold text-slate-800 mb-3">
                        Applicant {applicantIdx + 1}: {applicants[applicantIdx]?.name || "—"}
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {(["passport", "photo", "ticket"] as const).map((kind) => {
                          const files = Array.isArray(docGroup?.[kind]) ? docGroup[kind] : [];
                          return files.map((file: any, i: number) => {
                            const url = typeof file === "string" ? file : file?.url;
                            const name = typeof file === "string" ? kind : (file?.name || kind);
                            const fileType = typeof file === "object" ? (file?.type || "") : "";
                            const isImage = url && (/\.(jpg|jpeg|png|gif|webp|bmp|svg)/i.test(url) || fileType.startsWith("image/"));
                            const isPdf = url && (/\.pdf/i.test(url) || fileType === "application/pdf");
                            if (!url) return null;
                            return (
                              <a
                                key={`${kind}-${i}`}
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm hover:shadow-md transition"
                              >
                                <div className="aspect-[4/3] bg-slate-100 flex items-center justify-center">
                                  {isImage ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img
                                      src={url}
                                      alt={`${kind} ${i + 1}`}
                                      className="h-full w-full object-cover transition group-hover:scale-105"
                                    />
                                  ) : isPdf ? (
                                    <div className="flex flex-col items-center gap-1.5">
                                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 border border-red-200">
                                        <span className="text-[10px] font-black text-red-600">PDF</span>
                                      </div>
                                      <span className="text-[10px] text-slate-500 font-medium">Click to view</span>
                                    </div>
                                  ) : (
                                    <FileText className="h-8 w-8 text-slate-300" />
                                  )}
                                </div>
                                <div className="px-2 py-1.5">
                                  <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider truncate">
                                    {kind} {files.length > 1 ? i + 1 : ""} {isPdf ? "(PDF)" : ""}
                                  </p>
                                  <p className="text-[9px] text-slate-400 truncate">{name}</p>
                                </div>
                              </a>
                            );
                          });
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
