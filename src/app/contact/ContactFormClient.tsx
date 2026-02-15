"use client";

import React, { useState, useRef } from "react";
import ReactCountryFlag from "react-country-flag";
import ReCAPTCHA from "react-google-recaptcha";
import { ChevronDown } from "lucide-react";

import { COUNTRIES } from "@/data/countries";
import { PHONE_COUNTRIES } from "../apply/components/StepDocsAndApplicants";
import { toast } from "sonner";

type TripPurpose = "tourism" | "business" | "family" | "transit" | "other";

export default function ContactFormClient() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [phoneCountryCode, setPhoneCountryCode] = useState("+971");
  const [phone, setPhone] = useState("");

  const [email, setEmail] = useState("");
  const [nationality, setNationality] = useState("");
  const [tripPurpose, setTripPurpose] = useState<TripPurpose>("tourism");
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState<string | null>(null);

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";
  const recaptchaRef = useRef<ReCAPTCHA | null>(null);

  const isFormValid =
    !!firstName.trim() &&
    !!lastName.trim() &&
    !!phone.trim() &&
    !!email.trim() &&
    !!captchaToken;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ require captcha
    if (!captchaToken) {
      setCaptchaError("Please verify that you’re not a robot.");
      toast.error("Please verify the reCAPTCHA first.");
      return;
    }
    setCaptchaError(null);

    // optional: basic client validation for premium UX
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !phone.trim()
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const fullPhone = `${phoneCountryCode} ${phone}`.trim();

    const t = toast.loading("Sending your message…");

    try {
      setSubmitting(true);

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: fullPhone,
          phoneCountryCode,
          email: email.trim(),
          nationality,
          tripPurpose,
          message: message.trim(),
          captchaToken,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        // server may return { error, codes }
        const msg =
          data?.error ||
          (Array.isArray(data?.codes) && data.codes.length
            ? `reCAPTCHA failed (${data.codes.join(", ")})`
            : "Failed to send message.");
        throw new Error(msg);
      }

      toast.success("Message sent! We’ll get back to you shortly.", { id: t });

      // ✅ reset form
      setFirstName("");
      setLastName("");
      setPhoneCountryCode("+971");
      setPhone("");
      setEmail("");
      setNationality("");
      setTripPurpose("tourism");
      setMessage("");

      // ✅ reset captcha widget + token
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.message || "Something went wrong while sending your message.",
        { id: t },
      );

      // ✅ force user to re-verify captcha (good security + avoids stuck token)
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Row 1 – names */}
      <div className="grid gap-4 md:grid-cols-2">
        <TextField
          label="First Name"
          value={firstName}
          onChange={setFirstName}
          required
        />
        <TextField
          label="Last Name"
          value={lastName}
          onChange={setLastName}
          required
        />
      </div>

      {/* Row 2 – phone (with dial picker) + email */}
      <div className="grid gap-4 md:grid-cols-2">
        <PhoneField
          label="Phone Number"
          countryCode={phoneCountryCode}
          phone={phone}
          onChangeCountryCode={setPhoneCountryCode}
          onChangePhone={setPhone}
        />
        <TextField
          label="Email Address"
          type="email"
          value={email}
          onChange={setEmail}
          required
        />
      </div>

      {/* Row 3 – nationality (Apply-style dropdown) + purpose pills */}
      <div className="grid gap-4 md:grid-cols-2 items-start">
        <CountrySelectField
          label="Your Nationality"
          value={nationality}
          onChange={setNationality}
        />
        <TripPurposeField value={tripPurpose} onChange={setTripPurpose} />
      </div>

      {/* Message */}
      <div>
        <label className="block text-xs font-semibold text-[#3C4161]/80">
          Tell us briefly about your travel dates & travellers
        </label>
        <textarea
          className="mt-1 w-full rounded-2xl border border-[#E2E4F0] bg-white/80 px-4 py-3 text-sm text-[#111827] shadow-sm outline-none transition focus:border-[#3C4161] focus:bg-white"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      {/* reCAPTCHA */}
      <div className="mt-6 space-y-2">
        {siteKey ? (
          <div className="inline-block">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={siteKey}
              onChange={(token) => {
                setCaptchaToken(token);
                setCaptchaError(null);
              }}
              onExpired={() => setCaptchaToken(null)}
            />
          </div>
        ) : (
          // <div className="inline-flex max-w-md items-center rounded-2xl border border-dashed border-[#E2E4F0] bg-white/70 px-4 py-2 text-[11px] text-[#6b7280]">
          //   <span className="font-semibold mr-1">Security check</span>
          //   <span>will appear here (reCAPTCHA).</span>
          // </div>
          <></>
        )}

        {captchaError && <p className="text-xs text-red-500">{captchaError}</p>}
      </div>

      {/* Error / success */}
      {error && (
        <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
          {error}
        </p>
      )}
      {success && (
        <p className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
          {success}
        </p>
      )}

      {/* Button + note */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={submitting || !isFormValid}
          className="inline-flex items-center justify-center rounded-full bg-[#62E9C9] px-8 py-3 text-sm font-semibold text-[#0c4d3d] shadow-[0_14px_30px_rgba(98,233,201,0.35)] transition hover:-translate-y-0.5 hover:opacity-90 active:translate-y-0 disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {submitting ? "Sending…" : "Send message"}
        </button>

        <p className="text-[11px] text-[#3C4161]/60 max-w-sm">
          By submitting, you agree to be contacted on WhatsApp, phone or email
          regarding your UAE permit inquiry.
        </p>
      </div>
    </form>
  );
}

