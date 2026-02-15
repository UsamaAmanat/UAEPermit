// src/components/country/VisaTypeSection.tsx
"use client";

import { useMemo, useState } from "react";
import type { VisaConfig } from "@/types/country";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  ExternalLink,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

interface VisaTypeSectionProps {
  countryName: string;
  config: VisaConfig;
  slug: string; // 👈 new
  content?: CountryContent;
}

type CountryContent = {
  heading?: string;
  summary?: string;
  html?: string;
};

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/**
 * If editor output is plain text (no tags), convert to semantic HTML.
 * Supports:
 * - empty line => paragraph break
 * - "- item" or "• item" => UL
 * - "1. item" => OL
 * - "Heading:" => H3
 */
function smartHtml(raw: string) {
  const s = (raw || "").toString().trim();
  if (!s) return "";

  // If it already contains tags, keep it as-is.
  if (/<\/?[a-z][\s\S]*>/i.test(s)) return s;

  const lines = s.split(/\r?\n/).map((l) => l.trim());
  const out: string[] = [];
  let ul: string[] = [];
  let ol: string[] = [];

  const flushUl = () => {
    if (ul.length) {
      out.push(`<ul>${ul.join("")}</ul>`);
      ul = [];
    }
  };

  const flushOl = () => {
    if (ol.length) {
      out.push(`<ol>${ol.join("")}</ol>`);
      ol = [];
    }
  };

  const flushLists = () => {
    flushUl();
    flushOl();
  };

  for (const line of lines) {
    if (!line) {
      flushLists();
      continue;
    }

    // Ordered list: "1. Item"
    const olMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (olMatch) {
      flushUl();
      ol.push(`<li>${escapeHtml(olMatch[2] || "")}</li>`);
      continue;
    }

    // Unordered list: "- Item" or "• Item"
    const ulMatch = line.match(/^[-•]\s+(.*)$/);
    if (ulMatch) {
      flushOl();
      ul.push(`<li>${escapeHtml(ulMatch[1] || "")}</li>`);
      continue;
    }

    // "Heading:" => <h3>Heading</h3>
    const hMatch = line.match(/^(.+):$/);
    if (hMatch && (hMatch[1] || "").length <= 80) {
      flushLists();
      out.push(`<h3>${escapeHtml(hMatch[1])}</h3>`);
      continue;
    }

    // default paragraph
    flushLists();
    out.push(`<p>${escapeHtml(line)}</p>`);
  }

  flushLists();
  return out.join("\n");
}

