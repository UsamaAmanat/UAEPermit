// src/app/apply/ApplyPageClient.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { createApplication } from "@/lib/firestore/applications";
import { StepPlanSelection } from "./components/StepPlanSelection";
import { StepDocsAndApplicants } from "./components/StepDocsAndApplicants";
import { StepReviewAndPay } from "./components/StepReviewAndPay";
import { SummaryRow } from "./components/SummaryRow";
import ApplyCountryPicker from "./ApplyCountryPicker";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Applicant, Plan, ApplicantDocs } from "./types";
import { emptyDocs } from "./types";
import { db } from "@/lib/firebaseClient";
import { doc, getDoc } from "firebase/firestore";

const STEPS = [
  { id: 1, label: "Visa & Plan" },
  { id: 2, label: "Upload & Details" },
  { id: 3, label: "Review & Pay" },
];

const isoDate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const tomorrowISO = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return isoDate(d);
};

const createEmptyApplicant = (): Applicant => ({
  id: Date.now().toString(),
  countryCode: "",
  phone: "",
  email: "",
  firstName: "",
  lastName: "",
  nationality: "",
  applyingFrom: "",
  passportNumber: "",
  profession: "",
  purposeOfTravel: "",
  tentativeTravelDate: tomorrowISO(),
});

function isFutureDateISO(dateStr: string) {
  // expects "YYYY-MM-DD" (native date input / many pickers output this)
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;

  // compare by day (ignore time)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const chosen = new Date(d);
  chosen.setHours(0, 0, 0, 0);

  return chosen.getTime() > today.getTime();
}

