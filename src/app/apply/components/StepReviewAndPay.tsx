"use client";

import type { Applicant, Plan } from "../types";

type Props = {
  applicants: Applicant[];
  plan: Plan;
  extraFastSelected: boolean;
  applicationId: string | null;
  reviewConfirmed: boolean;
  onChangeReviewConfirmed: (value: boolean) => void;
};

// ✅ MUST MATCH your UI + sidebar: 100 per applicant
const EXTRA_FAST_FEE_PER_APPLICANT = 100;

// ✅ define what “complete” means at review step
function isApplicantComplete(a: Applicant) {
  const requiredFields: (keyof Applicant)[] = [
    "firstName",
    "lastName",
    "email",
    "phone",
    "passportNumber",
    "profession",
    "purposeOfTravel",
    "nationality",
    "applyingFrom",
    "tentativeTravelDate",
  ];

  return requiredFields.every((k) => {
    const v = (a as any)[k];
    return typeof v === "string" ? v.trim().length > 0 : Boolean(v);
  });
}

export function StepReviewAndPay({
  applicants,
  plan,
  extraFastSelected,
  applicationId,
  reviewConfirmed,
  onChangeReviewConfirmed,
}: Props) {
  const applicantsCount = applicants.length;
  const hasApplicants = applicantsCount > 0;

  const priceNumber = Number(plan.price) || 0;
  const subtotal = priceNumber * applicantsCount;

  const extraFastFee = extraFastSelected
    ? EXTRA_FAST_FEE_PER_APPLICANT * applicantsCount
    : 0;

  const total = subtotal + extraFastFee;

  // ✅ premium: per applicant completion validation
  const incompleteCount = applicants.filter(
    (a) => !isApplicantComplete(a),
  ).length;
  const allComplete = hasApplicants && incompleteCount === 0;

  // ✅ checkbox only usable when everything is complete
  const canConfirm = allComplete;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-base font-semibold text-slate-900">
          Review your application
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Confirm traveller details and visa selection before you pay. Make sure
          everything matches the passport exactly.
        </p>
      </div>

      {/* Plan summary */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Selected plan
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {plan.visa}
            </p>
            <p className="text-xs text-slate-500">
              {plan.country} · {plan.entry}
            </p>
          </div>

          <div className="mt-3 flex items-end gap-2 sm:mt-0">
            <div className="text-right text-xs text-slate-500">
              <p>Visa fee (per applicant)</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {priceNumber.toFixed(2)} $
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 text-xs text-slate-600 sm:grid-cols-3">
          <div>
            <p className="font-medium text-slate-800">Processing time</p>
            <p className="mt-0.5">{plan.processingTime}</p>
          </div>
          <div>
            <p className="font-medium text-slate-800">Stay validity</p>
            <p className="mt-0.5">{plan.validity}</p>
          </div>
          <div>
            <p className="font-medium text-slate-800">Service type</p>
            <p className="mt-0.5">Standard processing</p>
          </div>
        </div>
      </div>

      {/* Travellers */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-900">
            Travellers ({applicantsCount})
          </h3>

          {hasApplicants && (
            <span
              className={[
                "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ring-1",
                allComplete
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                  : "bg-amber-50 text-amber-700 ring-amber-200",
              ].join(" ")}
            >
              {allComplete ? "Ready to pay" : `${incompleteCount} incomplete`}
            </span>
          )}
        </div>

        {!hasApplicants && (
          <p className="rounded-xl border border-dashed border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            No applicants added yet. Please add at least one applicant in the
            previous step.
          </p>
        )}

        {hasApplicants && (
          <ul className="space-y-3">
            {applicants.map((applicant, index) => {
              const fullName =
                [applicant.firstName, applicant.lastName]
                  .filter(Boolean)
                  .join(" ") || `Applicant ${index + 1}`;

              const complete = isApplicantComplete(applicant);

              return (
                <li
                  key={applicant.id ?? index}
                  className={[
                    "flex flex-col justify-between gap-2 rounded-xl border px-3 py-3 text-xs sm:flex-row sm:items-center",
                    complete
                      ? "border-slate-100 bg-slate-50/60"
                      : "border-amber-200 bg-amber-50/50",
                  ].join(" ")}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900">{fullName}</p>
                      {!complete && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-800">
                          Missing info
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500">
                      Passport:{" "}
                      <span className="font-medium text-slate-800">
                        {applicant.passportNumber || "—"}
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Email:{" "}
                      <span className="font-medium text-slate-800">
                        {applicant.email || "—"}
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Travel date:{" "}
                      <span className="font-medium text-slate-800">
                        {applicant.tentativeTravelDate || "—"}
                      </span>
                    </p>
                  </div>

                  <div className="shrink-0 text-right text-[11px] text-slate-500">
                    <p>Visa fee</p>
                    <p className="mt-0.5 font-semibold text-slate-900">
                      {priceNumber.toFixed(2)} $
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <p className="mt-3 text-[11px] text-slate-500">
          Please double-check spellings of names, passport numbers, and travel
          dates. Changes after payment may require additional fees.
        </p>
      </div>

      {/* Payment summary */}
      <div className="rounded-2xl border border-slate-900/80 bg-slate-900 px-5 py-5 text-xs text-slate-100 shadow-[0_18px_40px_rgba(15,23,42,0.6)]">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Payment summary
            </p>
            <p className="mt-1 max-w-xs text-[11px] text-slate-300">
              You’ll be charged on the next step for the selected visa and
              options.
            </p>
            {applicationId && (
              <p className="mt-1 text-[10px] text-slate-500">
                Application ID:{" "}
                <span className="font-medium text-slate-200">
                  {applicationId}
                </span>
              </p>
            )}
          </div>

          <div className="text-right">
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
              Total payable
            </p>
            <p className="mt-1 text-2xl font-semibold leading-none text-white">
              {total.toFixed(2)} <span className="text-sm align-middle">$</span>
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-1.5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[11px] text-slate-200">
              Visa fee ({applicantsCount} traveller
              {applicantsCount === 1 ? "" : "s"})
            </span>
            <span className="text-sm font-medium text-slate-50">
              {subtotal.toFixed(2)} $
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="inline-flex items-center gap-2 text-[11px] text-slate-300">
              Extra fast processing
              <span
                className={[
                  "rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.14em]",
                  extraFastSelected
                    ? "border-lime-400 bg-lime-500/10 text-lime-100"
                    : "border-slate-500 text-slate-300",
                ].join(" ")}
              >
                {extraFastSelected ? "Added" : "Optional"}
              </span>
            </span>

            <span className="text-sm text-slate-100">
              {extraFastSelected ? `+ ${extraFastFee.toFixed(2)} $` : "—"}
            </span>
          </div>

          {extraFastSelected && (
            <p className="text-[10px] text-slate-400">
              Extra fast fee: {EXTRA_FAST_FEE_PER_APPLICANT} $ ×{" "}
              {applicantsCount} applicant
              {applicantsCount === 1 ? "" : "s"}
            </p>
          )}
        </div>

        <div className="mt-5 space-y-3 border-t border-slate-700/70 pt-4">
          {!allComplete && hasApplicants && (
            <p className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-[11px] text-amber-200">
              Some traveller details are missing. Please go back and complete
              all required fields before confirming.
            </p>
          )}

          <label className="flex items-start gap-2 text-[11px] text-slate-200">
            <input
              type="checkbox"
              disabled={!canConfirm}
              className="mt-0.5 h-4 w-4 rounded border-slate-400 text-[#62E9C9] focus:ring-[#62E9C9] disabled:opacity-50"
              checked={reviewConfirmed}
              onChange={(e) => onChangeReviewConfirmed(e.target.checked)}
            />
            <span>
              I confirm that all applicant details and uploaded documents are
              correct. I understand that incorrect information may cause delays
              or rejection.
            </span>
          </label>

          <p className="max-w-xl text-[10px] text-slate-400">
            On the next step you will complete the payment using our secure
            payment provider. Once the payment is successful, your application
            will move to processing.
          </p>
        </div>
      </div>
    </div>
  );
}
