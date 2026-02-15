// src/app/apply/components/StepPlanSelection.tsx
"use client";

import type { Plan } from "../types";
import { useRouter } from "next/navigation";
import { CheckCircle2, Edit3, ShieldCheck, Clock3 } from "lucide-react";

type Props = { plan: Plan };

export function StepPlanSelection({ plan }: Props) {
  const router = useRouter();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-900">
            Visa &amp; Plan
          </h2>
          <p className="text-sm text-slate-600">
            Confirm your selection before moving forward.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          title="Go back and change your plan"
        >
          <Edit3 className="h-3.5 w-3.5" />
          Change plan
        </button>
      </div>

      {/* Premium Summary Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-[#62E9C9]/10 via-white to-[#62E9C9]/20 px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
            Your selected package
          </p>
          <div className="mt-1 text-base font-semibold text-slate-900">
            {plan.visa}
          </div>
          <div className="mt-1 text-sm text-slate-600">
            {plan.country} · {plan.entry}
          </div>

          {/* Chips */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
              Country: {plan.country}
            </span>
            <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
              Visa: {plan.visa}
            </span>
            <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
              Entry: {plan.entry}
            </span>
          </div>
        </div>

        {/* Highlights */}
        <div className="grid gap-3 px-5 py-4 md:grid-cols-3">
          <div className="flex items-start gap-3 rounded-xl bg-slate-50 px-3 py-3 ring-1 ring-slate-200">
            <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#62E9C9]/10">
              <Clock3 className="h-4 w-4 text-[#62E9C9]" />
            </div>
            <div className="leading-tight">
              <p className="text-xs font-semibold text-slate-900">Processing</p>
              <p className="text-xs text-slate-600">{plan.processingTime}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl bg-slate-50 px-3 py-3 ring-1 ring-slate-200">
            <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="leading-tight">
              <p className="text-xs font-semibold text-slate-900">
                Secure handling
              </p>
              <p className="text-xs text-slate-600">
                Encrypted uploads & privacy
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl bg-slate-50 px-3 py-3 ring-1 ring-slate-200">
            <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#62E9C9]/40">
              <CheckCircle2 className="h-4 w-4 text-slate-900" />
            </div>
            <div className="leading-tight">
              <p className="text-xs font-semibold text-slate-900">Next steps</p>
              <p className="text-xs text-slate-600">Upload → Review → Pay</p>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="border-t border-slate-100 bg-white px-5 py-4">
          <div className="rounded-xl bg-[#62E9C9]/5 px-4 py-3 text-xs text-slate-700 ring-1 ring-[#62E9C9]/10">
            <span className="font-semibold text-slate-900">Tip:</span> If
            anything looks incorrect, use{" "}
            <span className="font-semibold">Change plan</span> before
            continuing.
          </div>
        </div>
      </div>
    </div>
  );
}
