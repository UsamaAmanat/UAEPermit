"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";

const ALLOWED_ADMINS = ["admin@uaepermit.com"]; 

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setChecking(false);
        router.replace("/admin/login");
        return;
      }

      if (!currentUser.email || !ALLOWED_ADMINS.includes(currentUser.email)) {
        setUser(null);
        setChecking(false);
        router.replace("/admin/login");
        return;
      }

      setUser(currentUser);
      setChecking(false);
    });

    return () => unsub();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/admin/login");
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
    <AdminLayout userEmail={user.email} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* Heading */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-300">
            Welcome back,{" "}
            <span className="font-medium text-[#DEE05B]">
              {user.email}
            </span>
            . Manage applications, pricing and blog content from here.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Applications card */}
          <div className="group rounded-2xl border border-white/10 bg-white/95 p-5 shadow-[0_18px_45px_rgba(0,0,0,0.35)] hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(0,0,0,0.45)] transition">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Applications
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Review all visa applications, payment status and order
                  details.
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3946A7]/10 text-[#3946A7] text-lg">
                📄
              </div>
            </div>
            <button
              className="mt-4 inline-flex items-center text-xs font-medium text-[#3946A7] cursor-pointer hover:text-[#252f8a]"
              onClick={() => router.push("/admin/applications")}
            >
              Open applications <span className="ml-1">→</span>
            </button>
          </div>

          {/* Countries & Pricing */}
          <div className="group rounded-2xl border border-white/10 bg-white/95 p-5 shadow-[0_18px_45px_rgba(0,0,0,0.35)] hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(0,0,0,0.45)] transition">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Countries &amp; Pricing
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Configure visa products, single/multi entry types and fees per
                  country.
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 text-lg">
                🌍
              </div>
            </div>
            <button
              className="cursor-pointer mt-4 inline-flex items-center text-xs font-medium text-emerald-700 hover:text-emerald-900"
              onClick={() => router.push("/admin/countries-pricing")}
            >
              Manage pricing <span className="ml-1">→</span>
            </button>
          </div>

          {/* Blog */}
          <div className="group rounded-2xl border border-white/10 bg-white/95 p-5 shadow-[0_18px_45px_rgba(0,0,0,0.35)] hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(0,0,0,0.45)] transition">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Blog</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Create SEO-friendly posts about Dubai visas, documents and
                  travel tips.
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600 text-lg">
                ✏️
              </div>
            </div>
            <button
              className="cursor-pointer mt-4 inline-flex items-center text-xs font-medium text-amber-700 hover:text-amber-900"
              onClick={() => router.push("/admin/blog")}
            >
              Open blog manager <span className="ml-1">→</span>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
