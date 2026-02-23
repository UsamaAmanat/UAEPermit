"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Single login for both admin and customers; redirect to main login.
export default function AdminLoginRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/login");
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <p className="text-sm text-slate-500">Redirecting to login…</p>
    </div>
  );
}
