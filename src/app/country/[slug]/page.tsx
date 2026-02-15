// src/app/country/[slug]/page.tsx
import type { Metadata } from "next";
import CountryVisaPageClient from "@/components/country/CountryVisaPageClient";
import { getCountryServer } from "@/lib/countriesServer";
import { getGlobalPricingServer } from "@/lib/pricingServer";
import { redirect, notFound } from "next/navigation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type CountryPageProps = {
  // ✅ Next can pass params as a Promise (new behavior)
  params: Promise<{ slug?: string }>;
};

// ✅ slugs that are real pages, not countries
const RESERVED_SLUGS = new Set(["stay-overstay-rules"]);

function slugToName(slug?: string) {
  const s = String(slug || "").trim();
  if (!s) return "";
  return s
    .split("-")
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

function toPlain(v: any): any {
  if (v === null || v === undefined) return v;
  if (Array.isArray(v)) return v.map(toPlain);

  if (v && typeof v === "object" && typeof v.toDate === "function") {
    return v.toDate().toISOString();
  }

  if (typeof v === "object") {
    const out: any = {};
    for (const [k, val] of Object.entries(v)) out[k] = toPlain(val);
    return out;
  }

  return v;
}

export async function generateMetadata({
  params,
}: CountryPageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = String(rawSlug || "").trim();

  if (slug && RESERVED_SLUGS.has(slug)) {
    redirect(`/${slug}`);
  }

  if (!slug) {
    const fallbackTitle = "Dubai Visa | Requirements & Fees";
    const fallbackDesc =
      "Dubai & UAE Visa Assistance — fast processing, secure payments, and 24/7 support.";

    return {
      title: fallbackTitle,
      description: fallbackDesc,
      alternates: { canonical: "/" },
      robots: { index: true, follow: true }, // ✅ homepage
      openGraph: {
        title: fallbackTitle,
        description: fallbackDesc,
        type: "website",
      },
      twitter: {
        card: "summary",
        title: fallbackTitle,
        description: fallbackDesc,
      },
    };
  }

  let country: any = null;
  try {
    country = await getCountryServer(slug);
  } catch (e) {
    console.error("[Country.generateMetadata] getCountryServer failed:", e);
  }

  // ✅ If country missing / fetch failed, do NOT index a fallback “ghost” page
  if (!country) {
    const countryName = slugToName(slug);
    const title = `Dubai Visa for ${countryName} | Requirements & Fees`;
    const description = `Apply for Dubai visa from ${countryName}. Fast processing, secure payment, and expert support. Check requirements, fees, and processing time.`;

    return {
      title,
      description,
      alternates: { canonical: `/country/${slug}` },
      robots: { index: false, follow: false }, // ✅ IMPORTANT

      // ✅ NEW: custom meta tag
      other: {
        "country-name": countryName,
      },

      openGraph: { title, description, type: "website" },
      twitter: { card: "summary", title, description },
    };
  }

  const countryName = country?.name || slugToName(slug);

  const fallbackTitle = `Dubai Visa for ${countryName} | Requirements & Fees`;
  const fallbackDesc = `Apply for Dubai visa from ${countryName}. Fast processing, secure payment, and expert support. Check requirements, fees, and processing time.`;

  const title = country?.seo?.metaTitle?.trim() || fallbackTitle;
  const description = country?.seo?.metaDescription?.trim() || fallbackDesc;
  const ogImage = country?.seo?.ogImage?.trim();

  const status = String(country?.status || "").toLowerCase();
  const isIndexable = status === "active"; // ✅ your rule

  if (process.env.NODE_ENV !== "production") {
    console.log("[Country SEO]", { slug, found: true, status });
  }

  return {
    title,
    description,
    alternates: { canonical: `/country/${slug}` },
    robots: isIndexable
      ? { index: true, follow: true }
      : { index: false, follow: false },

    // ✅ NEW: custom meta tag
    other: {
      "country-name": countryName,
    },

    openGraph: {
      title,
      description,
      type: "website",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}



export default async function CountryPage({ params }: CountryPageProps) {
  const { slug: rawSlug } = await params;
  const slug = String(rawSlug || "").trim();

  if (slug && RESERVED_SLUGS.has(slug)) redirect(`/${slug}`);

  if (!slug) notFound();

  const [countryRes, pricingRes] = await Promise.allSettled([
    getCountryServer(slug),
    getGlobalPricingServer(),
  ]);

  const country = countryRes.status === "fulfilled" ? countryRes.value : null;
  const pricing = pricingRes.status === "fulfilled" ? pricingRes.value : null;

  // ✅ HARD STOP: no country doc = not a real page
  if (!country) {
    notFound();
  }

  return (
    <CountryVisaPageClient
      slug={slug}
      country={toPlain(country)}
      globalAddons={pricing?.addons ? toPlain(pricing.addons) : null}
    />
  );
}

