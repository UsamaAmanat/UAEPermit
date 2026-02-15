// src/app/apply/components/TextField.tsx
"use client";

import React from "react";

type Props = {
  label: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
  value?: string;
  onChange?: (value: string) => void;
};

export function TextField({
  label,
  placeholder,
  required,
  type = "text",
  value,
  onChange,
}: Props) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-600">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-700 placeholder:text-slate-400 shadow-[0_1px_0_rgba(15,23,42,0.03)] outline-none transition focus:border-[#3C4161] focus:ring-2 focus:ring-[#62E9C9]/70"
      />
    </div>
  );
}
