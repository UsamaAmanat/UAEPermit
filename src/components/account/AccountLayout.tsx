"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  FileText,
  PlusCircle,
  User,
  Users,
  Lock,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/account/applications", label: "My Applications", icon: FileText },
  { href: "/apply", label: "New visa application", icon: PlusCircle },
  { href: "/account/profile", label: "Profile", icon: User },
  { href: "/account/family", label: "Family members", icon: Users },
  { href: "/account/password", label: "Change password", icon: Lock },
];

type AccountLayoutProps = {
  children: ReactNode;
  userEmail?: string | null;
};

export default function AccountLayout({
  children,
  userEmail,
}: AccountLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
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

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  const SidebarContent = () => (
    <>
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-4">
        <div className="flex items-center gap-3">
          <Image
            src="/images/icons/logo-evisa.png"
            alt="UAEPermit"
            width={36}
            height={36}
            className="rounded-lg"
          />
          <div>
            <p className="text-sm font-semibold text-slate-900">My Account</p>
            <p className="text-xs text-slate-500 truncate max-w-[130px]" title={userEmail || ""}>
              {userEmail || "User"}
            </p>
          </div>
        </div>
        <button className="md:hidden p-1 text-slate-500 hover:bg-slate-100 rounded" onClick={() => setMobileMenuOpen(false)}>
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/apply"
              ? pathname === "/apply" || pathname?.startsWith("/apply/") // make sure it doesn't match everything
              : pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition
                ${active ? "bg-emerald-50 text-emerald-700" : "text-slate-700 hover:bg-slate-50"}`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-200 p-3 shrink-0">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <LogOut className="h-5 w-5" />
          Log out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row">
      {/* MOBILE TOP BAR */}
      <div className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Image
            src="/images/icons/logo-evisa.png"
            alt="UAEPermit"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <span className="font-semibold text-slate-900">My Account</span>
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
