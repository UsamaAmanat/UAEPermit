// src/app/admin/applications/page.tsx (or wherever this file lives)
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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

import { isAdminEmail } from "@/lib/authConstants";

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
  leadSource?: string | null;
  internalNotes?: string | null;
  extraFastSelected?: boolean;
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
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "processing":
    case "submitted":
      return "bg-sky-100 text-sky-800 border-sky-200";
    case "pending":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "draft":
      return "bg-slate-100 text-slate-700 border-slate-200";
    case "rejected":
      return "bg-rose-100 text-rose-800 border-rose-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

const statusDotClass = (status: RawStatus) => {
  switch (status) {
    case "paid":
    case "issued":
      return "bg-emerald-500";
    case "processing":
    case "submitted":
      return "bg-sky-500";
    case "pending":
      return "bg-amber-500";
    case "draft":
      return "bg-slate-400";
    case "rejected":
      return "bg-rose-500";
    default:
      return "bg-slate-400";
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
            className="h-7 w-7 rounded-full border border-slate-200 bg-slate-100 flex items-center justify-center text-[11px] font-semibold text-slate-700"
            title={n}
          >
            {initials(n)}
          </div>
        ))}
        {remaining > 0 && (
          <div
            className="h-7 w-7 rounded-full border border-slate-200 bg-slate-100 flex items-center justify-center text-[10px] font-semibold text-slate-600"
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
            className="text-slate-900 font-semibold text-sm truncate max-w-[170px]"
            title={primary}
          >
            {primary}
          </span>

          <span className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-700 whitespace-nowrap">
            {count} applicant{count === 1 ? "" : "s"}
          </span>
        </div>

        {count > 1 && (
          <div className="text-[10px] text-slate-600 mt-1">
            Hover to preview
          </div>
        )}
      </div>

      {/* Tooltip (all names) */}
      {count > 1 && (
        <div className="pointer-events-none absolute left-0 top-full z-20 mt-2 hidden w-[280px] rounded-xl border border-slate-200 bg-white p-3 shadow-lg group-hover:block">
          <p className="text-[10px] uppercase tracking-wider text-slate-600 font-medium">
            Applicants
          </p>
          <div className="mt-2 space-y-1.5">
            {list.map((n, i) => (
              <div
                key={`${n}-${i}`}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[11px] text-slate-600 font-semibold">
                    {i + 1}.
                  </span>
                  <span
                    className="text-sm text-slate-800 truncate"
                    title={n}
                  >
                    {n}
                  </span>
                </div>
                <span className="text-[10px] text-slate-600 font-semibold">
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
  const [filterVisaType, setFilterVisaType] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [filterLeadSource, setFilterLeadSource] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number | "all">(10);

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
        router.replace("/login");
        return;
      }
      if (!isAdminEmail(currentUser.email)) {
        router.replace("/login");
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
          Number(data.paidAmount ?? data.grandTotal ?? data.totalAmount ?? data.amountTotal ?? 0) || computedTotal;

        const extraFastSelected = !!(data.extraFastSelected ?? data.extraFastEnabled);

        const ls = data.leadSource;
        const leadSourceStr =
          ls && typeof ls === "object"
            ? [ls.utm_source, ls.utm_medium, ls.utm_campaign].filter(Boolean).join(" / ") || "—"
            : typeof ls === "string"
              ? ls
              : "—";

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
          leadSource: leadSourceStr,
          internalNotes: data.internalNotes ?? null,
          extraFastSelected: extraFastSelected,
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

    if (filterVisaType.trim()) {
      const v = filterVisaType.toLowerCase();
      list = list.filter(
        (a) =>
          (a.visaType || "").toLowerCase().includes(v) ||
          (a.product || "").toLowerCase().includes(v),
      );
    }

    if (filterCountry.trim()) {
      const c = filterCountry.toLowerCase();
      list = list.filter((a) => (a.country || "").toLowerCase().includes(c));
    }

    if (filterLeadSource.trim()) {
      const ls = filterLeadSource.toLowerCase();
      list = list.filter((a) =>
        (a.leadSource || "").toLowerCase().includes(ls),
      );
    }

    if (dateFrom) {
      list = list.filter((a) => a.createdAt >= dateFrom);
    }
    if (dateTo) {
      const end = dateTo + "T23:59:59.999Z";
      list = list.filter((a) => a.createdAt <= end);
    }

    return list;
  }, [
    applications,
    searchTerm,
    filterPayment,
    filterStatus,
    filterVisaType,
    filterCountry,
    filterLeadSource,
    dateFrom,
    dateTo,
  ]);

  const currentSize = pageSize === "all" ? Math.max(1, filteredApps.length) : pageSize;
  const totalPages = Math.max(1, Math.ceil(filteredApps.length / currentSize));
  const currentPage = Math.min(page, totalPages);

  const paginatedApps = filteredApps.slice(
    (currentPage - 1) * currentSize,
    currentPage * currentSize,
  );

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterPayment, filterStatus, filterVisaType, filterCountry, filterLeadSource, dateFrom, dateTo]);

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600 text-sm">Checking access…</p>
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
          className="inline-flex items-center text-xs font-medium text-slate-600 hover:text-slate-900"
        >
          <span className="mr-1 text-lg">←</span>
          Back to dashboard
        </button>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Applications</h1>
            <p className="mt-1 text-sm text-slate-600">Review all visa applications submitted by users.</p>
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

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-600">Applications list</p>
              <p className="text-xs text-slate-600 mt-0.5">
                {filteredApps.length} result{filteredApps.length !== 1 && "s"}{" "}
                matching your filters.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 md:justify-end">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
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
                  className="h-9 w-64 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <select
                value={filterPayment}
                onChange={(e) =>
                  setFilterPayment(e.target.value as "all" | "paid" | "pending")
                }
                className="h-9 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 px-3 focus:outline-none"
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
                className="h-9 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 px-3 focus:outline-none"
              >
                <option value="all">All statuses</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="processing">Processing</option>
                <option value="issued">Issued</option>
                <option value="rejected">Rejected</option>
                <option value="pending">Pending</option>
              </select>

              <input
                type="text"
                value={filterVisaType}
                onChange={(e) => setFilterVisaType(e.target.value)}
                placeholder="Visa type"
                className="h-9 w-28 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 px-3 placeholder:text-slate-600 focus:outline-none"
              />
              <input
                type="text"
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
                placeholder="Country"
                className="h-9 w-28 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 px-3 placeholder:text-slate-600 focus:outline-none"
              />
              <input
                type="text"
                value={filterLeadSource}
                onChange={(e) => setFilterLeadSource(e.target.value)}
                placeholder="Lead source"
                className="h-9 w-28 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 px-3 placeholder:text-slate-600 focus:outline-none"
              />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-9 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 px-3 focus:outline-none"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-9 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 px-3 focus:outline-none"
              />
            </div>
          </div>

          {/* ✅ keep horizontal scroll, but Actions stays visible */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="text-xs uppercase tracking-wider text-slate-600 bg-slate-100">
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
                      className="h-4 w-4 rounded border-slate-300"
                    />
                  </th>

                  <th className="px-4 py-3">Tracking ID</th>
                  <th className="px-4 py-3">Visa type</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Country</th>
                  <th className="px-4 py-3">Lead source</th>
                  <th className="px-4 py-3">Applicants</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Created</th>

                  {/* ✅ Sticky Actions header */}
                  <th className="px-4 py-3 text-right sticky right-0 z-10 bg-slate-100 border-l border-slate-200">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 text-sm">
                {loading ? (
                  <tr>
                    <td
                      colSpan={12}
                      className="py-10 text-center text-slate-600 text-xs"
                    >
                      Loading applications…
                    </td>
                  </tr>
                ) : paginatedApps.length === 0 ? (
                  <tr>
                    <td
                      colSpan={12}
                      className="py-10 text-center text-slate-600 text-xs"
                    >
                      No applications found.
                    </td>
                  </tr>
                ) : (
                  paginatedApps.map((app) => (
                    <tr
                      key={app.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.includes(app.id)}
                          onChange={() => toggleSelect(app.id)}
                          className="h-4 w-4 rounded border-slate-300"
                        />
                      </td>

                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-900 px-2.5 py-1">
                          {app.trackingId}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-900">{app.visaType}</td>
                      <td className="px-4 py-3 text-slate-900">{app.product}</td>
                      <td className="px-4 py-3 text-slate-900">{app.country}</td>
                      <td className="px-4 py-3 text-slate-600 text-xs " title={app.leadSource || ""}>
                        {app.leadSource || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <ApplicantsCell names={app.applicantNames} />
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-[10px] uppercase text-slate-600">
                          {app.currency}
                        </div>
                        <div className="text-sm font-semibold text-slate-900">
                          {app.amount.toFixed(2)}
                        </div>
                        {app.extraFastSelected && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[9px] font-semibold text-amber-700 mt-0.5" title="Extra fast processing">
                            ⚡ Extra fast
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 align-middle">
                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium ${statusPillClass(
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

                      <td className="px-4 py-3 align-middle text-xs">
                        {app.paymentStatus === "Paid" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 font-semibold text-emerald-700 border border-emerald-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 font-semibold text-amber-700 border border-amber-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            Pending
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-slate-900 whitespace-nowrap">
                        {formatDate(app.createdAt)}
                      </td>

                      <td className="px-4 py-3 text-right sticky right-0 z-10 bg-white border-l border-slate-200">
                        <Link
                          href={`/admin/applications/${app.id}`}
                          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold px-4 py-1.5 hover:bg-emerald-700"
                        >
                          View
                        </Link>
                        {/* <button
                          type="button"
                          onClick={() => openDrawer(app.id)}
                          className="ml-2 inline-flex items-center rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Quick view
                        </button> */}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && filteredApps.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <p>
                Showing{" "}
                <span className="font-semibold">
                  {(currentPage - 1) * currentSize + 1}
                </span>{" "}
                –{" "}
                <span className="font-semibold">
                  {Math.min(currentPage * currentSize, filteredApps.length || 0)}
                </span>{" "}
                of{" "}
                <span className="font-semibold">
                  {filteredApps.length || 0}
                </span>
              </p>
              <div className="flex items-center gap-2">
                <div className="mr-2 flex items-center gap-1">
                  <span className="text-slate-500">Rows:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPageSize(val === "all" ? "all" : Number(val));
                      setPage(1);
                    }}
                    className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-xs text-slate-700 focus:outline-none"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value="all">All</option>
                  </select>
                </div>
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 disabled:opacity-40 text-xs"
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
                  className="px-3 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 disabled:opacity-40 text-xs"
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
