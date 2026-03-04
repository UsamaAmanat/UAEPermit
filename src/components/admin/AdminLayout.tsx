"use client";

import { ReactNode, useState, useEffect } from "react";
import { FileText, Globe, Newspaper, LayoutDashboard, Menu, X, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/applications", label: "Applications", icon: FileText },
  { href: "/admin/countries-pricing", label: "Countries & Pricing", icon: Globe },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
  { href: "/admin/settings", label: "Settings", icon: Settings },
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const SidebarContent = () => (
    <>
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white text-sm font-bold">
            UP
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">UAE Permit</p>
            <p className="text-xs text-slate-600">Admin</p>
          </div>
        </div>
        <button className="md:hidden p-1 text-slate-500 hover:bg-slate-100 rounded" onClick={() => setMobileMenuOpen(false)}>
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition
                ${active ? "bg-emerald-50 text-emerald-700" : "text-slate-800 hover:bg-slate-50"}`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-200 p-3 shrink-0">
        {userEmail && (
          <p className="px-3 py-2 text-xs text-slate-600 truncate" title={userEmail}>
            {userEmail}
          </p>
        )}
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 mt-1"
          >
            Logout
          </button>
        )}
      </div>
    </>
  );

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 flex flex-col md:flex-row">
      {/* MOBILE TOP BAR */}
      <div className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white text-[11px] font-bold">
            UP
          </div>
          <span className="font-semibold text-slate-900">Admin Panel</span>
        </div>
        <button onClick={() => setMobileMenuOpen(true)} className="p-2 -mr-2 text-slate-600 hover:bg-slate-100 rounded-md">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <aside className="relative flex w-[260px] flex-col bg-white shadow-2xl h-full animate-[slideRight_0.2s_ease-out]">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex min-h-screen sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* MAIN */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
        {children}
      </main>

      <style jsx global>{`
        @keyframes slideRight {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
