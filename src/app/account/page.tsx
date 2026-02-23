"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AccountDashboardPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/account/applications");
  }, [router]);
  return null;
}
