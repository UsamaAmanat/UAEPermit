"use client";

import { ReactNode } from "react";
import { HiOutlineClipboardList, HiOutlineGlobeAlt } from "react-icons/hi";
import { HiOutlineNewspaper } from "react-icons/hi2";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/admin/applications",
    label: "Applications",
    icon: HiOutlineClipboardList,
  },
  {
    href: "/admin/countries-pricing",
    label: "Countries & Pricing",
    icon: HiOutlineGlobeAlt,
  },
  { href: "/admin/blog", label: "Blog", icon: HiOutlineNewspaper },
];

type AdminLayoutProps = {
  children: ReactNode;
  userEmail?: string | null;
  onLogout?: () => void;
};

export default function AdminLayout({
  children,
  userEmail,
  onLogout,
}: AdminLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen w-full bg-[#0b1020] text-slate-50 overflow-x-hidden">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b1020]/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* LEFT: brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#DEE05B] shadow-lg shadow-[#DEE05B]/40">
              <span className="text-xs font-extrabold tracking-tight text-[#141729]">
                UP
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">UAE Permit</p>
              <p className="text-xs text-slate-400">Admin Panel</p>
            </div>
          </div>

          {/* RIGHT: user + logout */}
          <div className="flex items-center gap-3">
            {userEmail && (
              <div className="hidden items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 sm:flex">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-semibold">
                  {userEmail[0]?.toUpperCase()}
                </div>
                <span className="text-xs text-slate-100">{userEmail}</span>
              </div>
            )}

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-100 hover:bg-red-500/20 transition"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      {/* BODY */}
      <div className="mx-auto flex w-full max-w-[1440px] gap-6 px-4 pb-10 pt-6 sm:px-6 lg:px-8 overflow-x-hidden">
        {/* SIDEBAR */}
        <aside className="hidden w-60 shrink-0 flex-col gap-1 md:flex">
          <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            Navigation
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition
                ${
                  active
                    ? "bg-white text-[#141729] shadow-sm"
                    : "text-slate-300 hover:bg-white/5"
                }`}
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-lg border text-base
                  ${
                    active
                      ? "border-[#3946A7]/20 bg-[#3946A7]/10 text-[#3946A7]"
                      : "border-white/10 bg-white/5 text-slate-300 group-hover:border-white/20"
                  }`}
                >
                  <Icon />
                </span>
                {item.label}
              </Link>
            );
          })}

          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-xs text-slate-300">
            <p className="font-semibold text-slate-100">Quick note</p>
            <p className="mt-1">
              Review paid & unpaid orders in real-time. All unpaid are stored as
              <span className="font-semibold text-amber-300"> Pending</span>.
            </p>
          </div>
        </aside>

        {/* MAIN */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
