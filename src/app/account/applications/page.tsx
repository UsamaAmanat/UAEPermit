"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import {
  FileText,
  PlusCircle,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Search,
  Filter,
  MapPin,
  Zap,
  BarChart3,
} from "lucide-react";

type AppRow = {
  id: string;
  trackingId: string;
  country: string;
  visaType: string;
  status: string;
  amount: number;
  currency: string;
  createdAt: string;
  applicants: number;
  extraFast: boolean;
};

type StatusKey = "submitted" | "pending_payment" | "paid" | "issued" | "rejected";

const STATUS_CONFIG: Record<StatusKey, { label: string; bg: string; text: string; border: string; icon: typeof Clock }> = {
  submitted: { label: "Submitted", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: Clock },
  pending_payment: { label: "Pending Payment", bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", icon: Clock },
  paid: { label: "Payment Done", bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200", icon: CreditCard },
  issued: { label: "Visa Issued", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: CheckCircle2 },
  rejected: { label: "Rejected", bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", icon: AlertCircle },
};

function mapStatus(raw: string): StatusKey {
  const s = raw.trim().toLowerCase();
  if (["draft", "pending", "submitted", "incomplete"].includes(s)) return "pending_payment";
  if (["paid", "processing", "succeeded", "complete"].includes(s)) return "paid";
  if (s === "issued") return "issued";
  if (s === "rejected") return "rejected";
  return "submitted";
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function timeAgo(iso: string): string {
  try {
    const now = Date.now();
    const then = new Date(iso).getTime();
    const diff = now - then;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return formatDate(iso);
  } catch {
    return iso;
  }
}

export default function AccountApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<StatusKey | "all">("all");

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "applications"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        if (cancelled) return;
        const list: AppRow[] = snap.docs.map((d) => {
          const data = d.data() as any;
          const plan = data?.plan ?? {};
          const created = data?.createdAt;
          const createdStr =
            created?.seconds != null
              ? new Date(created.seconds * 1000).toISOString()
              : typeof created === "string"
                ? created
                : new Date().toISOString();
          const applicantsArr = Array.isArray(data?.applicants) ? data.applicants : [];
          const applicantsLen = applicantsArr.length || 1;
          const planPrice = Number(plan?.price || 0);
          const efAmount = data?.extraFastSelected ? (Number(data?.extraFastFeePerApplicant || 0) * applicantsLen) : 0;
          const storedAmt = Number(data?.paidAmount ?? data?.grandTotal ?? data?.totalAmount ?? 0) || 0;
          const amount = storedAmt > 0 ? storedAmt : (planPrice * applicantsLen + efAmount);
          return {
            id: d.id,
            trackingId: data?.trackingId || d.id,
            country: plan?.country || data?.country || "—",
            visaType: plan?.visa || data?.visaType || "—",
            status: (data?.status || "submitted").toString(),
            amount,
            currency: (data?.paidCurrency || data?.currency || "USD").toString(),
            createdAt: createdStr,
            applicants: applicantsLen,
            extraFast: !!data?.extraFastSelected,
          };
        });
        setApplications(list);
      } catch (e) {
        console.error("Failed to load applications", e);
        setApplications([]);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const filtered = applications.filter((app) => {
    const matchesSearch =
      !searchQuery.trim() ||
      app.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.visaType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.trackingId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || mapStatus(app.status) === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Stats
  const totalApps = applications.length;
  const issuedCount = applications.filter(a => mapStatus(a.status) === "issued").length;
  const processingCount = applications.filter(a => ["paid", "submitted"].includes(mapStatus(a.status))).length;
  const totalSpent = applications.reduce((sum, a) => sum + a.amount, 0);

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Applications</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track all your visa applications in one place.
          </p>
        </div>
        <Link
          href="/apply"
          className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 shadow-sm shadow-emerald-200 transition hover:shadow-md hover:shadow-emerald-200"
        >
          <PlusCircle className="h-4 w-4" />
          New Application
        </Link>
      </div>

      {/* ─── Quick Stats ─── */}
      {!loading && totalApps > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total</p>
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">{totalApps}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">In Progress</p>
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">{processingCount}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Issued</p>
            </div>
            <p className="mt-2 text-2xl font-bold text-emerald-600">{issuedCount}</p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                <CreditCard className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600/70">Total Spent</p>
            </div>
            <p className="mt-2 text-2xl font-bold text-emerald-700">${totalSpent.toFixed(2)}</p>
          </div>
        </div>
      )}

      {/* ─── Search & Filter bar ─── */}
      {!loading && totalApps > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by country, visa type, or tracking ID..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <Filter className="h-4 w-4 text-slate-400" />
            {(["all", "submitted", "pending_payment", "paid", "issued", "rejected"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilterStatus(f)}
                className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
                  filterStatus === f
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f === "all" ? "All" : STATUS_CONFIG[f].label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── Applications list ─── */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          /* Skeleton loading */
          <div className="divide-y divide-slate-100">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-5 animate-pulse">
                <div className="h-11 w-11 rounded-xl bg-slate-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 rounded bg-slate-100" />
                  <div className="h-3 w-56 rounded bg-slate-50" />
                </div>
                <div className="h-6 w-20 rounded-full bg-slate-100" />
                <div className="h-4 w-16 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 && applications.length === 0 ? (
          /* Empty state */
          <div className="py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100">
              <FileText className="h-7 w-7 text-slate-300" />
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-800">No applications yet</p>
            <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
              Start your first visa application and it will appear here for easy tracking.
            </p>
            <Link
              href="/apply"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 shadow-sm transition"
            >
              <PlusCircle className="h-4 w-4" />
              Start Application
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          /* No results for filter */
          <div className="py-12 text-center">
            <Search className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm text-slate-600">No applications match your search.</p>
            <button
              onClick={() => { setSearchQuery(""); setFilterStatus("all"); }}
              className="mt-2 text-sm font-medium text-emerald-600 hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          /* Applications list */
          <div className="divide-y divide-slate-100">
            {filtered.map((app) => {
              const statusKey = mapStatus(app.status);
              const cfg = STATUS_CONFIG[statusKey];
              const Icon = cfg.icon;
              return (
                <Link
                  key={app.id}
                  href={`/account/applications/${app.id}`}
                  className="group flex items-center gap-4 px-5 py-4 hover:bg-gradient-to-r hover:from-emerald-50/40 hover:to-transparent transition-all"
                >
                  {/* Country icon */}
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-700 shadow-sm border border-emerald-200/50">
                    <MapPin className="h-5 w-5" />
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900 truncate">
                        {app.country}
                      </p>
                      <span className="text-slate-300">·</span>
                      <p className="text-sm text-slate-600 truncate">{app.visaType}</p>
                      {app.extraFast && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[9px] font-semibold text-amber-700">
                          <Zap className="h-2.5 w-2.5" /> Fast
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-400">
                      <span className="font-mono">{app.trackingId.length > 16 ? app.trackingId.slice(0, 16) + "…" : app.trackingId}</span>
                      <span>{timeAgo(app.createdAt)}</span>
                      <span>{app.applicants} applicant{app.applicants > 1 ? "s" : ""}</span>
                    </div>
                  </div>

                  {/* Status + Amount */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-semibold text-slate-900">
                        ${app.amount.toFixed(2)}
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase">{app.currency}</p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                       <span className={`inline-flex items-center gap-1.5 rounded-full border ${cfg.border} ${cfg.bg} px-2.5 py-1 text-[11px] font-semibold ${cfg.text}`}>
                        <Icon className="h-3 w-3" />
                        {cfg.label}
                      </span>
                      
                      {statusKey === "pending_payment" && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.location.href = `/apply/payment?appId=${encodeURIComponent(app.id)}&amount=${encodeURIComponent(app.amount)}`;
                          }}
                          className="inline-flex items-center gap-1 mt-1 rounded-full bg-emerald-600 px-3 py-1.5 text-[10px] font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
                        >
                          <CreditCard className="h-3 w-3" />
                          Pay Now
                        </button>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Footer info ─── */}
      {!loading && totalApps > 0 && (
        <p className="text-center text-xs text-slate-400">
          Showing {filtered.length} of {totalApps} application{totalApps > 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
