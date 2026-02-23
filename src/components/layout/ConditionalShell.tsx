"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/home/Footer";

export default function ConditionalShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const isAccount = pathname.startsWith("/account");
  const isAdmin = pathname.startsWith("/admin");
  const hideShell = isAccount || isAdmin;

  return (
    <>
      {!hideShell && <Navbar />}
      <div className={hideShell ? "" : "pt-10"}>{children}</div>
      {!hideShell && <Footer />}
    </>
  );
}
