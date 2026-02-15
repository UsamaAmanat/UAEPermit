"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Copy, PartyPopper } from "lucide-react";
import { toast } from "sonner";

import { confetti } from "tsparticles-confetti";

import { BadgeCheck } from "lucide-react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

export default function ApplySuccessPageClient() {
  const searchParams = useSearchParams();
  const trackingId = searchParams.get("appId") ?? "";
  const hasId = Boolean(trackingId);

  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowConfetti(true), 300);
  }, []);

  useEffect(() => {
    const duration = 1200; // 1.2s burst
    const animationEnd = Date.now() + duration;

    const defaults = {
      spread: 360,
      ticks: 60,
      gravity: 0.5,
      decay: 0.92,
      startVelocity: 35,
      shapes: ["square", "circle"],
      scalar: 1.1,
    };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 55 * (timeLeft / duration);

      // Left burst
      confetti({
        ...defaults,
        particleCount,
        origin: { x: 0.1, y: 0.3 },
        colors: ["#3C4161", "#62E9C9", "#111827"],
      });

      // Right burst
      confetti({
        ...defaults,
        particleCount,
        origin: { x: 0.9, y: 0.3 },
        colors: ["#3C4161", "#62E9C9", "#111827"],
      });
    }, 200);
  }, []);

  useEffect(() => {
    if (!trackingId) return;

    const run = async () => {
      try {
        const ref = doc(db, "applications", trackingId);
        const snap = await getDoc(ref);
        if (!snap.exists()) return;

        const data = snap.data();

        // 1️⃣ Mark paid
        await updateDoc(ref, {
          status: "processing", // maps to PAID UI
          applicants: (data.applicants || []).map((a: any) => ({
            ...a,
            status: "processing",
          })),
          updatedAt: new Date(),
        });

        // 2️⃣ 🔥 SEND EMAIL
        await fetch("/api/email/application-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            applicationId: trackingId,
            trackingId,
            status: "paid",
            previousStatus: data.status || "submitted",
            applicants: data.applicants || [],
          }),
        });
      } catch (err) {
        console.error("Payment success flow failed:", err);
      }
    };

    run();
  }, [trackingId]);

  const handleCopy = async () => {
    if (!trackingId) return;
    try {
      await navigator.clipboard.writeText(trackingId);
      toast.success("Tracking ID copied", {
        description: "You can paste this anywhere to check your status.",
      });
    } catch {
      toast.error("Couldn’t copy tracking ID. Please copy it manually.");
    }
  };

  const trackHref = hasId ? `/track?appId=${trackingId}` : "/track";

  return (
    <main
      className="
        min-h-screen
        bg-gradient-to-br from-[#F5F6FB] via-white to-[#fdf7e3]
        px-4
        pt-28 pb-10
        md:px-6 md:pt-32 md:pb-16
      "
    >
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        {/* Badge */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-[#62E9C9]/40 blur-2xl" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-slate-900 text-[#62E9C9] shadow-[0_18px_45px_rgba(98,233,201,0.55)]">
            <BadgeCheck className="h-11 w-11" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl flex items-center justify-center gap-2">
          <PartyPopper className="h-6 w-6 text-[#3C4161]" />
          <span>Payment successful</span>
        </h1>

        <p className="mt-3 max-w-xl text-sm text-slate-600 md:text-base">
          Thank you. Your Dubai visa application has been submitted. Our team
          will review your documents and update you by email / WhatsApp soon.
        </p>

        {/* Tracking card */}
        <div className="mt-8 w-full rounded-2xl border border-slate-100 bg-white/90 p-4 text-left shadow-[0_18px_45px_rgba(15,23,42,0.06)] md:p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Tracking details
          </p>

          <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p className="text-xs text-slate-500">Tracking ID</p>
              <p className="font-mono text-sm font-semibold text-slate-900">
                {hasId ? trackingId : "Will be shared with you shortly"}
              </p>
            </div>

            {hasId && (
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-white"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy ID
              </button>
            )}
          </div>

          <p className="mt-3 text-[11px] text-slate-500">
            Keep this ID safe – soon you’ll be able to use it on our{" "}
            <span className="font-medium text-slate-800">
              Track Application
            </span>{" "}
            page to see live status updates.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-8 flex w-full flex-col items-center gap-3 md:flex-row md:justify-center">
          <Link
            href={trackHref}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#62E9C9] px-5 py-2.5 text-xs font-semibold text-[#0c4d3d] shadow-[0_14px_35px_rgba(98,233,201,0.45)] transition hover:-translate-y-0.5 hover:opacity-90 md:w-auto"
          >
            Track application
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          <Link
            href="/"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 md:w-auto"
          >
            Back to homepage
          </Link>
        </div>

        {/* Small reassurance note */}
        <p className="mt-6 max-w-md text-[11px] text-slate-500">
          Didn’t receive an email within a few minutes? Please check your spam /
          promotions folder or contact our{" "}
          <span className="font-medium text-slate-800">Emergency Service</span>{" "}
          team with your tracking ID.
        </p>
      </div>
    </main>
  );
}