export default function ApplyPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const countrySlug = searchParams.get("country") || "";
  const planId = searchParams.get("planId") || "";
  const hasPreselectedPlan = !!(countrySlug && planId);

  // ✅ Client request: Extra Fast Fee = $100 per applicant

  // If user lands on /apply without selecting a plan → show country picker
  if (!hasPreselectedPlan) {
    return <ApplyCountryPicker />;
  }

  const plan: Plan = useMemo(() => {
    const countryName =
      searchParams.get("countryName") ||
      searchParams.get("country") ||
      "Choose your country";

    const visa = searchParams.get("visa") || "Select a Dubai visa type";
    const entry = searchParams.get("entry") || "Single Entry";
    const price = searchParams.get("price") || "150";

    return {
      id: planId,
      country: countryName,
      visa,
      entry,
      price,
      processingTime: "24 to 48 hours",
      validity: "Up to 30 days stay",
    };
  }, [searchParams, planId]);

  // Wizard state
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  const [applicants, setApplicants] = useState<Applicant[]>([
    createEmptyApplicant(),
  ]);

  const [docs, setDocs] = useState<ApplicantDocs[]>(() =>
    applicants.map(() => emptyDocs()),
  );

  const [policy1, setPolicy1] = useState(false);
  const [policy2, setPolicy2] = useState(false);

  const [extraFastSelected, setExtraFastSelected] = useState(false);
  const [reviewConfirmed, setReviewConfirmed] = useState(false);

  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [savingApp, setSavingApp] = useState(false);
  const [redirectingToCheckout, setRedirectingToCheckout] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [extraFastFeePerApplicant, setExtraFastFeePerApplicant] =
    useState<number>(0);

  // ---------- PRICING TOTALS ----------
  const applicantsCount = applicants.length;
  const pricePerApplicant = Number(plan.price || 0);

  const baseTotal = pricePerApplicant * applicantsCount;
  const extraFastTotal = extraFastSelected
    ? extraFastFeePerApplicant * applicantsCount
    : 0;

  const grandTotal = baseTotal + extraFastTotal;

  // keep docs length in sync with applicants
  useEffect(() => {
    setDocs((prev) => {
      if (prev.length === applicants.length) return prev;

      const clone = [...prev];
      while (clone.length < applicants.length) clone.push(emptyDocs());
      while (clone.length > applicants.length) clone.pop();
      return clone;
    });
  }, [applicants.length]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // 1) try per-country override (countries/{slug}.addons.extraFast)
        // 2) fallback to global (settings/pricing.addons.extraFast)
        let fee = 0;

        if (countrySlug) {
          const countrySnap = await getDoc(doc(db, "countries", countrySlug));
          const ef = (countrySnap.exists() ? (countrySnap.data() as any) : null)
            ?.addons?.extraFast;
          if (ef && ef.enabled) fee = Number(ef.amount || 0);
        }

        if (!fee) {
          const settingsSnap = await getDoc(doc(db, "settings", "pricing"));
          const ef = (
            settingsSnap.exists() ? (settingsSnap.data() as any) : null
          )?.addons?.extraFast;
          if (ef && ef.enabled) fee = Number(ef.amount || 0);
        }

        if (!cancelled)
          setExtraFastFeePerApplicant(Number.isFinite(fee) ? fee : 0);
      } catch (e) {
        console.error("Failed to load Extra Fast price", e);
        if (!cancelled) setExtraFastFeePerApplicant(0);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [countrySlug]);

  const isApplicantValid = (a: Applicant) => {
    const basic =
      a.phone?.trim() &&
      a.email?.trim() &&
      a.firstName?.trim() &&
      a.lastName?.trim() &&
      a.nationality?.trim() &&
      a.applyingFrom?.trim() &&
      a.passportNumber?.trim() &&
      a.profession?.trim() &&
      a.purposeOfTravel?.trim() &&
      a.tentativeTravelDate?.trim();

    if (!basic) return false;

    // must be a future date
    return isFutureDateISO(a.tentativeTravelDate);
  };

  const isDocsValid = (d?: ApplicantDocs) => {
    const passportOk = (d?.passport?.length ?? 0) > 0;
    const photoOk = (d?.photo?.length ?? 0) > 0;
    return passportOk && photoOk;
  };

  const isStep1Valid = true; // plan is preselected / read-only confirmation
  const isStep2Valid =
    applicants.length > 0 &&
    applicants.every(isApplicantValid) &&
    docs.length === applicants.length &&
    docs.every(isDocsValid) &&
    policy1 &&
    policy2;

  const isStep3Valid = reviewConfirmed;

  const isCurrentStepValid =
    activeStep === 1
      ? isStep1Valid
      : activeStep === 2
        ? isStep2Valid
        : isStep3Valid;

  const isBusy = savingApp || redirectingToCheckout;

  const busyLabel = savingApp
    ? "Saving your application…"
    : redirectingToCheckout
      ? "Connecting to secure payment…"
      : "Please wait…";

  // ✅ Re-enable real flow (was forced true before)
  const canGoNext = isCurrentStepValid && !isBusy;
  const normalizeEmail = (v: string) => v.trim().toLowerCase();

  const isValidEmail = (v: string) => {
    const s = normalizeEmail(v);
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
  };

  const normalizePhoneDigits = (v: string) => v.replace(/[^\d]/g, "");

  const isValidPhone = (digits: string) =>
    digits.length >= 7 && digits.length <= 15;

  type ApplicantContactErrors = { email?: string; phone?: string };
  const [applicantErrors, setApplicantErrors] = useState<
    ApplicantContactErrors[]
  >(() => applicants.map(() => ({})));

  // ---------- APPLICANTS CRUD ----------
  const handleApplicantChange = (
    index: number,
    field: keyof Applicant,
    value: string,
  ) => {
    setApplicants((prev) => {
      const clone = [...prev];
      clone[index] = { ...clone[index], [field]: value };
      return clone;
    });

    // ✅ validate only email/phone (others unchanged)
    if (field === "email" || field === "phone") {
      setApplicantErrors((prev) => {
        const clone = [...prev];
        const current = { ...(clone[index] || {}) };

        if (field === "email") {
          if (!value.trim()) current.email = "Email is required";
          else if (!isValidEmail(value)) current.email = "Enter a valid email";
          else delete current.email;
        }

        if (field === "phone") {
          const digits = normalizePhoneDigits(value);
          if (!digits) current.phone = "Phone is required";
          else if (!isValidPhone(digits))
            current.phone = "Enter a valid phone number";
          else delete current.phone;
        }

        clone[index] = current;
        return clone;
      });
    }
  };

  const handleAddApplicant = () => {
    setApplicants((prev) => [...prev, createEmptyApplicant()]);
  };

  const handleRemoveApplicant = (index: number) => {
    setApplicants((prev) => {
      if (prev.length === 1) return prev;
      const clone = [...prev];
      clone.splice(index, 1);
      return clone;
    });
  };

  // ---------- FIRESTORE + STRIPE ----------
  const ensureApplicationCreated = async () => {
    if (applicationId) return applicationId;

    setSavingApp(true);
    setSaveError(null);

    try {
      const id = await createApplication({
        plan,
        applicants,
        docs,
        extraFastSelected,
      });

      setApplicationId(id);

      toast.success("Application saved", {
        description: "Your details and documents have been stored securely.",
      });

      return id;
    } catch (err: any) {
      console.error("Failed to create application", err);
      const message =
        err?.message ||
        "Failed to create application. Please check your details and try again.";

      setSaveError(message);

      toast.error("Couldn’t save your application", {
        description: message,
      });

      throw err;
    } finally {
      setSavingApp(false);
    }
  };

  const goToCheckout = async () => {
    try {
      const appId = await ensureApplicationCreated();
      setRedirectingToCheckout(true);
      setSaveError(null);

      router.push(
        `/apply/payment?appId=${encodeURIComponent(appId)}&amount=${encodeURIComponent(
          grandTotal,
        )}`,
      );
    } catch (err: any) {
      console.error(err);
      setRedirectingToCheckout(false);

      const message =
        err?.message ||
        "Something went wrong while starting payment. Please try again.";

      setSaveError(message);

      toast.error("Payment couldn’t be started", {
        description: message,
      });
    }
  };

  // ---------- NAVIGATION ----------
  const handleNext = async () => {
    if (!canGoNext) return;

    if (activeStep === 1) {
      setActiveStep(2);
      return;
    }

    if (activeStep === 2) {
      try {
        await ensureApplicationCreated();
        setActiveStep(3);
      } catch {
        // handled by toast
      }
      return;
    }

    if (activeStep === 3) {
      await goToCheckout();
    }
  };

  const handleBack = () => {
    if (isBusy) return;
    setActiveStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3) : prev));
  };

  const currentStepLabel = activeStep === 3 ? "Proceed to Payment" : "Next";

  // ---------- RENDER ----------
  return (
    <main className="min-h-screen bg-[#F5F6FB] pt-24 pb-16">
      <div className="mx-auto max-w-6xl px-4 lg:px-0">
        {/* Top heading + breadcrumb */}
        <header className="mb-6 flex flex-col gap-3 md:mb-8 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-500 shadow-sm ring-1 ring-slate-200">
              <span className="h-1.5 w-1.5 rounded-full bg-[#62E9C9]" />
              <span>Home</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-800">Apply</span>
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-[#3C4161] md:text-3xl">
                Apply for Dubai Visa
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-600 md:text-[15px]">
                Complete your application in a few simple steps. Your current
                selection:{" "}
                <span className="font-semibold text-[#62E9C9]\">
                  {plan.country} – {plan.visa} ({plan.entry})
                </span>
                .
              </p>
            </div>
          </div>

          <div className="mt-2 inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#62E9C9] to-[#7ff5de] px-4 py-3 text-xs md:text-sm shadow-md">
            <div className="flex flex-col leading-tight text-[#3C4161]">
              <span className="font-semibold">Secure Online Process</span>
              <span className="text-[11px] md:text-xs">
                Encrypted uploads · Expert visa team · Real-time updates
              </span>
            </div>
          </div>
        </header>

        {saveError && (
          <p className="mb-3 text-xs font-medium text-rose-600">{saveError}</p>
        )}

        {/* Stepper */}
        <section className="mb-8 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200">
          <ol className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {STEPS.map((step, index) => {
              const isActive = step.id === activeStep;
              const isCompleted = step.id < activeStep;
              const isLast = index === STEPS.length - 1;

              return (
                <li
                  key={step.id}
                  className="flex flex-1 items-center gap-3 md:gap-4"
                >
                  <button
                    type="button"
                    disabled={isBusy}
                    className={[
                      "flex items-center gap-3 rounded-full px-3 py-2 text-left transition-all cursor-pointer flex-1",
                      isActive
                        ? "bg-[#62E9C9] text-[#0c4d3d] shadow-md"
                        : isCompleted
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                          : "bg-slate-50 text-slate-500 hover:bg-slate-100",
                    ].join(" ")}
                    onClick={() => {
                      if (isBusy) return;

                      const target = step.id as 1 | 2 | 3;

                      // back allowed
                      if (target <= activeStep) {
                        setActiveStep(target);
                        return;
                      }

                      // forward: only allow next immediate step, and only if current is valid
                      if (target !== activeStep + 1) {
                        toast.error("Please proceed step by step.");
                        return;
                      }

                      if (!isCurrentStepValid) {
                        toast.error(
                          "Please complete the required fields before continuing.",
                        );
                        return;
                      }

                      setActiveStep(target);
                    }}
                  >
                    <span
                      className={[
                        "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                        isActive
                          ? "bg-white/15 border border-white/40"
                          : isCompleted
                            ? "bg-emerald-500 text-white"
                            : "bg-white text-slate-500 border border-slate-200",
                      ].join(" ")}
                    >
                      {isCompleted ? "✓" : step.id}
                    </span>
                    <span className="text-xs font-medium tracking-wide md:text-sm">
                      {step.label}
                    </span>
                  </button>

                  {!isLast && (
                    <div className="hidden flex-1 border-t border-dashed border-slate-200 md:block" />
                  )}
                </li>
              );
            })}
          </ol>
        </section>

        {/* Main content grid */}
        <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
          {/* Left side – step content */}
          <div className="space-y-6">
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-6">
              {activeStep === 1 && <StepPlanSelection plan={plan} />}

              {activeStep === 2 && (
                <StepDocsAndApplicants
                  applicants={applicants}
                  applicantErrors={applicantErrors} // ✅ ADD THIS
                  pricePerApplicant={plan.price}
                  policy1={policy1}
                  policy2={policy2}
                  onChangeApplicant={handleApplicantChange}
                  onAddApplicant={handleAddApplicant}
                  onRemoveApplicant={handleRemoveApplicant}
                  onChangePolicy1={setPolicy1}
                  onChangePolicy2={setPolicy2}
                  extraFastSelected={extraFastSelected}
                  onToggleExtraFast={setExtraFastSelected}
                  docs={docs}
                  onDocsChange={setDocs}
                />
              )}

              {activeStep === 3 && (
                <StepReviewAndPay
                  applicants={applicants}
                  plan={plan}
                  extraFastSelected={extraFastSelected}
                  applicationId={applicationId}
                  reviewConfirmed={reviewConfirmed}
                  onChangeReviewConfirmed={setReviewConfirmed}
                />
              )}

              {/* Bottom nav */}
              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={activeStep === 1 || isBusy}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Back</span>
                </button>

                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>
                    Step {activeStep} of {STEPS.length}
                  </span>

                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!canGoNext}
                    className="inline-flex items-center gap-2 rounded-full bg-[#62E9C9] px-5 py-2 text-xs font-semibold text-[#0c4d3d] shadow-md transition-transform hover:-translate-y-0.5 hover:opacity-90 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isBusy ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>{busyLabel}</span>
                      </>
                    ) : (
                      <>
                        <span>{currentStepLabel}</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Optional: show small hint when disabled (premium + helpful) */}
              {!isBusy && !canGoNext && activeStep === 2 && (
                <p className="mt-3 text-[11px] text-slate-500">
                  Please complete all required applicant fields and accept both
                  policies.{" "}
                  <span className="font-medium text-slate-700">
                    Tentative Travel Date must be in the future.
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Right – Selected plan card */}
          <aside className="space-y-4">
            <div className="sticky top-24 space-y-4">
              <div className="overflow-hidden rounded-2xl bg-gradient-to-b from-[#2f345c] via-[#343a66] to-[#222642] text-white shadow-xl">
                <div className="px-5 pb-4 pt-5">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#62E9C9]">
                    Selected Plan
                  </p>
                  <h2 className="mt-1 text-lg font-semibold leading-tight">
                    {plan.visa}
                  </h2>
                  <p className="mt-1 text-xs text-slate-200">
                    {plan.country} · {plan.entry}
                  </p>
                </div>

                <div className="space-y-3 bg-[#252949]/70 px-5 py-4 text-xs">
                  <SummaryRow
                    label="Processing time"
                    value={plan.processingTime}
                  />
                  <SummaryRow label="Stay validity" value={plan.validity} />
                  <SummaryRow
                    label="Service type"
                    value="Standard processing"
                  />
                  <SummaryRow
                    label="Number of applicants"
                    value={String(applicants.length)}
                  />
                </div>

                <div className="border-t border-white/10 bg-[#181b30]/90 px-5 py-4 text-xs">
                  <div className="space-y-2">
                    <SummaryRow
                      label="Visa fee (per applicant)"
                      value={`${pricePerApplicant} $`}
                    />
                    <SummaryRow
                      label="Number of applicants"
                      value={String(applicantsCount)}
                    />
                    <SummaryRow
                      label="Visa fee subtotal"
                      value={`${baseTotal} $`}
                    />

                    <div className="mt-3 flex items-start justify-between gap-3 text-[11px]">
                      <div className="flex flex-col">
                        <span className="text-slate-200">
                          Extra fast processing
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ${extraFastFeePerApplicant} per applicant
                        </span>
                      </div>

                      <span
                        className={`mt-0.5 rounded-full px-3 py-1 text-[11px] font-semibold ${
                          extraFastSelected
                            ? "bg-[#62E9C9] text-[#0c4d3d]"
                            : "bg-slate-800/80 text-slate-100"
                        }`}
                      >
                        {extraFastSelected
                          ? `+ ${extraFastTotal} $`
                          : "Optional"}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between rounded-xl bg-[#141726] px-3 py-2">
                      <div className="flex flex-col">
                        <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                          Total to pay
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {applicantsCount} applicant
                          {applicantsCount > 1 ? "s" : ""}{" "}
                          {extraFastSelected ? "+ extra fast" : ""}
                        </span>
                      </div>
                      <span className="text-base font-semibold text-white">
                        {grandTotal} $
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-4 text-xs text-slate-600 shadow-sm ring-1 ring-slate-200">
                <p className="font-semibold text-slate-800">
                  Need help while applying?
                </p>
                <p className="mt-1">
                  Our visa experts are available on WhatsApp & email if you get
                  stuck at any step. No hidden charges.
                </p>
              </div>
            </div>
          </aside>
        </section>
      </div>

      {/* Busy overlay */}
      {isBusy && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px]">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-[#62E9C9]/10">
                <Loader2 className="h-5 w-5 animate-spin text-[#62E9C9]" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-900">
                  {savingApp
                    ? "Saving your application"
                    : "Starting secure payment"}
                </p>
                <p className="text-xs leading-relaxed text-slate-500">
                  {savingApp
                    ? "We’re uploading your documents and creating your application in our system. This usually takes a few seconds."
                    : "We’re connecting you to our encrypted Stripe checkout. Please don’t refresh or close this window."}
                </p>
              </div>
            </div>

            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-[#62E9C9] via-[#3C4161] to-[#62E9C9] animate-pulse" />
            </div>

            <p className="mt-2 text-[10px] text-right uppercase tracking-[0.16em] text-slate-400">
              Secure processing…
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
