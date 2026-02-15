"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  ArrowLeft,
  BadgeCheck,
  CreditCard,
  HelpCircle,
  Loader2,
  Lock,
  ShieldCheck,
} from "lucide-react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

function formatMoney(amount: number) {
  const n = Number(amount || 0);
  return n.toFixed(2);
}

function EmbeddedPaymentForm({
  appId,
  amount,
}: {
  appId: string;
  amount: number;
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setError(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/apply/success?appId=${encodeURIComponent(
          appId,
        )}`,
      },
    });

    if (error) {
      setError(error.message || "Payment failed. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handlePay} className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-[#62E9C9]/10">
            <Lock className="h-5 w-5 text-[#62E9C9]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">
              Card details stay private
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Payments are encrypted and processed securely by Stripe. We never
              store your full card number.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-slate-600" />
            <p className="text-sm font-semibold text-slate-900">Payment</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
          <PaymentElement />
        </div>

        {error && (
          <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!stripe || !elements || submitting}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#62E9C9] px-6 py-3 text-sm font-semibold text-[#0c4d3d] shadow-[0_18px_45px_rgba(98,233,201,0.35)] transition hover:-translate-y-0.5 hover:opacity-90 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing…
            </>
          ) : (
            <>Pay ${formatMoney(amount)}</>
          )}
        </button>

        <p className="mt-3 text-center text-[11px] text-slate-500">
          By paying, you agree to our{" "}
          <a
            className="font-semibold text-[#62E9C9] hover:underline"
            href="/terms"
          >
            Terms
          </a>{" "}
          &{" "}
          <a
            className="font-semibold text-[#62E9C9] hover:underline"
            href="/privacy-policy"
          >
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </form>
  );
}

/**
 * ✅ IMPORTANT:
 * useSearchParams() must NOT run in the top-level exported page during prerender.
 * So it lives in this inner component, while the exported page wraps it with Suspense.
 */
function ApplyPaymentPageInner() {
  const searchParams = useSearchParams();

  const appId = searchParams.get("appId") || "";
  const amount = Number(searchParams.get("amount") || 0);

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [bootError, setBootError] = useState<string | null>(null);

  const appearance = useMemo(
    () => ({
      theme: "flat" as const,
      variables: {
        colorPrimary: "#62E9C9",
        colorBackground: "#ffffff",
        colorText: "#0f172a",
        colorTextSecondary: "#64748b",
        borderRadius: "14px",
        spacingUnit: "6px",
      },
      rules: {
        ".Input": {
          border: "1px solid #e2e8f0",
          boxShadow: "none",
        },
        ".Input:focus": {
          border: "1px solid rgba(57, 70, 167, 0.55)",
          boxShadow: "0 0 0 4px rgba(57, 70, 167, 0.10)",
        },
        ".Label": {
          color: "#334155",
          fontWeight: "600",
        },
      },
    }),
    [],
  );

  useEffect(() => {
    if (!appId || !amount) {
      setBootError("Missing payment details. Please go back and try again.");
      return;
    }

    (async () => {
      try {
        setBootError(null);

        const res = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ applicationId: appId, amount }),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Failed to initialize payment.");
        }

        const data = await res.json();
        if (!data?.clientSecret) throw new Error("Missing client secret.");

        setClientSecret(data.clientSecret);
      } catch (e: any) {
        console.error(e);
        setBootError(
          e?.message ||
            "We couldn’t prepare your payment. Please refresh or try again.",
        );
      }
    })();
  }, [appId, amount]);

  if (bootError) {
    return (
      <main className="min-h-screen bg-[#F5F6FB] pt-24 pb-16">
        <div className="mx-auto max-w-xl px-4">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-semibold text-slate-900">
              Payment couldn’t be prepared
            </p>
            <p className="mt-2 text-xs text-slate-600">{bootError}</p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a
                href="/apply"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to apply
              </a>

              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 rounded-full bg-[#62E9C9] px-4 py-2 text-xs font-semibold text-[#0c4d3d] hover:opacity-90"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!clientSecret) {
    return (
      <main className="min-h-screen bg-[#F5F6FB] pt-24 pb-16 flex items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 text-sm text-slate-700 shadow-sm ring-1 ring-slate-200">
          <Loader2 className="h-5 w-5 animate-spin text-[#62E9C9]" />
          <span>Preparing secure payment…</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F6FB] pt-24 pb-16">
      <div className="mx-auto max-w-6xl px-4 lg:px-0">
        {/* Premium hero */}
        <div className="mb-6 rounded-3xl bg-gradient-to-r from-[#62E9C9] to-[#7ff5de] px-5 py-5 shadow-sm ring-1 ring-black/5 sm:px-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700/80">
                Secure Checkout
              </p>
              <h1 className="mt-1 text-xl font-semibold tracking-tight text-[#3C4161] sm:text-2xl">
                Complete your payment
              </h1>
              <p className="mt-1 text-sm text-slate-700/80">
                Application ID:{" "}
                <span className="font-semibold text-[#62E9C9]">{appId}</span>
              </p>
            </div>

            <div className="mt-3 flex items-center gap-2 sm:mt-0">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 text-xs font-semibold text-slate-800 ring-1 ring-slate-200">
                <BadgeCheck className="h-4 w-4 text-emerald-600" />
                Stripe-secured payment
              </span>
            </div>
          </div>
        </div>

        {/* Layout */}
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)]">
          {/* Left: summary */}
          <aside className="space-y-4">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Order Summary
              </p>

              <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Dubai Visa Application
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      Visa fee & application processing
                    </p>
                  </div>
                  <p className="text-lg font-semibold text-slate-900">
                    ${formatMoney(amount)}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-200/70 pt-3 text-xs">
                  <span className="text-slate-600">Total payable</span>
                  <span className="font-semibold text-slate-900">
                    ${formatMoney(amount)}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold text-slate-900">
                    What happens next?
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    After successful payment, your application moves to{" "}
                    <span className="font-semibold">Processing</span>.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold text-slate-900">
                    Need help?
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    Our visa team can assist on WhatsApp or email.
                  </p>
                </div>
              </div>
            </div>

            {/* compact “footer” for this step */}
            <div className="rounded-3xl bg-white p-5 text-xs text-slate-600 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                  <HelpCircle className="h-5 w-5 text-slate-700" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-slate-900">Support</p>
                  <p className="text-slate-600">
                    WhatsApp:{" "}
                    <a
                      className="font-semibold text-[#62E9C9] hover:underline"
                      href="https://wa.me/971558715533"
                      target="_blank"
                      rel="noreferrer"
                    >
                      +971 55 871 5533
                    </a>{" "}
                    · Email:{" "}
                    <a
                      className="font-semibold text-[#62E9C9] hover:underline"
                      href="mailto:support@uaepermit.com"
                    >
                      support@uaepermit.com
                    </a>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Tip: Keep this tab open until you see the success page.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* Right: embedded payment */}
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
            <Elements
              stripe={stripePromise}
              options={{ clientSecret, appearance }}
            >
              <EmbeddedPaymentForm appId={appId} amount={amount} />
            </Elements>

            <div className="mt-5 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-[11px] text-slate-600">
              <span className="inline-flex items-center gap-2">
                <Lock className="h-4 w-4 text-slate-700" />
                Encrypted & PCI-compliant
              </span>
              <span className="font-semibold text-slate-800">
                Powered by Stripe
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/**
 * ✅ Exported page wraps the inner component with Suspense.
 * This is what fixes the build error.
 */
export default function ApplyPaymentPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#F5F6FB] pt-24 pb-16 flex items-center justify-center">
          <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 text-sm text-slate-700 shadow-sm ring-1 ring-slate-200">
            <Loader2 className="h-5 w-5 animate-spin text-[#62E9C9]" />
            <span>Loading payment…</span>
          </div>
        </main>
      }
    >
      <ApplyPaymentPageInner />
    </Suspense>
  );
}
