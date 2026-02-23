"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { isAdminEmail } from "@/lib/authConstants";
import AccountLayout from "@/components/account/AccountLayout";
import { Loader2 } from "lucide-react";

export default function AccountLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (isAdminEmail(user.email)) {
      router.replace("/admin");
      return;
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return <AccountLayout userEmail={user.email}>{children}</AccountLayout>;
}
