// src/app/track/page.tsx
import { Suspense } from "react";
import TrackPageClient from "./TrackPageClient";

export const metadata = {
  title: "Track Your Dubai Visa Status | UAE Permit 24/7 Tracking",
  description:
    "Easily track your Dubai & UAE visa status online with UAE Permit. Get real-time updates, fast results, and 24/7 support. Simple, secure, and hassle-free tracking.",
  alternates: {
    canonical: "/track",
  },
};

export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gradient-to-br from-[#F5F6FB] via-white to-[#fdf7e3] px-4 pt-28 pb-10 flex items-center justify-center">
          <div className="rounded-2xl border border-slate-100 bg-white/80 px-6 py-4 shadow text-xs text-slate-600">
            Loading your tracking details…
          </div>
        </main>
      }
    >
      <TrackPageClient />
    </Suspense>
  );
}
