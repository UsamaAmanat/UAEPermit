// src/app/admin/applications/page.tsx (or wherever this file lives)
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth, db } from "@/lib/firebaseClient";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
  query,
} from "firebase/firestore";
import AdminLayout from "@/components/admin/AdminLayout";
import { toast } from "sonner";
import ApplicationDrawer from "@/components/admin/ApplicationDrawer";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

const ALLOWED_ADMINS = ["admin@uaepermit.com"];

type RawStatusBase =
  | "draft"
  | "submitted"
  | "processing"
  | "issued"
  | "rejected"
  | "pending"
  | "paid";

export type RawStatus = RawStatusBase;

interface Application {
  id: string;
  trackingId: string;
  visaType: string;
  product: string;
  applicants: number;
  applicantNames: string[];
  country: string;
  amount: number;
  currency: string;
  paymentStatus: "Paid" | "Pending";
  appStatus: RawStatus | "pending";
  createdAt: string;
  primaryApplicant?: string;
}

const normalizeStatus = (value: any): RawStatus => {
  const s = String(value || "draft")
    .trim()
    .toLowerCase();
  if (
    s === "draft" ||
    s === "submitted" ||
    s === "processing" ||
    s === "issued" ||
    s === "rejected" ||
    s === "pending" ||
    s === "paid"
  ) {
    return s as RawStatus;
  }
  return "draft";
};

const statusPillClass = (status: RawStatus) => {
  switch (status) {
    case "paid":
    case "issued":
      return "bg-slate-500/15 text-emerald-200";
    case "processing":
    case "submitted":
      return "bg-sky-500/15 text-sky-200";
    case "pending":
      return "bg-amber-500/15 text-amber-200";
    case "draft":
      return "bg-slate-500/15 text-slate-200";
    case "rejected":
      return "bg-rose-500/15 text-rose-200";
    default:
      return "bg-slate-500/15 text-slate-200";
  }
};

const statusDotClass = (status: RawStatus) => {
  switch (status) {
    case "paid":
    case "issued":
      return "bg-emerald-400";
    case "processing":
    case "submitted":
      return "bg-sky-400";
    case "pending":
      return "bg-amber-400";
    case "draft":
      return "bg-white";
    case "rejected":
      return "bg-rose-400";
    default:
      return "bg-slate-300";
  }
};

const formatStatusLabel = (status: string) =>
  status.charAt(0).toUpperCase() + status.slice(1);

function compactName(first?: string, last?: string) {
  return [first, last].filter(Boolean).join(" ").trim();
}

function initials(name?: string) {
  const v = String(name || "").trim();
  if (!v) return "?";
  const parts = v.split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] || "";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (a + b).toUpperCase() || "?";
}

