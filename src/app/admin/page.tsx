"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth, db } from "@/lib/firebaseClient";
import { collection, doc, getDoc, getDocs, orderBy, query, limit } from "firebase/firestore";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { isAdminEmail } from "@/lib/authConstants";
import {
  BarChart3,
  FileText,
  Globe,
  PenSquare,
  TrendingUp,
  Users,
  ArrowRight,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

const STATUS_COLORS: Record<string, { bg: string; dot: string; text: string }> = {
  draft: { bg: "bg-slate-100", dot: "bg-slate-400", text: "text-slate-700" },
  pending: { bg: "bg-amber-50", dot: "bg-amber-500", text: "text-amber-800" },
  submitted: { bg: "bg-blue-50", dot: "bg-blue-500", text: "text-blue-800" },
  paid: { bg: "bg-emerald-50", dot: "bg-emerald-500", text: "text-emerald-800" },
  processing: { bg: "bg-sky-50", dot: "bg-sky-500", text: "text-sky-800" },
  issued: { bg: "bg-green-50", dot: "bg-green-600", text: "text-green-800" },
  rejected: { bg: "bg-rose-50", dot: "bg-rose-500", text: "text-rose-800" },
};

type RecentApp = {
  id: string;
  country: string;
  visa: string;
  status: string;
  amount: number;
  createdAt: Date | null;
  applicantName: string;
  extraFast: boolean;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [stats, setStats] = useState<{
    total: number;
    byStatus: Record<string, number>;
    revenue: number;
    currency: string;
    todayCount: number;
  } | null>(null);
  const [recentApps, setRecentApps] = useState<RecentApp[]>([]);

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

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const appsSnap = await getDocs(query(collection(db, "applications"), orderBy("createdAt", "desc")));
        if (cancelled) return;

        const byStatus: Record<string, number> = {};
        let revenueFromApps = 0;
        let todayCount = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const recent: RecentApp[] = [];

        appsSnap.docs.forEach((d, idx) => {
          const data = d.data() as any;
          const status = (data?.status || "draft").toString().toLowerCase();
          byStatus[status] = (byStatus[status] || 0) + 1;

          // Revenue: check paymentStatus OR status for paid/processing/issued
          const paymentStatus = (data?.paymentStatus || "").toString().toLowerCase();
          const isPaid = paymentStatus === "paid" || paymentStatus === "succeeded" || paymentStatus === "complete" || ["paid", "processing", "issued"].includes(status);
          if (isPaid) {
            const planPrice = Number(data?.plan?.price || 0);
            const applicantsLen = Array.isArray(data?.applicants) ? data.applicants.length : 1;
            const extraFastAmount = data?.extraFastSelected ? (Number(data?.extraFastFeePerApplicant || 0) * applicantsLen) : 0;
            const storedAmount = Number(data?.paidAmount ?? data?.grandTotal ?? data?.totalAmount ?? data?.amount ?? 0) || 0;
            const fallbackAmount = storedAmount > 0 ? storedAmount : (planPrice * applicantsLen + extraFastAmount);
            revenueFromApps += fallbackAmount;
          }

          // Today count
          const createdAt = data?.createdAt?.toDate?.() || null;
          if (createdAt && createdAt >= today) {
            todayCount++;
          }

          // Recent apps (top 5)
          if (idx < 5) {
            const applicants = data?.applicants || [];
            const firstName = applicants[0]?.firstName || "";
            const lastName = applicants[0]?.lastName || "";
            const applicantsLen = Array.isArray(applicants) ? applicants.length : 1;
            const planPrice = Number(data?.plan?.price || 0);
            const efAmount = data?.extraFastSelected ? (Number(data?.extraFastFeePerApplicant || 0) * applicantsLen) : 0;
            const storedAmt = Number(data?.paidAmount ?? data?.grandTotal ?? data?.totalAmount ?? data?.amount ?? 0) || 0;
            const recentAmount = storedAmt > 0 ? storedAmt : (planPrice * applicantsLen + efAmount);
            recent.push({
              id: d.id,
              country: data?.plan?.country || "—",
              visa: data?.plan?.visa || "—",
              status,
              amount: recentAmount,
              createdAt,
              applicantName: `${firstName} ${lastName}`.trim() || "—",
              extraFast: !!data?.extraFastSelected,
            });
          }
        });

        setRecentApps(recent);
        setStats({
          total: appsSnap.size,
          byStatus,
          revenue: revenueFromApps,
          currency: "USD",
          todayCount,
        });
      } catch (e) {
        console.error("Dashboard stats failed", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!user) return null;

  const statusOrder = ["draft", "pending", "submitted", "paid", "processing", "issued", "rejected"];

  return (
    <AdminLayout userEmail={user.email} onLogout={handleLogout}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="mt-1 text-sm text-slate-600">
              Welcome back, <span className="font-semibold text-emerald-600">{user.displayName || user.email}</span>
            </p>
          </div>
          <p className="text-xs text-slate-400">
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* Stats cards */}
        {stats === null ? (
          <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1,2,3,4].map((i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-xl bg-slate-200" />
                  <div className="h-3 w-24 rounded bg-slate-200" />
                </div>
                <div className="mt-4 h-8 w-16 rounded bg-slate-200" />
                <div className="mt-2 h-3 w-20 rounded bg-slate-100" />
              </div>
            ))}
          </div>

          {/* Skeleton for status + quick links */}
          <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm animate-pulse">
              <div className="h-4 w-40 rounded bg-slate-200" />
              <div className="mt-4 flex flex-wrap gap-2">
                {[1,2,3,4].map(i => <div key={i} className="h-7 w-24 rounded-full bg-slate-100" />)}
              </div>
            </div>
            <div className="flex flex-col gap-3 lg:w-56">
              {[1,2,3].map(i => (
                <div key={i} className="rounded-xl border border-slate-200 bg-white px-4 py-3 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-slate-200" />
                    <div className="h-3 w-20 rounded bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skeleton for recent apps */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm animate-pulse">
            <div className="px-5 py-4 border-b border-slate-100">
              <div className="h-4 w-40 rounded bg-slate-200" />
            </div>
            <div className="p-5 space-y-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-4 w-28 rounded bg-slate-100" />
                  <div className="h-4 w-20 rounded bg-slate-100" />
                  <div className="h-6 w-20 rounded-full bg-slate-100" />
                  <div className="h-4 w-16 rounded bg-slate-100 ml-auto" />
                </div>
              ))}
            </div>
          </div>
          </>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total applications */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="absolute -right-3 -top-3 h-16 w-16 rounded-full bg-blue-50" />
              <div className="relative">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100">
                    <FileText className="h-4.5 w-4.5 text-blue-600" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Applications</p>
                </div>
                <p className="mt-3 text-3xl font-bold text-slate-900">{stats.total}</p>
                <p className="mt-1 text-xs text-slate-500">
                  <span className="font-medium text-blue-600">{stats.todayCount}</span> received today
                </p>
              </div>
            </div>

            {/* Revenue */}
            <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm">
              <div className="absolute -right-3 -top-3 h-16 w-16 rounded-full bg-emerald-100/50" />
              <div className="relative">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100">
                    <DollarSign className="h-4.5 w-4.5 text-emerald-600" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Revenue (Paid)</p>
                </div>
                <p className="mt-3 text-3xl font-bold text-emerald-900">
                  ${stats.revenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="mt-1 text-xs text-emerald-600">
                  {stats.currency}
                </p>
              </div>
            </div>

            {/* Processing */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="absolute -right-3 -top-3 h-16 w-16 rounded-full bg-sky-50" />
              <div className="relative">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100">
                    <Clock className="h-4.5 w-4.5 text-sky-600" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">In Processing</p>
                </div>
                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {(stats.byStatus["processing"] || 0) + (stats.byStatus["paid"] || 0)}
                </p>
                <p className="mt-1 text-xs text-slate-500">Awaiting review</p>
              </div>
            </div>

            {/* Issued */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="absolute -right-3 -top-3 h-16 w-16 rounded-full bg-green-50" />
              <div className="relative">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-100">
                    <CheckCircle2 className="h-4.5 w-4.5 text-green-600" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Visas Issued</p>
                </div>
                <p className="mt-3 text-3xl font-bold text-slate-900">{stats.byStatus["issued"] || 0}</p>
                <p className="mt-1 text-xs text-slate-500">Successfully completed</p>
              </div>
            </div>
          </div>
        )}

        {/* Status breakdown + Quick actions row */}
        <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
          {/* Status breakdown */}
          {stats !== null && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900 mb-4">Applications by status</h2>
              <div className="flex flex-wrap gap-2">
                {statusOrder.map((s) => {
                  const count = stats.byStatus[s] || 0;
                  if (count === 0) return null;
                  const colors = STATUS_COLORS[s] || STATUS_COLORS.draft;
                  return (
                    <span
                      key={s}
                      className={`inline-flex items-center gap-1.5 rounded-full ${colors.bg} px-3 py-1.5 text-xs font-semibold ${colors.text} border border-black/5`}
                    >
                      <span className={`h-2 w-2 rounded-full ${colors.dot}`} />
                      {s.charAt(0).toUpperCase() + s.slice(1)}: {count}
                    </span>
                  );
                })}
                {statusOrder.every((s) => (stats.byStatus[s] || 0) === 0) && (
                  <span className="text-sm text-slate-500">No applications yet</span>
                )}
              </div>
            </div>
          )}

          {/* Quick links */}
          <div className="flex flex-col gap-3 lg:w-56">
            <button
              onClick={() => router.push("/admin/applications")}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition hover:shadow hover:border-slate-300"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-slate-800">Applications</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </button>
            <button
              onClick={() => router.push("/admin/countries-pricing")}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition hover:shadow hover:border-slate-300"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                  <Globe className="h-4 w-4 text-emerald-600" />
                </div>
                <span className="text-sm font-medium text-slate-800">Pricing</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </button>
            <button
              onClick={() => router.push("/admin/blog")}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition hover:shadow hover:border-slate-300"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
                  <PenSquare className="h-4 w-4 text-amber-600" />
                </div>
                <span className="text-sm font-medium text-slate-800">Blog</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </button>
            <button
              onClick={() => router.push("/admin/settings")}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition hover:shadow hover:border-slate-300"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                </div>
                <span className="text-sm font-medium text-slate-800">Settings</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </button>

            {/* MIGRATION BUTTON */}
            {/* <div className="mt-4 border-t border-slate-100 pt-4">
              <button
                onClick={async () => {
                  if (!confirm("Are you sure you want to run the migration? This will import records from oldRecords.ts into the database.")) return;
                  let offset = 0;
                  while (true) {
                    try {
                      const res = await fetch("/api/admin/migrate-records", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ offset, limit: 100 })
                      });
                      const data = await res.json();
                      if (data.error) throw new Error(data.error);
                      if (data.finished || data.message === "No more records") {
                        alert("Migration finished successfully!");
                        break;
                      }
                      offset = data.nextOffset;
                      console.log(`Migrated ${offset} / ${data.totalRecords}`);
                    } catch (err: any) {
                      alert("Migration failed: " + err.message);
                      break;
                    }
                  }
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Trigger Old Records Migration
              </button>
            </div> */}
          </div>
        </div>

        {/* Recent applications */}
        {recentApps.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">Recent Applications</h2>
              <button
                onClick={() => router.push("/admin/applications")}
                className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                View all <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-5 py-3 font-semibold text-slate-500 uppercase tracking-wider">Applicant</th>
                    <th className="px-5 py-3 font-semibold text-slate-500 uppercase tracking-wider">Country</th>
                    <th className="px-5 py-3 font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 font-semibold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                    <th className="px-5 py-3 font-semibold text-slate-500 uppercase tracking-wider text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentApps.map((app) => {
                    const colors = STATUS_COLORS[app.status] || STATUS_COLORS.draft;
                    return (
                      <tr
                        key={app.id}
                        className="hover:bg-slate-50/50 cursor-pointer transition"
                        onClick={() => router.push(`/admin/applications/${app.id}`)}
                      >
                        <td className="px-5 py-3">
                          <p className="font-medium text-slate-900">{app.applicantName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{app.id.slice(0, 12)}…</p>
                        </td>
                        <td className="px-5 py-3 text-slate-700">{app.country}</td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1.5 rounded-full ${colors.bg} px-2.5 py-1 text-[11px] font-semibold ${colors.text}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className="font-medium text-slate-900">
                            {app.amount > 0 ? `$${app.amount.toFixed(2)}` : "—"}
                          </span>
                          {app.extraFast && (
                            <span className="ml-1.5 inline-flex items-center gap-0.5 rounded-full bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[9px] font-semibold text-amber-700" title="Extra fast processing">
                              ⚡ Fast
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right text-slate-500">
                          {app.createdAt
                            ? app.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
