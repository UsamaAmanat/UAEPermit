// src/app/apply/page.tsx
import { Suspense } from "react";
import ApplyPageClient from "./ApplyPageClient";

export const metadata = {
  title: "Apply UAE Dubai Visa Online – Quick Tourist Visa Application",
  description:
    "Apply UAE Dubai visa online in minutes. UAE Permit offers reliable, fast and affordable Dubai tourist visa services with expert assistance.",
  alternates: {
    canonical: "/apply",
  },
};

export default function ApplyPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gradient-to-br from-[#F5F6FB] via-white to-[#fdf7e3] px-4 pt-28 pb-10 flex items-center justify-center">
          <div className="rounded-2xl border border-slate-100 bg-white/80 px-6 py-4 shadow text-xs text-slate-600">
            Preparing your application form…
          </div>
        </main>
      }
    >
      <ApplyPageClient />
    </Suspense>
  );
}