function ApplicantsCell({ names }: { names: string[] }) {
  const list = Array.isArray(names) ? names.filter(Boolean) : [];
  const count = list.length || 1;
  const primary = list[0] || "Applicant";

  const preview = list.slice(0, 3);
  const remaining = Math.max(0, count - preview.length);

  return (
    <div className="relative inline-flex items-center gap-3 group">
      {/* Avatar stack */}
      <div className="flex -space-x-2">
        {preview.map((n, idx) => (
          <div
            key={`${n}-${idx}`}
            className="h-7 w-7 rounded-full border border-white/10 bg-slate-900/70 shadow-[0_10px_22px_rgba(0,0,0,0.35)] flex items-center justify-center text-[11px] font-extrabold text-slate-100"
            title={n}
          >
            {initials(n)}
          </div>
        ))}
        {remaining > 0 && (
          <div
            className="h-7 w-7 rounded-full border border-white/10 bg-slate-900/70 shadow-[0_10px_22px_rgba(0,0,0,0.35)] flex items-center justify-center text-[10px] font-extrabold text-slate-200"
            title={`${remaining} more`}
          >
            +{remaining}
          </div>
        )}
      </div>

      {/* Primary + count pill */}
      <div className="min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="text-slate-100 font-semibold text-sm truncate max-w-[170px]"
            title={primary}
          >
            {primary}
          </span>

          <span className="inline-flex items-center rounded-full bg-slate-900/70 border border-white/10 px-2 py-0.5 text-[11px] font-semibold text-slate-200 whitespace-nowrap">
            {count} applicant{count === 1 ? "" : "s"}
          </span>
        </div>

        {/* subtle hint */}
        {count > 1 && (
          <div className="text-[10px] text-slate-500 mt-1">
            Hover to preview
          </div>
        )}
      </div>

      {/* Tooltip (all names) */}
      {count > 1 && (
        <div className="pointer-events-none absolute left-0 top-full z-20 mt-2 hidden w-[280px] rounded-2xl border border-white/10 bg-[#050818] p-3 shadow-[0_18px_45px_rgba(0,0,0,0.55)] group-hover:block">
          <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
            Applicants
          </p>
          <div className="mt-2 space-y-1.5">
            {list.map((n, i) => (
              <div
                key={`${n}-${i}`}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[11px] text-slate-500 font-semibold">
                    {i + 1}.
                  </span>
                  <span
                    className="text-[12px] text-slate-200 truncate"
                    title={n}
                  >
                    {n}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-semibold">
                  {initials(n)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApplicationsPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState<string[]>([]);

  // filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPayment, setFilterPayment] = useState<
    "all" | "paid" | "pending"
  >("all");
  const [filterStatus, setFilterStatus] = useState<
    "all" | RawStatus | "pending"
  >("all");

  // pagination
  const [page, setPage] = useState(1);
  const pageSize = 7;

  // drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeAppId, setActiveAppId] = useState<string | null>(null);

  // delete confirm
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ===== auth check =====
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.replace("/admin/login");
        return;
      }
      if (!ALLOWED_ADMINS.includes(currentUser.email || "")) {
        router.replace("/admin/login");
        return;
      }
      setUser(currentUser);
      setChecking(false);
    });

    return () => unsub();
  }, [router]);

  function normalizeApplicants(applicants: any): any[] {
    if (Array.isArray(applicants)) return applicants;

    // handle {0:{},1:{}} shape
    if (applicants && typeof applicants === "object") {
      const keys = Object.keys(applicants);
      const hasNumeric = keys.some((k) => String(Number(k)) === k);

      if (hasNumeric) {
        return keys
          .sort((a, b) => Number(a) - Number(b))
          .map((k) => applicants[k])
          .filter(Boolean);
      }
    }

    return [];
  }

  // ===== load applications =====
  const loadApps = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "applications"),
        orderBy("createdAt", "desc"),
      );
      const snap = await getDocs(q);

      const list: Application[] = snap.docs.map((d) => {
        const data = d.data() as any;
        const plan = data.plan ?? {};

        const applicantsArr = normalizeApplicants(data.applicants);
        const primary = applicantsArr[0] || {};

        const createdIso = data.createdAt
          ? new Date(
              data.createdAt.seconds
                ? data.createdAt.seconds * 1000
                : data.createdAt,
            ).toISOString()
          : new Date().toISOString();

        const rawStatus: RawStatus = normalizeStatus(data.status);

        const visaType =
          plan.entry || data.visaType || plan.visa || "Visa type";
        const product = plan.visa || data.productName || data.visaType || "—";

        const applicantNames = applicantsArr
          .map((a: any) => compactName(a?.firstName, a?.lastName))
          .filter(Boolean);

        const primaryApplicant =
          compactName(primary.firstName, primary.lastName) ||
          applicantNames[0] ||
          "";

        const applicantsCount = Math.max(
          1,
          applicantsArr.length || Number(data.applicantsCount) || 1,
        );

        // ✅ price per applicant (fallbacks)
        const perApplicantPrice =
          Number(data.amountPerApplicant ?? plan.price ?? data.price ?? 0) || 0;

        // ✅ extra fast per applicant (if enabled)
        const extraFastEnabled = Boolean(
          data.extraFastEnabled ?? plan?.addons?.extraFast?.enabled ?? false,
        );

        const extraFastPerApplicant = extraFastEnabled
          ? Number(
              data.extraFastAmountPerApplicant ??
                plan?.addons?.extraFast?.amount ??
                0,
            ) || 0
          : 0;

        // ✅ final total (prefer stored total if exists, else compute)
        const computedTotal =
          (perApplicantPrice + extraFastPerApplicant) * applicantsCount;

        const totalAmount =
          Number(data.totalAmount ?? data.amountTotal ?? 0) || computedTotal;

        return {
          id: d.id,
          trackingId: data.trackingId || d.id,
          visaType,
          product,
          applicants: applicantsCount,
          applicantNames: applicantNames.length
            ? applicantNames
            : [primaryApplicant || "Applicant"],
          country: plan.country || data.country || primary.nationality || "—",
          amount: Number(totalAmount || 0),
          currency: (data.currency || "USD").toString(),
          paymentStatus:
            (data.paymentStatus || "").toString().toLowerCase() === "paid"
              ? "Paid"
              : "Pending",
          appStatus: rawStatus,
          createdAt: createdIso,
          primaryApplicant,
        };
      });

      setApplications(list);
    } catch (e) {
      console.error("Error loading applications:", e);
      toast.error("Failed to load applications");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!checking) loadApps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checking]);

  // ===== delete selected =====
  const handleDeleteSelected = () => {
    if (selected.length === 0) return;
    setConfirmOpen(true);
  };

  const confirmDeleteSelected = async () => {
    if (selected.length === 0) return;

    setDeleting(true);
    try {
      for (const id of selected) {
        await deleteDoc(doc(db, "applications", id));
      }
      toast.success("Selected applications deleted");
      await loadApps();
      setSelected([]);
      setConfirmOpen(false);
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete applications");
    } finally {
      setDeleting(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  // ===== filtering & pagination =====
  const filteredApps = useMemo(() => {
    let list = [...applications];

    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase();
      list = list.filter(
        (a) =>
          a.trackingId.toLowerCase().includes(s) ||
          a.country.toLowerCase().includes(s) ||
          (a.primaryApplicant || "").toLowerCase().includes(s) ||
          (a.applicantNames || []).some((n) => n.toLowerCase().includes(s)),
      );
    }

    if (filterPayment !== "all") {
      list = list.filter((a) =>
        filterPayment === "paid"
          ? a.paymentStatus === "Paid"
          : a.paymentStatus === "Pending",
      );
    }

    if (filterStatus !== "all") {
      list = list.filter((a) => a.appStatus === filterStatus);
    }

    return list;
  }, [applications, searchTerm, filterPayment, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredApps.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginatedApps = filteredApps.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterPayment, filterStatus]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  const openDrawer = (id: string) => {
    setActiveAppId(id);
    setDrawerOpen(true);
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1020]">
        <p className="text-slate-400 text-sm">Checking admin access…</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <AdminLayout userEmail={user.email} onLogout={() => signOut(auth)}>
      <div className="space-y-5">
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="inline-flex items-center text-xs font-medium text-slate-300 hover:text-white"
        >
          <span className="mr-1 text-lg">←</span>
          Back to dashboard
        </button>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Applications
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Review all visa applications submitted by users.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {selected.length > 0 && (
              <button
                type="button"
                onClick={handleDeleteSelected}
                className="inline-flex items-center rounded-full bg-rose-500 px-4 py-1.5 text-xs font-semibold text-white shadow hover:bg-rose-600"
              >
                Delete selected ({selected.length})
              </button>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-[#050818] border border-white/10 shadow-[0_18px_45px_rgba(0,0,0,0.55)] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Applications list
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {filteredApps.length} result{filteredApps.length !== 1 && "s"}{" "}
                matching your filters.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 md:justify-end">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <svg
                    className="w-4 h-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <line x1="16.65" y1="16.65" x2="21" y2="21" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by tracking ID, country or applicant…"
                  className="h-9 w-64 rounded-full bg-slate-900/70 border border-white/10 pl-9 pr-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#DEE05B]/70 focus:border-transparent"
                />
              </div>

              <select
                value={filterPayment}
                onChange={(e) =>
                  setFilterPayment(e.target.value as "all" | "paid" | "pending")
                }
                className="h-9 rounded-full bg-slate-900/70 border border-white/10 text-xs text-slate-100 px-3 focus:outline-none"
              >
                <option value="all">All payments</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(
                    e.target.value as "all" | RawStatus | "pending",
                  )
                }
                className="h-9 rounded-full bg-slate-900/70 border border-white/10 text-xs text-slate-100 px-3 focus:outline-none"
              >
                <option value="all">All statuses</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="processing">Processing</option>
                <option value="issued">Issued</option>
                <option value="rejected">Rejected</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          {/* ✅ keep horizontal scroll, but Actions stays visible */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="text-[10px] uppercase tracking-[0.18em] text-slate-500 bg-slate-900/40">
                <tr>
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={
                        paginatedApps.length > 0 &&
                        paginatedApps.every((a) => selected.includes(a.id))
                      }
                      onChange={(e) => {
                        const ids = paginatedApps.map((a) => a.id);
                        if (e.target.checked) {
                          setSelected((prev) =>
                            Array.from(new Set([...prev, ...ids])),
                          );
                        } else {
                          setSelected((prev) =>
                            prev.filter((id) => !ids.includes(id)),
                          );
                        }
                      }}
                      className="h-4 w-4 rounded border-slate-500 bg-slate-800"
                    />
                  </th>

                  <th className="px-4 py-3">Tracking ID</th>
                  <th className="px-4 py-3">Visa type</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Country</th>
                  <th className="px-4 py-3">Applicants</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>

                  {/* ✅ Sticky Actions header */}
                  <th className="px-4 py-3 text-right sticky right-0 z-10 bg-slate-900/60 backdrop-blur border-l border-white/5">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5 text-sm">
                {loading ? (
                  <tr>
                    <td
                      colSpan={11}
                      className="py-10 text-center text-slate-400 text-xs"
                    >
                      Loading applications…
                    </td>
                  </tr>
                ) : paginatedApps.length === 0 ? (
                  <tr>
                    <td
                      colSpan={11}
                      className="py-10 text-center text-slate-400 text-xs"
                    >
                      No applications found.
                    </td>
                  </tr>
                ) : (
                  paginatedApps.map((app) => (
                    <tr
                      key={app.id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.includes(app.id)}
                          onChange={() => toggleSelect(app.id)}
                          className="h-4 w-4 rounded border-slate-500 bg-slate-800"
                        />
                      </td>

                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-slate-50 text-[11px] font-semibold text-slate-900 px-3 py-1 shadow-[0_6px_16px_rgba(15,23,42,0.35)]">
                          {app.trackingId}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-100">
                        {app.visaType}
                      </td>
                      <td className="px-4 py-3 text-slate-100">
                        {app.product}
                      </td>
                      <td className="px-4 py-3 text-slate-100">
                        {app.country}
                      </td>

                      <td className="px-4 py-3">
                        <ApplicantsCell names={app.applicantNames} />
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-[10px] uppercase text-slate-500">
                          {app.currency}
                        </div>
                        <div className="text-sm font-semibold text-slate-100">
                          {app.amount.toFixed(2)}
                        </div>
                      </td>

                      <td className="px-4 py-3 align-middle">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium ${statusPillClass(
                            app.appStatus as RawStatus,
                          )}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full mr-1.5 ${statusDotClass(
                              app.appStatus as RawStatus,
                            )}`}
                          />
                          {formatStatusLabel(app.appStatus)}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-100 whitespace-nowrap">
                        {formatDate(app.createdAt)}
                      </td>

                      {/* ✅ Sticky Actions cell */}
                      <td className="px-4 py-3 text-right sticky right-0 z-10 bg-[#050818]/85 backdrop-blur border-l border-white/5">
                        <button
                          type="button"
                          onClick={() => openDrawer(app.id)}
                          className="inline-flex items-center gap-2 rounded-full bg-white text-slate-900 text-xs font-semibold px-4 py-1.5 shadow-[0_10px_24px_rgba(15,23,42,0.55)] hover:bg-slate-100"
                        >
                          View
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white text-[11px]">
                            →
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && filteredApps.length > 0 && (
            <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
              <p>
                Showing{" "}
                <span className="font-semibold">
                  {(currentPage - 1) * pageSize + 1}
                </span>{" "}
                –{" "}
                <span className="font-semibold">
                  {Math.min(currentPage * pageSize, filteredApps.length || 0)}
                </span>{" "}
                of{" "}
                <span className="font-semibold">
                  {filteredApps.length || 0}
                </span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 rounded-full bg-slate-900 text-slate-200 disabled:opacity-40 text-[11px]"
                >
                  Prev
                </button>
                <span>
                  Page <span className="font-semibold">{currentPage}</span> /{" "}
                  {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1 rounded-full bg-slate-900 text-slate-200 disabled:opacity-40 text-[11px]"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ApplicationDrawer
        open={drawerOpen}
        appId={activeAppId}
        onClose={() => setDrawerOpen(false)}
        onStatusChanged={() => loadApps()}
      />

      <ConfirmDialog
        open={confirmOpen}
        title={`Delete ${selected.length} application${
          selected.length > 1 ? "s" : ""
        }?`}
        description="This action cannot be undone."
        confirmText={`Delete ${selected.length}`}
        danger
        loading={deleting}
        onClose={() => (!deleting ? setConfirmOpen(false) : null)}
        onConfirm={confirmDeleteSelected}
      />
    </AdminLayout>
  );
}
