// src/app/apply/success/page.tsx
import { Suspense } from "react";
import ApplySuccessPageClient from "./ApplySuccessPageClient";

export default function ApplySuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gradient-to-br from-[#F5F6FB] via-white to-[#fdf7e3] px-4 pt-28 pb-10 flex items-center justify-center">
          <div className="rounded-2xl border border-slate-100 bg-white/80 px-6 py-4 shadow text-xs text-slate-600">
            Loading your success details…
          </div>
        </main>
      }
    >
      <ApplySuccessPageClient />
    </Suspense>
  );
}
