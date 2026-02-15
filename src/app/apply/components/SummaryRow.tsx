// src/app/apply/components/SummaryRow.tsx
"use client";

type Props = {
  label: string;
  value: string;
  hint?: string;          // optional tiny helper under label
  emphasize?: boolean;    // make value stronger
};

export function SummaryRow({ label, value, hint, emphasize }: Props) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[11px] text-slate-300/90">{label}</p>
        {hint ? (
          <p className="mt-0.5 text-[10px] leading-snug text-slate-400">
            {hint}
          </p>
        ) : null}
      </div>

      <p
        className={[
          "text-right text-[11px] font-medium text-slate-50 tabular-nums leading-snug",
          emphasize ? "text-white font-semibold" : "",
        ].join(" ")}
        title={value}
      >
        <span className="block max-w-[180px] truncate">{value}</span>
      </p>
    </div>
  );
}
