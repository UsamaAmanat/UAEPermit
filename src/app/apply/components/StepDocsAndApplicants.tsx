"use client";

import { useEffect, useState, useRef } from "react";
import {
  Upload,
  Trash2,
  Plus,
  X,
  FileText,
  Image as ImageIcon,
  ChevronDown,
  CalendarDays,
} from "lucide-react";
import ReactCountryFlag from "react-country-flag";
import "react-day-picker/dist/style.css";

import { DayPicker, type CaptionProps } from "react-day-picker";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Switch } from "@headlessui/react";

import type { Applicant, ApplicantDocs, DocKind } from "../types";
import { emptyDocs } from "../types";

type DateFieldProps = {
  label: string;
  value: string;
  required?: boolean;
  onChange: (value: string) => void;
};

function parseDate(value: string): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split("-").map((p) => Number(p));
  if (!y || !m || !d) return null;
  const dt = new Date(y, m - 1, d);
  if (Number.isNaN(dt.getTime())) return null;
  return dt;
}

function formatDateForInput(d: Date | null): string {
  if (!d) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatDateForDisplay(d: Date | null): string {
  if (!d) return "";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function DateField({ label, value, required, onChange }: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<Date | null>(() => {
    const d = parseDate(value);
    if (d) return d;

    // ✅ default to today's date (at midnight)
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate());
  });

  const [monthView, setMonthView] = useState<Date>(() => {
    const d = parseDate(value);
    if (d) return d;

    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), 1); // month view at current month
  });

  const containerRef = useRef<HTMLDivElement | null>(null);

  // ✅ if no value provided, set today's date into parent state once
  useEffect(() => {
    const d = parseDate(value);
    if (d) return;

    const t = new Date();
    const todayMidnight = new Date(t.getFullYear(), t.getMonth(), t.getDate());
    const iso = formatDateForInput(todayMidnight);

    onChange(iso);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const d = parseDate(value);
    setCurrent(d);
    if (d) setMonthView(d);
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const year = monthView.getFullYear();
  const month = monthView.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const firstDay = firstOfMonth.getDay(); // 0-6
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // ✅ Disable past dates (today allowed)
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  const isPastDay = (day: number) => {
    const picked = new Date(year, month, day);
    return picked < startOfToday;
  };

  // ✅ Disable going to months before current month
  const isPrevMonthDisabled = () => {
    const curMonthStart = new Date(
      startOfToday.getFullYear(),
      startOfToday.getMonth(),
      1,
    );
    const viewMonthStart = new Date(year, month, 1);
    return viewMonthStart <= curMonthStart;
  };

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  while (days.length % 7 !== 0) days.push(null);

  const displayValue = formatDateForDisplay(current);

  const handleSelectDay = (day: number) => {
    if (isPastDay(day)) return;
    const picked = new Date(year, month, day);
    const iso = formatDateForInput(picked);
    onChange(iso);
    setOpen(false);
  };

  const goMonth = (delta: number) => {
    if (delta < 0 && isPrevMonthDisabled()) return;
    const m = new Date(monthView);
    m.setMonth(m.getMonth() + delta);
    setMonthView(m);
  };

  return (
    <div className="relative w-full space-y-1" ref={containerRef}>
      <label className="text-xs font-medium text-slate-600">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-700 shadow-[0_1px_0_rgba(15,23,42,0.03)] outline-none transition hover:bg-slate-50 focus:border-[#3C4161] focus:ring-0 focus:outline-none focus-visible:outline-none"
      >
        <span className={displayValue ? "" : "text-slate-400"}>
          {displayValue || "Select date"}
        </span>
        <CalendarDays className="h-4 w-4 text-slate-400" />
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-64 rounded-2xl border border-slate-200 bg-white p-3 text-[11px] text-slate-700 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => goMonth(-1)}
              disabled={isPrevMonthDisabled()}
              className={[
                "rounded-full p-1 focus:outline-none focus-visible:outline-none",
                isPrevMonthDisabled()
                  ? "cursor-not-allowed opacity-40"
                  : "hover:bg-slate-100",
              ].join(" ")}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            <span className="text-xs font-semibold">
              {monthView.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </span>

            <button
              type="button"
              onClick={() => goMonth(1)}
              className="rounded-full p-1 hover:bg-slate-100 focus:outline-none focus-visible:outline-none"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-[10px] text-slate-400">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div key={d} className="flex h-6 items-center justify-center">
                {d}
              </div>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1 text-[11px]">
            {days.map((d, idx) => {
              if (!d) {
                return (
                  <div
                    key={idx}
                    className="flex h-7 items-center justify-center text-slate-300"
                  />
                );
              }

              const isSelected =
                current &&
                current.getFullYear() === year &&
                current.getMonth() === month &&
                current.getDate() === d;

              const disabled = isPastDay(d);

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleSelectDay(d)}
                  className={[
                    "flex h-7 items-center justify-center rounded-full text-xs focus:outline-none focus-visible:outline-none",
                    disabled
                      ? "cursor-not-allowed text-slate-300"
                      : isSelected
                        ? "bg-[#62E9C9] text-[#0c4d3d]"
                        : "text-slate-700 hover:bg-slate-100",
                  ].join(" ")}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

type ApplicantContactErrors = { email?: string; phone?: string };

type StepDocsAndApplicantsProps = {
  applicants: Applicant[];

  // ✅ keep your existing type (string)
  pricePerApplicant: string;

  policy1: boolean;
  policy2: boolean;
  onChangePolicy1: (checked: boolean) => void;
  onChangePolicy2: (checked: boolean) => void;

  // ✅ keep your existing handler signature
  onChangeApplicant: (
    index: number,
    field: keyof Applicant,
    value: string,
  ) => void;

  onAddApplicant: () => void;
  onRemoveApplicant: (index: number) => void;

  extraFastSelected: boolean;
  onToggleExtraFast: (value: boolean) => void;

  // ✅ keep your existing docs types (no "any")
  docs: ApplicantDocs[];
  onDocsChange: React.Dispatch<React.SetStateAction<ApplicantDocs[]>>;

  // ✅ only addition (new)
  applicantErrors?: ApplicantContactErrors[]; // optional so nothing breaks if not passed yet
};

/* ------------------------------------------------------------------ */
/*  COUNTRY DATA + HELPERS                                             */
/* ------------------------------------------------------------------ */

type Country = { name: string; code: string };

// FULL list you gave
const COUNTRIES: Country[] = [
  // A
  { name: "Albania", code: "AL" },
  { name: "Algeria", code: "DZ" },
  { name: "Andorra", code: "AD" },
  { name: "Angola", code: "AO" },
  { name: "Antigua and Barbuda", code: "AG" },
  { name: "Argentina", code: "AR" },
  { name: "Armenia", code: "AM" },
  { name: "Australia", code: "AU" },
  { name: "Austria", code: "AT" },
  { name: "Azerbaijan", code: "AZ" },

  // B
  { name: "Bahamas", code: "BS" },
  { name: "Bahrain", code: "BH" },
  { name: "Bangladesh", code: "BD" },
  { name: "Barbados", code: "BB" },
  { name: "Belarus", code: "BY" },
  { name: "Belgium", code: "BE" },
  { name: "Belize", code: "BZ" },
  { name: "Benin", code: "BJ" },
  { name: "Bhutan", code: "BT" },
  { name: "Bolivia", code: "BO" },
  { name: "Bosnia and Herzegovina", code: "BA" },
  { name: "Botswana", code: "BW" },
  { name: "Brazil", code: "BR" },
  { name: "Brunei", code: "BN" },
  { name: "Bulgaria", code: "BG" },
  { name: "Burkina Faso", code: "BF" },
  { name: "Burundi", code: "BI" },

  // C
  { name: "Cabo Verde", code: "CV" },
  { name: "Cambodia", code: "KH" },
  { name: "Cameroon", code: "CM" },
  { name: "Canada", code: "CA" },
  { name: "Central African Republic", code: "CF" },
  { name: "Chad", code: "TD" },
  { name: "Chile", code: "CL" },
  { name: "China", code: "CN" },
  { name: "Colombia", code: "CO" },
  { name: "Côte d'Ivoire", code: "CI" },
  { name: "Comoros", code: "KM" },
  { name: "Costa Rica", code: "CR" },
  { name: "Croatia", code: "HR" },
  { name: "Cuba", code: "CU" },
  { name: "Cyprus", code: "CY" },
  { name: "Czech Republic", code: "CZ" },

  // D
  { name: "Democratic Republic of the Congo", code: "CD" },
  { name: "Denmark", code: "DK" },
  { name: "Djibouti", code: "DJ" },
  { name: "Dominica", code: "DM" },
  { name: "Dominican Republic", code: "DO" },

  // E
  { name: "Ecuador", code: "EC" },
  { name: "Egypt", code: "EG" },
  { name: "El Salvador", code: "SV" },
  { name: "Equatorial Guinea", code: "GQ" },
  { name: "Eritrea", code: "ER" },
  { name: "Estonia", code: "EE" },
  { name: "Eswatini", code: "SZ" },
  { name: "Ethiopia", code: "ET" },

  // F
  { name: "Fiji", code: "FJ" },
  { name: "Finland", code: "FI" },
  { name: "France", code: "FR" },

  // G
  { name: "Gabon", code: "GA" },
  { name: "Gambia", code: "GM" },
  { name: "Georgia", code: "GE" },
  { name: "Germany", code: "DE" },
  { name: "Ghana", code: "GH" },
  { name: "Gibraltar", code: "GI" },
  { name: "Greece", code: "GR" },
  { name: "Grenada", code: "GD" },
  { name: "Guatemala", code: "GT" },
  { name: "Guinea", code: "GN" },
  { name: "Guinea-Bissau", code: "GW" },
  { name: "Guyana", code: "GY" },

  // H
  { name: "Haiti", code: "HT" },
  { name: "Honduras", code: "HN" },
  { name: "Hong Kong", code: "HK" },
  { name: "Hungary", code: "HU" },

  // I
  { name: "Iceland", code: "IS" },
  { name: "India", code: "IN" },
  { name: "Indonesia", code: "ID" },
  { name: "Iran", code: "IR" },
  { name: "Iraq", code: "IQ" },
  { name: "Ireland", code: "IE" },
  { name: "Israel", code: "IL" },
  { name: "Italy", code: "IT" },

  // J
  { name: "Jamaica", code: "JM" },
  { name: "Japan", code: "JP" },
  { name: "Jordan", code: "JO" },

  // K
  { name: "Kazakhstan", code: "KZ" },
  { name: "Kenya", code: "KE" },
  { name: "Kuwait", code: "KW" },
  { name: "Kyrgyzstan", code: "KG" },

  // L
  { name: "Laos", code: "LA" },
  { name: "Latvia", code: "LV" },
  { name: "Lebanon", code: "LB" },
  { name: "Lesotho", code: "LS" },
  { name: "Liberia", code: "LR" },
  { name: "Libya", code: "LY" },
  { name: "Liechtenstein", code: "LI" },
  { name: "Lithuania", code: "LT" },
  { name: "Luxembourg", code: "LU" },

  // M
  { name: "Madagascar", code: "MG" },
  { name: "Malawi", code: "MW" },
  { name: "Malaysia", code: "MY" },
  { name: "Maldives", code: "MV" },
  { name: "Mali", code: "ML" },
  { name: "Malta", code: "MT" },
  { name: "Martinique", code: "MQ" },
  { name: "Mauritania", code: "MR" },
  { name: "Mauritius", code: "MU" },
  { name: "Mexico", code: "MX" },
  { name: "Moldova", code: "MD" },
  { name: "Monaco", code: "MC" },
  { name: "Mongolia", code: "MN" },
  { name: "Montenegro", code: "ME" },
  { name: "Morocco", code: "MA" },
  { name: "Mozambique", code: "MZ" },
  { name: "Myanmar", code: "MM" },

  // N
  { name: "Namibia", code: "NA" },
  { name: "Nepal", code: "NP" },
  { name: "Netherlands", code: "NL" },
  { name: "New Zealand", code: "NZ" },
  { name: "Nicaragua", code: "NI" },
  { name: "Niger", code: "NE" },
  { name: "Nigeria", code: "NG" },
  { name: "North Macedonia", code: "MK" },
  { name: "Norway", code: "NO" },

  // O
  { name: "Oman", code: "OM" },

  // P
  { name: "Pakistan", code: "PK" },
  { name: "Palau", code: "PW" },
  { name: "Palestine State", code: "PS" },
  { name: "Panama", code: "PA" },
  { name: "Papua New Guinea", code: "PG" },
  { name: "Paraguay", code: "PY" },
  { name: "Peru", code: "PE" },
  { name: "Philippines", code: "PH" },
  { name: "Poland", code: "PL" },
  { name: "Portugal", code: "PT" },

  // Q
  { name: "Qatar", code: "QA" },

  // R
  { name: "Romania", code: "RO" },
  { name: "Russia", code: "RU" },
  { name: "Rwanda", code: "RW" },

  // S
  { name: "Saint Kitts and Nevis", code: "KN" },
  { name: "Saint Lucia", code: "LC" },
  { name: "Saint Vincent and the Grenadines", code: "VC" },
  { name: "Samoa", code: "WS" },
  { name: "San Marino", code: "SM" },
  { name: "Saudi Arabia", code: "SA" },
  { name: "Senegal", code: "SN" },
  { name: "Serbia", code: "RS" },
  { name: "Seychelles", code: "SC" },
  { name: "Sierra Leone", code: "SL" },
  { name: "Singapore", code: "SG" },
  { name: "Slovakia", code: "SK" },
  { name: "Slovenia", code: "SI" },
  { name: "Somalia", code: "SO" },
  { name: "South Africa", code: "ZA" },
  { name: "South Korea", code: "KR" },
  { name: "Spain", code: "ES" },
  { name: "Sri Lanka", code: "LK" },
  { name: "Sudan", code: "SD" },
  { name: "Suriname", code: "SR" },
  { name: "Sweden", code: "SE" },
  { name: "Switzerland", code: "CH" },

  // T
  { name: "Taiwan", code: "TW" },
  { name: "Tajikistan", code: "TJ" },
  { name: "Tanzania", code: "TZ" },
  { name: "Thailand", code: "TH" },
  { name: "Timor-Leste", code: "TL" },
  { name: "Togo", code: "TG" },
  { name: "Tonga", code: "TO" },
  { name: "Trinidad and Tobago", code: "TT" },
  { name: "Tunisia", code: "TN" },
  { name: "Turkey", code: "TR" },
  { name: "Turkmenistan", code: "TM" },
  { name: "Tuvalu", code: "TV" },

  // U
  { name: "Uganda", code: "UG" },
  { name: "United Arab Emirates", code: "AE" },

  { name: "Ukraine", code: "UA" },
  { name: "United Kingdom", code: "GB" },
  { name: "United States of America", code: "US" },
  { name: "Uruguay", code: "UY" },
  { name: "Uzbekistan", code: "UZ" },

  // V–Z
  { name: "Vanuatu", code: "VU" },
  { name: "Venezuela", code: "VE" },
  { name: "Vietnam", code: "VN" },
  { name: "Zambia", code: "ZM" },
  { name: "Zimbabwe", code: "ZW" },
];

/* --- phone-specific subset (dial codes) ------------------------ */

export const COUNTRY_DIAL_CODES: Record<string, string> = {
  AL: "+355",
  DZ: "+213",
  AD: "+376",
  AO: "+244",
  AG: "+1-268",
  AR: "+54",
  AM: "+374",
  AU: "+61",
  AT: "+43",
  AZ: "+994",

  BS: "+1-242",
  BH: "+973",
  BD: "+880",
  BB: "+1-246",
  BY: "+375",
  BE: "+32",
  BZ: "+501",
  BJ: "+229",
  BT: "+975",
  BO: "+591",
  BA: "+387",
  BW: "+267",
  BR: "+55",
  BN: "+673",
  BG: "+359",
  BF: "+226",
  BI: "+257",

  CV: "+238",
  KH: "+855",
  CM: "+237",
  CA: "+1",
  CF: "+236",
  TD: "+235",
  CL: "+56",
  CN: "+86",
  CO: "+57",
  CI: "+225",
  KM: "+269",
  CR: "+506",
  HR: "+385",
  CU: "+53",
  CY: "+357",
  CZ: "+420",

  CD: "+243",
  DK: "+45",
  DJ: "+253",
  DM: "+1-767",
  DO: "+1-809", // also 829, 849

  EC: "+593",
  EG: "+20",
  SV: "+503",
  GQ: "+240",
  ER: "+291",
  EE: "+372",
  SZ: "+268",
  ET: "+251",

  FJ: "+679",
  FI: "+358",
  FR: "+33",

  GA: "+241",
  GM: "+220",
  GE: "+995",
  DE: "+49",
  GH: "+233",
  GI: "+350",
  GR: "+30",
  GD: "+1-473",
  GT: "+502",
  GN: "+224",
  GW: "+245",
  GY: "+592",

  HT: "+509",
  HN: "+504",
  HK: "+852",
  HU: "+36",

  IS: "+354",
  IN: "+91",
  ID: "+62",
  IR: "+98",
  IQ: "+964",
  IE: "+353",
  IL: "+972",
  IT: "+39",

  JM: "+1-876",
  JP: "+81",
  JO: "+962",

  KZ: "+7",
  KE: "+254",
  KW: "+965",
  KG: "+996",

  LA: "+856",
  LV: "+371",
  LB: "+961",
  LS: "+266",
  LR: "+231",
  LY: "+218",
  LI: "+423",
  LT: "+370",
  LU: "+352",

  MG: "+261",
  MW: "+265",
  MY: "+60",
  MV: "+960",
  ML: "+223",
  MT: "+356",
  MQ: "+596",
  MR: "+222",
  MU: "+230",
  MX: "+52",
  MD: "+373",
  MC: "+377",
  MN: "+976",
  ME: "+382",
  MA: "+212",
  MZ: "+258",
  MM: "+95",

  NA: "+264",
  NP: "+977",
  NL: "+31",
  NZ: "+64",
  NI: "+505",
  NE: "+227",
  NG: "+234",
  MK: "+389",
  NO: "+47",

  OM: "+968",

  PK: "+92",
  PW: "+680",
  PS: "+970",
  PA: "+507",
  PG: "+675",
  PY: "+595",
  PE: "+51",
  PH: "+63",
  PL: "+48",
  PT: "+351",

  QA: "+974",

  RO: "+40",
  RU: "+7",
  RW: "+250",

  KN: "+1-869",
  LC: "+1-758",
  VC: "+1-784",
  WS: "+685",
  SM: "+378",
  SA: "+966",
  SN: "+221",
  RS: "+381",
  SC: "+248",
  SL: "+232",
  SG: "+65",
  SK: "+421",
  SI: "+386",
  SO: "+252",
  ZA: "+27",
  KR: "+82",
  ES: "+34",
  LK: "+94",
  SD: "+249",
  SR: "+597",
  SE: "+46",
  CH: "+41",

  TW: "+886",
  TJ: "+992",
  TZ: "+255",
  TH: "+66",
  TL: "+670",
  TG: "+228",
  TO: "+676",
  TT: "+1-868",
  TN: "+216",
  TR: "+90",
  TM: "+993",
  TV: "+688",

  UG: "+256",
  UA: "+380",
  GB: "+44",
  US: "+1",
  UY: "+598",
  UZ: "+998",

  VU: "+678",
  VE: "+58",
  VN: "+84",
  ZM: "+260",
  ZW: "+263",
};

// 2) build PHONE_COUNTRIES from COUNTRIES
type PhoneCountry = { name: string; dialCode: string; iso: string };

export const PHONE_COUNTRIES: PhoneCountry[] = COUNTRIES.map((c) => ({
  name: c.name,
  iso: c.code,
  dialCode: COUNTRY_DIAL_CODES[c.code] ?? "",
}));

/* ------------------------------------------------------------------ */
/*  MAIN COMPONENT                                                     */
/* ------------------------------------------------------------------ */

export function StepDocsAndApplicants({
  applicants,
  applicantErrors,
  pricePerApplicant,
  policy1,
  policy2,
  onChangeApplicant,
  onAddApplicant,
  onRemoveApplicant,
  onChangePolicy1,
  onChangePolicy2,
  extraFastSelected,
  onToggleExtraFast,
  docs,
  onDocsChange,
}: StepDocsAndApplicantsProps) {
  const handleFilesChange = (
    applicantIndex: number,
    kind: DocKind,
    fileList: FileList | null,
  ) => {
    if (!fileList || fileList.length === 0) return;
    const newFiles = Array.from(fileList);

    onDocsChange((prev) => {
      const clone = [...prev];
      const current = clone[applicantIndex] ?? emptyDocs();
      clone[applicantIndex] = {
        ...current,
        [kind]: [...current[kind], ...newFiles],
      };
      return clone;
    });
  };

  const handleRemoveFile = (
    applicantIndex: number,
    kind: DocKind,
    fileIndex: number,
  ) => {
    onDocsChange((prev) => {
      const clone = [...prev];
      const current = clone[applicantIndex] ?? emptyDocs();
      const updated = [...current[kind]];
      updated.splice(fileIndex, 1);
      clone[applicantIndex] = {
        ...current,
        [kind]: updated,
      };
      return clone;
    });
  };

  const DOC_DEFS: {
    label: string;
    kind: DocKind;
    helper: string;
    required?: boolean;
  }[] = [
    {
      label: "Passport",
      kind: "passport",
      helper: "Main passport page (PDF / image)",
      required: true,
    },
    {
      label: "Photograph",
      kind: "photo",
      helper: "Recent photo with white background",
      required: true,
    },
    {
      label: "Return Ticket",
      kind: "ticket",
      helper: "Return / onward ticket confirmation",
      required: false, // ✅ optional
    },
  ];

  const isImageFile = (file: File) => file.type.startsWith("image/");
  const formatSize = (file: File) => {
    const kb = file.size / 1024;
    if (kb < 1024) return `${kb.toFixed(0)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const handlePreviewFile = (file: File) => {
    const url = URL.createObjectURL(file);
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-[#3C4161] md:text-base">
          Upload documents &amp; add applicant details
        </h2>
        <p className="mt-1 text-xs text-slate-500 md:text-sm">
          For each traveller, upload the required documents and fill in their
          details exactly as they appear on the passport. You can add multiple
          applicants below.
        </p>
      </div>

      {applicants.map((applicant, index) => {
        const applicantDocs = docs[index] || emptyDocs();
        const err = applicantErrors?.[index] || {}; // ✅ ADD THIS

        return (
          <div
            key={applicant.id}
            className="space-y-5 rounded-2xl border border-slate-100 bg-white p-4 md:p-5 shadow-[0_8px_24px_rgba(15,23,42,0.03)]"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Applicant {index + 1}
              </p>
              {applicants.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveApplicant(index)}
                  className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-[11px] font-medium text-rose-600 hover:bg-rose-100 focus:outline-none focus-visible:outline-none"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Remove Applicant</span>
                </button>
              )}
            </div>

            {/* Upload docs for this applicant */}
            <div className="space-y-4">
              <p className="text-[11px] font-semibold text-slate-700">
                Upload required documents for this applicant
              </p>
              <div className="grid gap-4 md:grid-cols-3 lg:gap-5">
                {DOC_DEFS.map(({ label, kind, helper, required }) => {
                  const selectedFiles = applicantDocs[kind] || [];

                  return (
                    <div key={label} className="space-y-1">
                      <label className="text-xs font-medium text-slate-600">
                        {label}
                        {required ? (
                          <span className="ml-1 text-rose-500">*</span>
                        ) : null}
                      </label>

                      {/* label wraps input + card so clicking card opens file picker */}
                      <label className="block">
                        <input
                          type="file"
                          className="hidden"
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) =>
                            handleFilesChange(
                              index,
                              kind,
                              e.target.files || null,
                            )
                          }
                        />
                        <div className="flex h-24 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-gradient-to-b from-slate-50 to-slate-100 text-center text-xs text-slate-500 shadow-[0_1px_0_rgba(15,23,42,0.03)] transition hover:border-[#3C4161] hover:bg-white hover:shadow-md">
                          <Upload className="mb-1 h-5 w-5" />
                          <span className="font-medium">
                            Drag or click to add file(s)
                          </span>
                          <span className="mt-1 text-[10px] text-slate-400">
                            PDF, JPG or PNG · max 4 MB each
                          </span>
                          <span className="mt-0.5 text-[10px] text-slate-400">
                            {helper}
                          </span>
                        </div>
                      </label>

                      {/* Selected files preview */}
                      {selectedFiles.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {selectedFiles.map((file, fileIndex) => (
                            <div
                              key={`${file.name}-${fileIndex}`}
                              className="group flex shrink-0 items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-[10px] text-slate-600 ring-1 ring-slate-200"
                            >
                              {isImageFile(file) ? (
                                <ImageIcon className="h-3.5 w-3.5 text-slate-400" />
                              ) : (
                                <FileText className="h-3.5 w-3.5 text-slate-400" />
                              )}

                              <div className="flex min-w-0 flex-col">
                                <span className="max-w-[110px] truncate font-medium">
                                  {file.name}
                                </span>
                                <span className="text-[9px] text-slate-400">
                                  {formatSize(file)}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => handlePreviewFile(file)}
                                className="text-[9px] font-semibold text-[#3C4161] underline-offset-2 hover:underline focus:outline-none focus-visible:outline-none"
                              >
                                View
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveFile(index, kind, fileIndex)
                                }
                                className="ml-0.5 rounded-full p-0.5 text-slate-300 transition hover:bg-rose-50 hover:text-rose-500 focus:outline-none focus-visible:outline-none"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Phone + Email row */}
            <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)]">
              <PhoneField
                label="Phone (WhatsApp preferred)"
                countryCode={applicant.countryCode || "+971"}
                phone={applicant.phone}
                error={!!err.phone}
                helperText={err.phone}
                onChangeCountryCode={(code) =>
                  onChangeApplicant(index, "countryCode", code)
                }
                onChangePhone={(value) =>
                  onChangeApplicant(index, "phone", value)
                }
              />

              <TextField
                label="Email"
                placeholder="Email Address"
                required
                value={applicant.email}
                error={!!err.email}
                helperText={err.email}
                onChange={(v) => onChangeApplicant(index, "email", v)}
              />
            </div>

            {/* Name row */}
            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                label="First Name"
                placeholder="First Name"
                required
                value={applicant.firstName}
                onChange={(v) => onChangeApplicant(index, "firstName", v)}
              />
              <TextField
                label="Last Name"
                placeholder="Last Name"
                required
                value={applicant.lastName}
                onChange={(v) => onChangeApplicant(index, "lastName", v)}
              />
            </div>

            {/* Nationality / Applying From */}
            <div className="grid gap-4 md:grid-cols-2">
              <CountrySelectField
                label="Nationality"
                value={applicant.nationality}
                onChange={(v) => onChangeApplicant(index, "nationality", v)}
              />
              <CountrySelectField
                label="Applying From"
                value={applicant.applyingFrom}
                onChange={(v) => onChangeApplicant(index, "applyingFrom", v)}
              />
            </div>

            {/* Passport / Profession */}
            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                label="Passport No"
                placeholder="Format ***-**-****"
                required
                value={applicant.passportNumber}
                onChange={(v) => onChangeApplicant(index, "passportNumber", v)}
              />
              <TextField
                label="Profession"
                placeholder="Profession"
                required
                value={applicant.profession}
                onChange={(v) => onChangeApplicant(index, "profession", v)}
              />
            </div>

            {/* Purpose of travel / tentative date */}
            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                label="Purpose Of Travel"
                placeholder="Tourism, business, family visit, etc."
                required
                value={applicant.purposeOfTravel}
                onChange={(v) => onChangeApplicant(index, "purposeOfTravel", v)}
              />
              <DateField
                label="Tentative Travel Date"
                required
                value={applicant.tentativeTravelDate}
                onChange={(v) =>
                  onChangeApplicant(index, "tentativeTravelDate", v)
                }
              />
            </div>

            {/* Price per applicant */}
            <div className="mt-2 border-t border-dashed border-slate-200 pt-3 text-xs text-slate-600">
              <span className="font-medium text-slate-700">Price</span>
              <p className="mt-1 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-[#3C4161] shadow-[0_1px_0_rgba(15,23,42,0.03)]">
                {pricePerApplicant} $
              </p>
            </div>
          </div>
        );
      })}

      {/* Add applicant button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onAddApplicant}
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 focus:outline-none focus-visible:outline-none"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Applicant</span>
        </button>
        {applicants.length > 1 && (
          <p className="text-[11px] text-slate-500">
            You can add separate details and documents for each traveller.
          </p>
        )}
      </div>

      {/* Extra fast processing option */}
      <div
        className="mt-6 rounded-2xl px-5 py-4 text-xs shadow-[0_18px_40px_rgba(15,23,42,0.45)] border border-slate-900"
        style={{
          background: extraFastSelected
            ? "linear-gradient(90deg,#252b5a 0%,#303872 50%,#252b5a 100%)"
            : "linear-gradient(90deg,#222749 0%,#1b2144 50%,#151938 100%)",
          color: "#F9FAFB",
        }}
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          {/* LEFT: title + text */}
          <div className="space-y-1 max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-100">
              Extra fast processing
            </p>
            <p className="text-[13px] text-slate-50">
              Get your visa reviewed with{" "}
              <span className="font-semibold">priority</span>.
            </p>
            <p className="text-[11px] leading-snug text-slate-200">
              Optional add-on. We’ll try to process your application faster, but
              final decision time still depends on UAE authorities.
            </p>
          </div>

          {/* RIGHT: price + toggle + chip */}
          <div className="flex flex-col items-end gap-2 md:min-w-[210px]">
            {/* price + toggle */}
            <div className="flex items-center gap-4">
              <div className="text-right leading-tight">
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-200">
                  Extra fee
                </p>
                <p
                  className={`text-base font-semibold ${
                    extraFastSelected ? "text-[#62E9C9]" : "text-slate-50"
                  }`}
                >
                  + 100 $
                </p>
              </div>

              {/* TOGGLE */}
              <button
                type="button"
                onClick={() => onToggleExtraFast(!extraFastSelected)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                  extraFastSelected ? "bg-[#62E9C9]" : "bg-slate-600/90"
                }`}
              >
                <span
                  className="inline-block h-5 w-5 rounded-full bg-white shadow-md"
                  style={{
                    transform: extraFastSelected
                      ? "translateX(23px)" // ON → right
                      : "translateX(3px)", // OFF → left
                    transition: "transform 150ms ease-out",
                  }}
                />
              </button>
            </div>

            {/* status chip */}
            <span
              className={`inline-flex items-center justify-center rounded-full px-3 py-0.5 text-[10px] uppercase tracking-[0.14em] border transition-colors ${
                extraFastSelected
                  ? "bg-[#62E9C9] text-[#0c4d3d] border-[#52cfb4]"
                  : "bg-slate-900/70 text-slate-200 border-slate-500/80"
              }`}
            >
              {extraFastSelected ? "Extra fast added" : "Extra fast optional"}
            </span>
          </div>
        </div>
      </div>

      {/* Policy checkboxes */}
      <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-xs text-slate-600">
        <p className="text-[11px] font-semibold text-slate-700">
          Please confirm that you have read and agreed to the following:
        </p>

        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={policy1}
            onChange={(e) => onChangePolicy1(e.target.checked)}
            className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-[#62E9C9] focus:ring-[#62E9C9] focus:outline-none focus-visible:outline-none"
          />
          <span className="space-y-0.5">
            <span className="block font-semibold text-[11px]">
              I agree to the policy.
            </span>
            <span className="block text-[11px]">
              The decision to grant or refuse the visa(s) is the sole
              prerogative and at the sole discretion of Government of UAE.
            </span>
          </span>
        </label>

        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={policy2}
            onChange={(e) => onChangePolicy2(e.target.checked)}
            className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-[#62E9C9] focus:ring-[#62E9C9] focus:outline-none focus-visible:outline-none"
          />
          <span className="space-y-0.5">
            <span className="block font-semibold text-[11px]">
              I agree to the policy.
            </span>
            <span className="block text-[11px]">
              I hereby confirm that no active visa application is currently
              under processing by another agent. This could lead to a
              non-refundable rejection of my visa application.
            </span>
          </span>
        </label>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  FIELDS                                                             */
/* ------------------------------------------------------------------ */

type TextFieldProps = {
  label: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
  value?: string;
  onChange?: (value: string) => void;

  // ✅ add these
  error?: boolean;
  helperText?: string;
};

function TextField({
  label,
  placeholder,
  required,
  type = "text",
  value,
  onChange,
  error,
  helperText,
}: TextFieldProps) {
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
        className={[
          "w-full rounded-xl border bg-white px-3 py-2.5 text-xs text-slate-700 placeholder:text-slate-400 shadow-[0_1px_0_rgba(15,23,42,0.03)] outline-none transition focus:ring-0 focus:outline-none focus-visible:outline-none",
          error
            ? "border-rose-300 focus:border-rose-400"
            : "border-slate-200 focus:border-[#3C4161]",
        ].join(" ")}
      />

      {helperText ? (
        <p className="text-[11px] text-rose-600">{helperText}</p>
      ) : null}
    </div>
  );
}

/* ------------------- Phone field: flag + code + search ------------- */

type PhoneFieldProps = {
  label: string;
  countryCode: string;
  phone: string;
  onChangeCountryCode: (code: string) => void;
  onChangePhone: (value: string) => void;
  error?: boolean;
  helperText?: string;
};

function PhoneField({
  label,
  countryCode,
  phone,
  onChangeCountryCode,
  onChangePhone,
  error,
  helperText,
}: PhoneFieldProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected =
    PHONE_COUNTRIES.find((c) => c.dialCode === countryCode) ||
    PHONE_COUNTRIES[0];

  const filtered = PHONE_COUNTRIES.filter((c) => {
    const q = query.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.dialCode.includes(q) ||
      c.iso.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-600">
        {label} <span className="text-rose-500">*</span>
      </label>

      {/* relative wrapper for both field + dropdown */}
      <div className="relative">
        {/* button + input in a row */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2 rounded-l-xl border border-r-0 border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-700 shadow-[0_1px_0_rgba(15,23,42,0.03)] outline-none hover:bg-slate-50"
          >
            <span className="inline-grid h-5 w-7 place-items-center overflow-hidden rounded-[4px] bg-white ring-1 ring-slate-200">
              <ReactCountryFlag
                svg
                countryCode={selected.iso}
                aria-label={selected.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </span>

            <span className="hidden text-[11px] text-slate-500 sm:inline">
              {selected.iso}
            </span>

            <span className="font-semibold text-slate-800">
              {selected.dialCode}
            </span>

            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => {
              // ✅ allow digits + common separators only
              const next = e.target.value.replace(/[^\d\s()+-]/g, "");
              onChangePhone(next);
            }}
            className={[
              "w-full rounded-r-xl border border-l bg-white px-3 py-2.5 text-xs text-slate-700 placeholder:text-slate-400 shadow-[0_1px_0_rgba(15,23,42,0.03)] outline-none transition focus:ring-0",
              error
                ? "border-rose-300 focus:border-rose-400"
                : "border-slate-200 focus:border-[#3C4161]",
            ].join(" ")}
          />
        </div>

        {open && (
          <div className="absolute left-0 top-[110%] z-30 w-80 rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="border-b border-slate-100 px-3 py-2">
              <input
                type="text"
                placeholder="Search country or code"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 outline-none focus:border-[#3C4161] focus:ring-0"
              />
            </div>

            <ul className="max-h-64 overflow-y-auto py-1 text-xs">
              {filtered.map((c) => (
                <li key={c.iso}>
                  <button
                    type="button"
                    onClick={() => {
                      onChangeCountryCode(c.dialCode);
                      setOpen(false);
                      setQuery("");
                    }}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:outline-none"
                  >
                    <span className="inline-grid h-5 w-7 place-items-center overflow-hidden rounded-[4px] bg-white ring-1 ring-slate-200">
                      <ReactCountryFlag
                        svg
                        countryCode={c.iso}
                        aria-label={c.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </span>

                    <span className="flex-1 truncate">{c.name}</span>
                    <span className="text-[10px] text-slate-400">
                      {c.dialCode}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {helperText ? (
          <p className="mt-1 text-[11px] text-rose-600">{helperText}</p>
        ) : null}
      </div>
    </div>
  );
}

/* -------------------- Country selector (flags) --------------------- */

type CountrySelectFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function CountrySelectField({
  label,
  value,
  onChange,
}: CountrySelectFieldProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  // store the country object itself so we can pass code -> ReactCountryFlag
  const selectedCountry = COUNTRIES.find((c) => c.name === value) || null;

  const filtered = COUNTRIES.filter((c) => {
    const q = query.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
  });

  return (
    <div className="relative space-y-1">
      <label className="text-xs font-medium text-slate-600">
        {label} <span className="text-rose-500">*</span>
      </label>

      {/* trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-700 shadow-[0_1px_0_rgba(15,23,42,0.03)] outline-none transition hover:bg-slate-50 focus:border-[#3C4161] focus:ring-0 focus:outline-none focus-visible:outline-none"
      >
        <span className="flex min-w-0 items-center gap-2">
          {selectedCountry ? (
            <>
              {/* FLAG (same style as Hero, just smaller) */}
              <span className="inline-grid h-4 w-6 place-items-center overflow-hidden rounded-[3px] bg-white ring-1 ring-slate-200">
                <ReactCountryFlag
                  svg
                  countryCode={selectedCountry.code}
                  aria-label={selectedCountry.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </span>
              <span className="truncate">{selectedCountry.name}</span>
            </>
          ) : (
            <span className="text-slate-400 truncate">Select country</span>
          )}
        </span>

        <ChevronDown className="h-3.5 w-3.5 flex-none text-slate-400" />
      </button>

      {/* dropdown */}
      {open && (
        <div className="absolute z-30 mt-1 w-full rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 px-3 py-2">
            <input
              type="text"
              placeholder="Search country"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 outline-none focus:border-[#3C4161] focus:ring-0 focus:outline-none focus-visible:outline-none"
            />
          </div>

          <ul className="max-h-64 overflow-y-auto py-1 text-xs">
            {filtered.map((c) => (
              <li key={c.code}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(c.name); // still storing the name in form state
                    setOpen(false);
                    setQuery("");
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:outline-none"
                >
                  {/* FLAG in list item */}
                  <span className="inline-grid h-4 w-6 place-items-center overflow-hidden rounded-[3px] bg-white ring-1 ring-slate-200">
                    <ReactCountryFlag
                      svg
                      countryCode={c.code}
                      aria-label={c.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </span>

                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="text-[10px] text-slate-400 uppercase">
                    {c.code}
                  </span>
                </button>
              </li>
            ))}

            {filtered.length === 0 && (
              <li className="px-3 py-2 text-[11px] text-slate-400">
                No matches found
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