/* -------------------------------------------------- */
/* Small reusable fields                             */
/* -------------------------------------------------- */

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
};

function TextField({
  label,
  value,
  onChange,
  type = "text",
  required,
}: TextFieldProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <input
        type={type}
        required={required}
        className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-700 shadow-[0_1px_0_rgba(15,23,42,0.03)] outline-none transition focus:border-[#3C4161]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

/* -------------------------------------------------- */
/* Apply-style CountrySelectField for Nationality     */
/* -------------------------------------------------- */

type CountrySelectFieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
};

function CountrySelectField({
  label,
  value,
  onChange,
}: CountrySelectFieldProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedCountry = COUNTRIES.find((c) => c.name === value) || null;

  const filtered = COUNTRIES.filter((c) => {
    const q = query.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
  });

  return (
    <div className="relative space-y-1">
      <label className="text-xs font-medium text-slate-600">{label}</label>

      {/* trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-700 shadow-[0_1px_0_rgba(15,23,42,0.03)] outline-none transition hover:bg-slate-50 focus:border-[#3C4161]"
      >
        <span className="flex min-w-0 items-center gap-2">
          {selectedCountry ? (
            <>
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
            <span className="text-slate-400 truncate">Select nationality</span>
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
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 outline-none focus:border-[#3C4161]"
            />
          </div>

          <ul className="max-h-64 overflow-y-auto py-1 text-xs">
            {filtered.map((c) => (
              <li key={c.code}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(c.name);
                    setOpen(false);
                    setQuery("");
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-slate-700 hover:bg-slate-50"
                >
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

/* -------------------------------------------------- */
/* Apply-style PhoneField (dial code + flag + search) */
/* -------------------------------------------------- */

type PhoneFieldProps = {
  label: string;
  countryCode: string;
  phone: string;
  onChangeCountryCode: (code: string) => void;
  onChangePhone: (value: string) => void;
};

function PhoneField({
  label,
  countryCode,
  phone,
  onChangeCountryCode,
  onChangePhone,
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
            placeholder="Your phone number"
            value={phone}
            onChange={(e) => onChangePhone(e.target.value)}
            className="w-full rounded-r-xl border border-l border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-700 placeholder:text-slate-400 shadow-[0_1px_0_rgba(15,23,42,0.03)] outline-none transition focus:border-[#3C4161]"
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
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 outline-none focus:border-[#3C4161]"
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
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-slate-700 hover:bg-slate-50"
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
      </div>
    </div>
  );
}

/* -------------------------------------------------- */
/* Trip purpose pills                                  */
/* -------------------------------------------------- */

type TripPurposeFieldProps = {
  value: TripPurpose;
  onChange: (value: TripPurpose) => void;
};

function TripPurposeField({ value, onChange }: TripPurposeFieldProps) {
  const options: { value: TripPurpose; label: string }[] = [
    { value: "tourism", label: "Tourism" },
    { value: "business", label: "Business" },
    { value: "family", label: "Family Visit" },
    { value: "transit", label: "Transit" },
    { value: "other", label: "Other" },
  ];

  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">
        Trip Purpose
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition
              ${
                active
                  ? "border-[#62E9C9] bg-[#62E9C9] text-[#0c4d3d] shadow-sm"
                  : "border-[#E2E4F0] bg-white text-[#3C4161]/80 hover:border-[#cbd1ff]"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