export default function VisaTypeSection({
  countryName,
  config,
  slug,
  content,
}: VisaTypeSectionProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"single" | "multiple">("single");

  const plans = activeTab === "single" ? config.single : config.multiple;
  const singleCount = config.single?.length ?? 0;
  const multiCount = config.multiple?.length ?? 0;

  const hasPlans = plans && plans.length > 0;

  const extraFast = (config as any)?.addons?.extraFast;
  const extraFastEnabled = !!extraFast?.enabled;
  const extraFastAmount = Number(extraFast?.amount || 0);
  const extraFastCurrency = (extraFast?.currency || "USD") as string;

  const contentHeading = (content?.heading || "").trim();
  const contentSummary = (content?.summary || "").trim();
  const contentHtml = useMemo(
    () => smartHtml((content?.html || "").toString()),
    [content?.html],
  );

  return (
    <section className="bg-white">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-24 pb-6">
        {/* breadcrumb pill */}
        <div className="inline-flex items-center gap-2 rounded-full bg-[#F5F7FF] px-3 py-1 mb-3">
          <span className="h-1.5 w-1.5 rounded-full bg-[#62E9C9]" />
          <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#62E9C9]">
            Dubai Visa pricing for {countryName}
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6">
          <div>
            <h1 className="text-[30px] md:text-[34px] leading-tight font-extrabold text-[#3C4161]">
              Select a Dubai Visa Type
            </h1>
            <p className="mt-1.5 text-[13px] md:text-[14px] text-[#3C4161]/80 max-w-2xl">
              No hidden fees, all taxes included. Prices are shown for
              applicants from{" "}
              <span className="font-semibold text-[#3C4161]">
                {countryName}
              </span>
              .
            </p>
          </div>

          {/* info pill */}
          <div className="flex justify-start md:justify-end">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#F5F7FF] px-3 py-1.5 text-[11px] text-[#3C4161]/75 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>All prices in USD. Processing time is approximate.</span>
            </div>
          </div>

          {extraFastEnabled && extraFastAmount > 0 && (
            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#FFFEE5] px-3 py-1.5 text-[11px] font-semibold text-[#111827] shadow-sm ring-1 ring-[#F0E960]/70">
              <Sparkles className="h-3.5 w-3.5 text-[#62E9C9]" />
              Extra fast processing available (+${extraFastAmount}{" "}
              {extraFastCurrency} per applicant)
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="inline-flex items-center rounded-full bg-[#F5F7FF] p-1 gap-1 shadow-inner">
            {/* Single tab */}
            <button
              type="button"
              onClick={() => setActiveTab("single")}
              className={`relative flex items-center gap-2 rounded-full px-5 py-2 text-xs md:text-sm font-semibold cursor-pointer transition-all ${
                activeTab === "single"
                  ? "bg-white text-[#3C4161] shadow-sm"
                  : "text-[#3C4161]/70 hover:text-[#3C4161]"
              }`}
            >
              Single Entry Visa
              <span
                className={`inline-flex h-5 min-w-[22px] items-center justify-center rounded-full text-[11px] ${
                  activeTab === "single"
                    ? "bg-[#62E9C9]/15 text-[#62E9C9]"
                    : "bg-white/70 text-[#3C4161]/70"
                }`}
              >
                {singleCount}
              </span>
            </button>

            {/* Multiple tab */}
            <button
              type="button"
              onClick={() => setActiveTab("multiple")}
              className={`relative flex items-center gap-2 rounded-full px-5 py-2 text-xs md:text-sm font-semibold cursor-pointer transition-all ${
                activeTab === "multiple"
                  ? "bg-white text-[#3C4161] shadow-sm"
                  : "text-[#3C4161]/70 hover:text-[#3C4161]"
              }`}
            >
              Multiple Entry Visa
              <span
                className={`inline-flex h-5 min-w-[22px] items-center justify-center rounded-full text-[11px] ${
                  activeTab === "multiple"
                    ? "bg-[#62E9C9]/15 text-[#62E9C9]"
                    : "bg-white/70 text-[#3C4161]/70"
                }`}
              >
                {multiCount}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Cards + skyline background */}
      <div className="relative">
        {/* soft gradient behind cards */}
        <div className="absolute inset-x-0 top-0 bottom-0 -z-10 bg-gradient-to-b from-[#F8FAFF] via-white to-white" />

        {/* very soft skyline at bottom */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-44 opacity-[0.08] -z-10"
          style={{
            backgroundImage: "url('/images/visa-skyline.jpg')",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "bottom center",
            backgroundSize: "100% auto",
          }}
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          {!hasPlans && (
            <div className="mt-8 rounded-2xl border border-dashed border-[#CBD5F0] bg-white/80 px-6 py-7 text-center text-sm text-[#3C4161]/80">
              No visa packages configured yet for{" "}
              <span className="font-semibold">{countryName}</span> under{" "}
              <span className="font-semibold">
                {activeTab === "single"
                  ? "Single Entry Visa"
                  : "Multiple Entry Visa"}
              </span>
              . Please check back later.
            </div>
          )}

          {hasPlans && (
            <div className="mt-6 grid gap-6 md:gap-8 md:grid-cols-3">
              {plans.map((plan: any, idx: number) => {
                const isHighlight = !!plan.highlight;
                const planId = plan.id ?? `${activeTab}-${idx}`;

                const goToApply = () => {
                  router.push(
                    `/apply?country=${slug}` +
                      `&planId=${encodeURIComponent(plan.id ?? planId)}` +
                      `&countryName=${encodeURIComponent(countryName)}` +
                      `&visa=${encodeURIComponent(plan.title ?? "")}` +
                      `&entry=${encodeURIComponent(plan.subtitle ?? "")}` +
                      `&price=${Number(plan.price) || 0}`,
                  );
                };

                return (
                  <article
                    key={planId}
                    role="button"
                    tabIndex={0}
                    onClick={goToApply}
                    onKeyDown={(e) => e.key === "Enter" && goToApply()}
                    className={`group relative flex flex-col justify-between rounded-[28px] border bg-white px-6 pt-6 pb-6 min-h-[260px] cursor-pointer transition-all duration-300 ease-out
                      shadow-[0_18px_50px_rgba(15,23,42,0.08)]
                      ${
                        isHighlight
                          ? "border-[#F0E960]/80 bg-gradient-to-b from-white via-white to-[#FFFEE5] shadow-[0_26px_80px_rgba(15,23,42,0.16)]"
                          : "border-slate-100"
                      }
                      hover:-translate-y-1.5 hover:shadow-[0_30px_90px_rgba(98,233,201,0.15)] hover:border-[#62E9C9]/30`}
                  >
                    {/* top labels */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#94A3B8]">
                          Visa package
                        </p>
                        <h3 className="text-[19px] leading-snug font-extrabold text-[#111827]">
                          {plan.title}
                        </h3>
                        {plan.entryType && (
                          <p className="text-[13px] font-medium text-[#4B5563]">
                            {plan.entryType}
                          </p>
                        )}
                      </div>

                      {isHighlight && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F0E960] px-2.5 py-1 text-[11px] font-semibold text-[#111827] shadow-sm">
                          <BadgeCheck className="h-3.5 w-3.5" />
                          Most popular
                        </span>
                      )}
                    </div>

                    {/* price */}
                    <div className="mt-6 space-y-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-[20px] md:text-[22px] font-extrabold text-[#111827] mr-1">
                          $
                        </span>
                        <span className="text-[32px] md:text-[34px] font-extrabold tracking-tight text-[#111827]">
                          {plan.price}
                        </span>
                      </div>

                      {plan.description && (
                        <p className="mt-1 text-[11px] md:text-[12px] text-[#6B7280]">
                          {plan.description}
                        </p>
                      )}
                    </div>

                    {/* CTA button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToApply();
                      }}
                      className="mt-8 inline-flex items-center gap-2 text-[13px] font-semibold text-[#62E9C9] group-hover:text-[#111827] transition-colors"
                    >
                      Let&apos;s Proceed
                      <span
                        aria-hidden="true"
                        className="ml-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-[#62E9C9]/25 text-[11px] transition-all group-hover:border-[#111827]/35 group-hover:translate-x-0.5"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ✅ Premium content section */}
      {(contentHeading || contentSummary || contentHtml) && (
        <div className="bg-gradient-to-b from-white to-[#F7F8FF]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
            <div className="mt-4 rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)] overflow-hidden">
              {/* Top bar */}
              <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-[#F7F8FF] to-white">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-3 py-1">
                      <BookOpen className="h-4 w-4 text-[#62E9C9]" />
                      <span className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#62E9C9]">
                        Guide
                      </span>
                    </div>

                    <h2 className="mt-2 text-[22px] md:text-[26px] font-extrabold tracking-tight text-[#111827]">
                      {contentHeading ||
                        `Dubai Visa for ${countryName} – Requirements, Fees & Processing Time`}
                    </h2>

                    {contentSummary ? (
                      <p className="mt-2 text-[14px] leading-relaxed text-[#475569] max-w-3xl">
                        {contentSummary}
                      </p>
                    ) : null}
                  </div>

                  {/* Quick actions */}
                  <div className="flex items-center gap-2 md:justify-end">
                    <a
                      href="/apply"
                      className="inline-flex text-nowrap items-center gap-2 rounded-full bg-[#62E9C9] px-4 py-2 text-xs font-semibold text-[#0c4d3d] shadow-sm hover:opacity-95 transition"
                      title="Start application"
                    >
                      <Sparkles className="h-4 w-4" />
                      Apply now
                    </a>

                    <a
                      href="/contact"
                      className="inline-flex text-nowrap items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-[#111827] hover:bg-slate-50 transition"
                      title="Get help"
                    >
                      <HelpCircle className="h-4 w-4 text-[#62E9C9]" />
                      Get help
                    </a>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
                {/* Main HTML */}
                <div className="min-w-0">
                  <div
                    className="text-[15px] leading-relaxed text-[#111827]
                      [&_h1]:text-[#0f172a] [&_h1]:text-2xl [&_h1]:font-extrabold [&_h1]:mt-6
                      [&_h2]:text-[#0f172a] [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:mt-6
                      [&_h3]:text-[#0f172a] [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-5
                      [&_p]:mt-3 [&_p]:text-[#111827]/90
                      [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6
                      [&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:pl-6
                      [&_li]:mt-1
                      [&_a]:text-[#62E9C9] [&_a]:font-semibold hover:[&_a]:underline"
                    dangerouslySetInnerHTML={{ __html: contentHtml }}
                  />
                </div>

                {/* Sidebar */}
                <aside className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-[#F7F8FF] p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-200">
                        <BadgeCheck className="h-5 w-5 text-[#62E9C9]" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#111827]">
                          What happens next
                        </p>
                        <p className="mt-1 text-[12px] leading-relaxed text-[#475569]">
                          Choose a package above, upload your documents, then
                          track your application online.
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2">
                      <div className="flex items-center gap-2 text-[12px] text-[#334155]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#62E9C9]" />
                        Secure online submission
                      </div>
                      <div className="flex items-center gap-2 text-[12px] text-[#334155]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#62E9C9]" />
                        Transparent pricing
                      </div>
                      <div className="flex items-center gap-2 text-[12px] text-[#334155]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#62E9C9]" />
                        Support when needed
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-sm font-bold text-[#111827]">
                      Helpful links
                    </p>
                    <div className="mt-3 space-y-2">
                      <a
                        href="/faqs"
                        className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px] font-semibold text-[#111827] hover:bg-slate-50 transition"
                      >
                        FAQs
                        <ExternalLink className="h-4 w-4 text-[#62E9C9] opacity-70 group-hover:opacity-100" />
                      </a>
                      <a
                        href="/track"
                        className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px] font-semibold text-[#111827] hover:bg-slate-50 transition"
                      >
                        Track application
                        <ExternalLink className="h-4 w-4 text-[#62E9C9] opacity-70 group-hover:opacity-100" />
                      </a>
                      <a
                        href="/contact"
                        className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px] font-semibold text-[#111827] hover:bg-slate-50 transition"
                      >
                        Contact support
                        <ExternalLink className="h-4 w-4 text-[#62E9C9] opacity-70 group-hover:opacity-100" />
                      </a>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-[#111827] to-[#0b1224] p-4 text-white">
                    <p className="text-sm font-bold">
                      Need help choosing the right visa?
                    </p>
                    <p className="mt-1 text-[12px] text-white/80 leading-relaxed">
                      Our team can guide you based on your travel dates and
                      requirements.
                    </p>
                    <a
                      href="https://wa.me/971558715533"
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-3 py-2 text-[12px] font-semibold text-[#111827] hover:opacity-95 transition"
                    >
                      <FaWhatsapp className="h-4 w-4 text-[#25D366]" />
                      Talk to support
                    </a>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
