// src/components/country/CountryVisaPageClient.tsx
"use client";

import VisaTypeSection from "./VisaTypeSection";
import type { VisaConfig } from "@/types/country";

type CountryContent = { heading?: string; summary?: string; html?: string };

type ExtraFastAddon = {
  enabled: boolean;
  amount: number;
  currency: "USD";
  mode: "per_applicant";
};

type Props = {
  slug: string;
  country: any | null; 
  globalAddons: any | null; 
};

function slugToName(slug?: string) {
  const s = String(slug || "").trim();
  if (!s) return "";
  return s
    .split("-")
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}


function normalizePlans(value: any) {
  if (!value) return [];
  const rawList = Array.isArray(value) ? value : Object.values(value || {});
  return rawList.filter(
    (item) =>
      item &&
      typeof item === "object" &&
      ("price" in item || "title" in item || "entryType" in item),
  );
}

function normalizeContent(value: any): CountryContent {
  const c = value && typeof value === "object" ? value : {};
  return {
    heading: (c.heading || "").toString(),
    summary: (c.summary || "").toString(),
    html: (c.html || "").toString(),
  };
}

function normalizeExtraFast(value: any): ExtraFastAddon | null {
  if (!value || typeof value !== "object") return null;
  return {
    enabled: !!value.enabled,
    amount: Number(value.amount || 0),
    currency: "USD",
    mode: "per_applicant",
  };
}

export default function CountryVisaPageClient({
  slug = "",
  country,
  globalAddons,
}: Props) {
  const safeSlug = (slug || "").toString();
  const data = country ?? null;

  const countryName = (data?.name || slugToName(safeSlug) || "Choose your country").toString();

  const rawSingle = data?.single ?? data?.pricing?.single;
  const rawMultiple = data?.multiple ?? data?.pricing?.multiple;

  const single = normalizePlans(rawSingle);
  const multiple = normalizePlans(rawMultiple);

  const content = normalizeContent(data?.content);

  const countryAddons = data?.addons ?? null;
  const useGlobal = countryAddons?.useGlobal !== false;

  const effectiveExtraFast = useGlobal
    ? normalizeExtraFast(globalAddons?.extraFast)
    : normalizeExtraFast(countryAddons?.extraFast);

  const config: VisaConfig = {
    single,
    multiple,
    addons: { extraFast: effectiveExtraFast },
  };

  return (
    <VisaTypeSection
      countryName={countryName}
      config={config}
      slug={safeSlug}
      content={content}
    />
  );
}
