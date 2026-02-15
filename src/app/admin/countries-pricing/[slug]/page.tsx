// src/app/admin/countries-pricing/[slug]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import AdminLayout from "@/components/admin/AdminLayout";
import type { CountryDocument, VisaCard, VisaEntryType } from "@/types/country";
import { getCountry, upsertCountry } from "@/lib/countriesRepo";
import { v4 as uuid } from "uuid";
import { serverTimestamp } from "firebase/firestore";
import PremiumRichEditor from "@/components/admin/PremiumRichEditor";
import BlogEditor from "@/components/admin/BlogEditor";
import { Eye, Sparkles, Save, ExternalLink } from "lucide-react";

const ALLOWED_ADMINS = ["admin@uaepermit.com"];

const slugify = (name: string) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "") || "new-country";

const REGIONS = [
  "Asia",
  "Europe",
  "Africa",
  "North America",
  "South America",
  "Oceania",
  "Middle East",
  "Other",
];

const STATUS_OPTIONS: CountryDocument["status"][] = [
  "active",
  "hidden",
  "comingSoon",
];

type ExtraFastAddon = {
  enabled: boolean;
  amount: number;
  currency: "USD";
  mode: "per_applicant";
};

const defaultExtraFast: ExtraFastAddon = {
  enabled: true,
  amount: 30,
  currency: "USD",
  mode: "per_applicant",
};

function clampText(s: string, max: number) {
  const v = (s || "").trim();
  return v.length > max ? v.slice(0, max) : v;
}
function stripHtml(html: string) {
  return (html || "").replace(/<[^>]*>?/gm, "").trim();
}

function clamp(s: string, max: number) {
  const v = (s || "").toString();
  return v.length > max ? v.slice(0, max) : v;
}

export default function EditCountryPricingPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const isNew = slug === "new";

  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  const [country, setCountry] = useState<CountryDocument | null>(null);
  const [activeTab, setActiveTab] = useState<VisaEntryType>("single");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useGlobalAddon, setUseGlobalAddon] = useState(true);
  const [countryExtraFast, setCountryExtraFast] =
    useState<ExtraFastAddon>(defaultExtraFast);

  // --- Auth guard ---------------------------------------------------------
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setChecking(false);
        router.replace("/admin/login");
        return;
      }
      if (!currentUser.email || !ALLOWED_ADMINS.includes(currentUser.email)) {
        setUser(null);
        setChecking(false);
        router.replace("/admin/login");
        return;
      }
      setUser(currentUser);
      setChecking(false);
    });
    return () => unsub();
  }, [router]);

  // --- Load country -------------------------------------------------------
  useEffect(() => {
    if (!slug) return;

    (async () => {
      setLoading(true);
      const doc = await getCountry(slug);

      const safeDoc = (doc ?? {
        slug,
        name: isNew ? "" : slug[0].toUpperCase() + slug.slice(1),
        code: slug.slice(0, 2).toUpperCase(),
        region: "",
        status: "active",
        single: [],
        multiple: [],
        defaultVisaLabel: "",
        defaultEntryType: "single",
        seo: { metaTitle: "", metaDescription: "", ogImage: "" },
        content: { heading: "", summary: "", html: "" },

        // ✅ addons allowed without breaking CountryDocument typing
        addons: {
          useGlobal: true,
          extraFast: { enabled: true, amount: 0, currency: "USD" },
        },
      }) as CountryDocument & {
        addons?: {
          useGlobal?: boolean;
          extraFast?: any;
        };
      };

      (safeDoc as any).single = Array.isArray(safeDoc.single)
        ? safeDoc.single
        : [];
      (safeDoc as any).multiple = Array.isArray(safeDoc.multiple)
        ? safeDoc.multiple
        : [];

      if (!safeDoc.status) safeDoc.status = "active";
      if (safeDoc.region === undefined || safeDoc.region === null)
        safeDoc.region = "";

      // ✅ ensure seo always exists (prevents undefined UI issues)
      (safeDoc as any).seo = safeDoc.seo ?? {
        metaTitle: "",
        metaDescription: "",
        ogImage: "",
      };

      // normalize strings a bit
      (safeDoc as any).seo.metaTitle = (
        safeDoc.seo?.metaTitle || ""
      ).toString();
      (safeDoc as any).seo.metaDescription = (
        safeDoc.seo?.metaDescription || ""
      ).toString();
      (safeDoc as any).seo.ogImage = (safeDoc.seo?.ogImage || "").toString();
      (safeDoc as any).content = safeDoc.content ?? {
        heading: "",
        summary: "",
        html: "",
      };
      (safeDoc as any).content.heading = (
        safeDoc.content?.heading || ""
      ).toString();
      (safeDoc as any).content.summary = (
        safeDoc.content?.summary || ""
      ).toString();
      (safeDoc as any).content.html = (safeDoc.content?.html || "").toString();

      setCountry(safeDoc);
      const ef = (safeDoc as any)?.addons?.extraFast;

      if (ef && typeof ef === "object") {
        setUseGlobalAddon(false);
        setCountryExtraFast({
          enabled: !!ef.enabled,
          amount: Number(ef.amount || 0),
          currency: "USD",
          mode: "per_applicant",
        });
      } else {
        setUseGlobalAddon(true);
        setCountryExtraFast(defaultExtraFast);
      }

      setLoading(false);
    })();
  }, [slug, isNew]);

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/admin/login");
  };

  if (checking || loading || !country || !user) {
    if (!checking && !loading && !user) return null;
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1020]">
        <p className="text-slate-400 text-sm">Loading country…</p>
      </div>
    );
  }

  // --- Card helpers -------------------------------------------------------
  const rawCards = (country as any)[activeTab];
  const cards: VisaCard[] = Array.isArray(rawCards) ? rawCards : [];

  const updateCards = (nextCards: VisaCard[]) => {
    setCountry({
      ...country,
      [activeTab]: nextCards,
    } as CountryDocument);
  };

  const updateCard = (index: number, patch: Partial<VisaCard>) => {
    const next = [...cards];
    next[index] = { ...next[index], ...patch };
    updateCards(next);
  };

  const addCard = () => {
    const base: VisaCard = {
      id: `${country.slug}-${uuid().slice(0, 6)}`,
      title: "New package",
      subtitle:
        activeTab === "single" ? "Single Entry Visa" : "Multiple Entry Visa",
      price: 0,
      currency: "USD",
      description: "Processing time 24 to 48 hours",
      highlight: false,
    };
    updateCards([...cards, base]);
  };

  const removeCard = (index: number) => {
    const next = [...cards];
    next.splice(index, 1);
    updateCards(next);
  };

  const changePrice = (index: number, delta: number) => {
    const current = Number(cards[index]?.price || 0);
    const nextVal = Math.max(0, current + delta);
    updateCard(index, { price: nextVal });
  };

  // --- SEO helpers --------------------------------------------------------
  // --- SEO helpers --------------------------------------------------------
  const seoTitleLen = country.seo?.metaTitle?.length || 0;
  const seoDescLen = country.seo?.metaDescription?.length || 0;

  // ✅ Country content counters (ADD THESE)
  const contentHeadingLen = country.content?.heading?.length || 0;
  const contentSummaryLen = country.content?.summary?.length || 0;

  const autoGenerateSEO = () => {
    const name = (country.name || "").trim();
    const title = name
      ? `Dubai Visa for ${name} | Requirements & Fees`
      : `Dubai Visa | Requirements & Fees`;

    const desc = name
      ? `Apply for your Dubai visa from ${name}. Fast processing, secure online payment, and expert support. Check requirements, fees, and processing time.`
      : `Apply for your Dubai visa. Fast processing, secure online payment, and expert support. Check requirements, fees, and processing time.`;

    setCountry({
      ...country,
      seo: {
        metaTitle: clampText(title, 70),
        metaDescription: clampText(desc, 170),
        ogImage: (country.seo?.ogImage || "").trim(),
      },
    });
  };
  const autoGenerateCountryContent = () => {
    const name = (country.name || "").trim() || "this country";

    const heading = `Dubai Visa for ${name} – Requirements, Fees & Processing Time`;

    const summary =
      `A complete guide for travelers applying for a UAE/Dubai visa from ${name}: ` +
      `documents required, processing time, pricing, and how to apply online.`;

    // IMPORTANT: BlogEditor outputs HTML, so we store HTML (not plain text)
    const html = `
    <h2>Dubai Visa for ${name}</h2>
    <p>Applying for a UAE visa doesn’t have to be confusing. Below is a clear, step-by-step guide to help you understand the process, documents, and timelines.</p>

    <h3>What you’ll learn</h3>
    <ul>
      <li>Required documents</li>
      <li>Processing time</li>
      <li>How to choose the right visa</li>
      <li>How to apply online</li>
    </ul>

    <h3>Required documents</h3>
    <p>In most cases, you’ll need a passport scan, a passport-size photo, and basic details. Requirements can vary depending on visa type.</p>

    <h3>Processing time</h3>
    <p>Processing depends on the package selected on this page. After submission, you can track your application status online.</p>

    <h3>Need help?</h3>
    <p>If you’re unsure which visa to choose, contact support and we’ll guide you.</p>
  `.trim();

    setCountry({
      ...country,
      content: {
        ...(country.content || {}),
        heading: clampText(heading, 90),
        summary: clampText(summary, 180),
        html,
      },
    });
  };

  const handleSave = async () => {
    if (!country.name.trim()) {
      setError("Please enter a country name.");
      return;
    }
    if (!country.region) {
      setError("Please select a region.");
      return;
    }

    setError(null);
    setSaving(true);

    try {
      const cleanSingle = (country.single || []).map((card) => ({
        ...card,
        price: card.price ?? 0,
      }));
      const cleanMultiple = (country.multiple || []).map((card) => ({
        ...card,
        price: card.price ?? 0,
      }));

      // Default visa uses highlighted single, else first single
      const highlighted = cleanSingle.find((c) => c.highlight);
      const firstSingle = highlighted || cleanSingle[0];
      const defaultVisaLabel = firstSingle
        ? `${firstSingle.title} ${firstSingle.subtitle}`
        : "";

      let finalSlug = country.slug;
      if (isNew) finalSlug = slugify(country.name);

      const payload: CountryDocument = {
        ...country,
        slug: finalSlug,
        code: country.code || finalSlug.slice(0, 2).toUpperCase(),
        single: cleanSingle,
        multiple: cleanMultiple,
        defaultVisaLabel,
        defaultEntryType: "single",
        seo: {
          metaTitle: (country.seo?.metaTitle || "").trim(),
          metaDescription: (country.seo?.metaDescription || "").trim(),
          ogImage: (country.seo?.ogImage || "").trim(),
        },
        content: {
          heading: (country.content?.heading || "").trim(),
          summary: (country.content?.summary || "").trim(),
          html: country.content?.html || "",
        },

        // ✅ ADD THIS HERE (before upsert)
        ...(useGlobalAddon
          ? { addons: { useGlobal: true, extraFast: null } }
          : {
              addons: {
                useGlobal: false,
                extraFast: {
                  enabled: !!countryExtraFast.enabled,
                  amount: Number(countryExtraFast.amount || 0),
                  currency: "USD",
                  mode: "per_applicant",
                },
              },
            }),
      };

      await upsertCountry(payload);

      if (isNew) {
        router.replace(`/admin/countries-pricing/${finalSlug}`);
      }
    } finally {
      setSaving(false);
    }
  };

  // --- UI -----------------------------------------------------------------
  return (
    <AdminLayout userEmail={user.email} onLogout={handleLogout}>
      <div className="space-y-5">
        {/* Back link */}
        <button
          type="button"
          onClick={() => router.push("/admin/countries-pricing")}
          className="inline-flex items-center text-xs font-medium text-slate-300 hover:text-white"
        >
          <span className="mr-1 text-lg">←</span>
          Back to countries
        </button>

        {/* Heading + meta */}
        <div className="sticky top-16 z-30 -mx-6 px-6 pt-3 pb-3 bg-[#0b1020]/85 backdrop-blur border-b border-white/10">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 flex-wrap">
                <input
                  className="bg-transparent border-b border-transparent focus:border-[#DEE05B] focus:outline-none text-2xl font-semibold tracking-tight text-white placeholder:text-slate-600"
                  placeholder="Enter country name"
                  value={country.name}
                  onChange={(e) =>
                    setCountry({ ...country, name: e.target.value })
                  }
                />
                <span className="inline-flex items-center rounded-full bg-slate-900/70 border border-white/10 px-3 py-0.5 text-[11px] font-medium text-slate-200">
                  {isNew ? "New (not saved yet)" : country.status || "active"}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-400">
                Configure visa products for this country. These cards will
                appear on the public <code>/country/{country.slug}</code> page.
              </p>
            </div>

            {/* Region + status */}
            <div className="flex flex-wrap gap-3 items-center">
              <select
                className="rounded-full bg-slate-900/80 border border-white/15 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#DEE05B]/60"
                value={country.region || ""}
                onChange={(e) =>
                  setCountry({ ...country, region: e.target.value })
                }
              >
                <option value="">Select region</option>
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>

              <select
                className="rounded-full bg-slate-900/80 border border-white/15 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#DEE05B]/60"
                value={country.status || "active"}
                onChange={(e) =>
                  setCountry({
                    ...country,
                    status: e.target.value as CountryDocument["status"],
                  })
                }
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s === "comingSoon"
                      ? "Coming soon"
                      : s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-[#DEE05B] px-6 py-2 text-sm font-semibold text-[#141729] shadow-[0_18px_45px_rgba(222,224,91,0.6)] hover:bg-[#f2f46d] disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        </div>

        <div className="h-4" />

        {error && (
          <div className="text-xs text-red-300 bg-red-500/10 border border-red-500/40 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {/* Pricing editor card */}
        <div className="rounded-2xl bg-[#050818] border border-white/10 shadow-[0_18px_45px_rgba(0,0,0,0.55)] overflow-hidden">
          {/* Tabs */}
          <div className="px-5 pt-4 border-b border-white/10">
            <div className="inline-flex rounded-full bg-slate-900/60 p-1 gap-1">
              {(["single", "multiple"] as VisaEntryType[]).map((tab) => {
                const active = activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                      active
                        ? "bg-white text-[#141729] shadow-sm"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    {tab === "single"
                      ? "Single Entry Visa"
                      : "Multiple Entry Visa"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cards list */}
          <div className="px-5 py-4 space-y-3">
            {cards.length === 0 && (
              <p className="text-sm text-slate-500">
                No {activeTab === "single" ? "single" : "multiple"}-entry
                packages yet. Click &ldquo;Add card&rdquo; to create one.
              </p>
            )}

            <div className="space-y-3">
              {cards.map((card, index) => (
                <div
                  key={card.id}
                  className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center md:gap-4"
                >
                  {/* Left: basic fields */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-col md:flex-row md:items-center md:gap-3">
                      <input
                        className="w-full md:w-40 rounded-lg bg-slate-950/60 border border-white/15 px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#DEE05B]/70"
                        value={card.title}
                        onChange={(e) =>
                          updateCard(index, { title: e.target.value })
                        }
                        placeholder="Title (e.g. 30 Days)"
                      />
                      <input
                        className="mt-2 md:mt-0 flex-1 rounded-lg bg-slate-950/60 border border-white/15 px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#DEE05B]/70"
                        value={card.subtitle}
                        onChange={(e) =>
                          updateCard(index, { subtitle: e.target.value })
                        }
                        placeholder="Subtitle (e.g. Single Entry Visa)"
                      />
                    </div>

                    <textarea
                      className="w-full rounded-lg bg-slate-950/60 border border-white/15 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#DEE05B]/70"
                      rows={2}
                      value={card.description || ""}
                      onChange={(e) =>
                        updateCard(index, { description: e.target.value })
                      }
                      placeholder="Processing time / extra notes shown under the card."
                    />
                  </div>

                  {/* Right: price + highlight + delete */}
                  <div className="flex flex-col items-start gap-2 md:items-end md:w-60">
                    <label className="flex items-center gap-2 text-[11px] text-slate-300">
                      <input
                        type="checkbox"
                        checked={!!card.highlight}
                        onChange={(e) =>
                          updateCard(index, { highlight: e.target.checked })
                        }
                        className="h-3 w-3 rounded border-slate-500 bg-slate-900 text-[#DEE05B] focus:outline-none focus:ring-0"
                      />
                      Highlight this package (featured)
                    </label>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">USD</span>

                      <div className="inline-flex items-center rounded-lg bg-slate-950/60 border border-white/15 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => changePrice(index, -10)}
                          className="px-2 py-1 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          className="w-20 bg-transparent border-none text-sm text-slate-100 text-center focus:outline-none focus:ring-0 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          value={card.price === 0 ? "" : card.price}
                          onFocus={(e) => e.currentTarget.select()}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") {
                              updateCard(index, { price: 0 });
                            } else {
                              updateCard(index, { price: Number(val) || 0 });
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => changePrice(index, 10)}
                          className="px-2 py-1 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeCard(index)}
                      className="text-[11px] text-red-300 hover:text-red-200"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addCard}
              className="mt-2 inline-flex items-center gap-2 rounded-full border border-dashed border-slate-500/60 px-4 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-300 hover:text-white transition"
            >
              <span className="text-base leading-none">+</span>
              Add card
            </button>
          </div>
        </div>

        {/* ✅ Add-ons (per country override) */}
        <div className="rounded-2xl bg-[#050818] border border-white/10 shadow-[0_18px_45px_rgba(0,0,0,0.55)] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                Add-ons (optional override)
              </p>
              <p className="text-[12px] text-slate-500 mt-1">
                Extra Fast price is{" "}
                <span className="text-slate-200 font-semibold">
                  per applicant
                </span>
                . If override is disabled, this country uses the global add-on
                price.
              </p>
            </div>

            <label className="inline-flex items-center gap-2 text-xs text-slate-300">
              <input
                type="checkbox"
                checked={useGlobalAddon}
                onChange={(e) => setUseGlobalAddon(e.target.checked)}
                className="h-4 w-4 rounded border-slate-500 bg-slate-900 text-[#DEE05B] focus:outline-none focus:ring-0"
              />
              Use global add-ons
            </label>
          </div>

          <div className="px-5 py-4">
            {useGlobalAddon ? (
              <div className="rounded-xl bg-slate-950/50 border border-white/10 p-4">
                <p className="text-sm text-slate-200 font-semibold">
                  Using global price
                </p>
                <p className="text-[12px] text-slate-500 mt-1">
                  Configure it in{" "}
                  <span className="text-slate-200">Countries & Pricing</span>{" "}
                  (top Add-ons card).
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">
                      Extra Fast
                    </p>

                    <label className="inline-flex items-center gap-2 text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={countryExtraFast.enabled}
                        onChange={(e) =>
                          setCountryExtraFast((p) => ({
                            ...p,
                            enabled: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 rounded border-slate-500 bg-slate-900 text-[#DEE05B] focus:outline-none focus:ring-0"
                      />
                      Enabled
                    </label>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-1">
                    Overrides global Extra Fast for this country only.
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-[11px] text-slate-500">
                      Price / applicant
                    </div>
                    <div className="inline-flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">USD</span>
                      <input
                        type="number"
                        value={countryExtraFast.amount}
                        onChange={(e) =>
                          setCountryExtraFast((p) => ({
                            ...p,
                            amount: Number(e.target.value || 0),
                          }))
                        }
                        className="h-9 w-28 rounded-xl bg-slate-900/70 border border-white/10 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#DEE05B]/60"
                        min={0}
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                  <p className="text-sm font-semibold text-white">Example</p>
                  <p className="text-[12px] text-slate-400 mt-2">
                    2 applicants →{" "}
                    <span className="text-white font-semibold">
                      $
                      {(countryExtraFast.enabled
                        ? countryExtraFast.amount * 2
                        : 0
                      ).toFixed(2)}
                    </span>{" "}
                    extra fee when selected.
                  </p>
                  <p className="text-[11px] text-slate-500 mt-2">
                    This fee is added on top of base visa price.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ✅ SEO editor card */}
        <div className="rounded-2xl bg-[#050818] border border-white/10 shadow-[0_18px_45px_rgba(0,0,0,0.55)] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                SEO (Meta Tags)
              </p>
              <p className="text-[12px] text-slate-500 mt-1">
                Control Google title/description for this{" "}
                <code>/country/{country.slug}</code> page.
              </p>
            </div>

            <button
              type="button"
              onClick={autoGenerateSEO}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-4 py-2 text-xs font-semibold text-slate-100 hover:bg-white/15 transition"
            >
              <Sparkles className="h-4 w-4" />
              Auto-generate
            </button>
          </div>

          <div className="px-5 py-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Meta title */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-200">
                  Meta title
                </label>
                <span className="text-[11px] text-slate-500">
                  {seoTitleLen}/60
                </span>
              </div>
              <input
                value={country.seo?.metaTitle || ""}
                onChange={(e) =>
                  setCountry({
                    ...country,
                    seo: { ...(country.seo || {}), metaTitle: e.target.value },
                  })
                }
                placeholder="e.g. Dubai Visa for Pakistanis (2026) | Requirements & Fees"
                className="w-full rounded-xl bg-slate-900/70 border border-white/10 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#DEE05B]/60"
              />
              <p className="text-[11px] text-slate-500">
                Recommended: 50–60 characters. (This is your Google page title.)
              </p>
            </div>

            {/* Meta description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-200">
                  Meta description
                </label>
                <span className="text-[11px] text-slate-500">
                  {seoDescLen}/160
                </span>
              </div>
              <textarea
                value={country.seo?.metaDescription || ""}
                onChange={(e) =>
                  setCountry({
                    ...country,
                    seo: {
                      ...(country.seo || {}),
                      metaDescription: e.target.value,
                    },
                  })
                }
                rows={3}
                placeholder="e.g. Apply for Dubai Visa online. Fast processing, secure payment, requirements & fees..."
                className="w-full rounded-xl bg-slate-900/70 border border-white/10 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#DEE05B]/60"
              />
              <p className="text-[11px] text-slate-500">
                Recommended: 140–160 characters. (Shown under title in Google.)
              </p>
            </div>

            {/* OG image */}
            <div className="lg:col-span-2 space-y-2">
              <label className="text-xs font-medium text-slate-200">
                OG image (optional)
              </label>
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <input
                  value={country.seo?.ogImage || ""}
                  onChange={(e) =>
                    setCountry({
                      ...country,
                      seo: { ...(country.seo || {}), ogImage: e.target.value },
                    })
                  }
                  placeholder="https://.../image.jpg"
                  className="w-full rounded-xl bg-slate-900/70 border border-white/10 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#DEE05B]/60"
                />
                {country.seo?.ogImage?.trim() && (
                  <a
                    href={country.seo.ogImage}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 inline-flex items-center justify-center rounded-full bg-white/10 border border-white/10 px-4 py-2 text-xs font-semibold text-slate-100 hover:bg-white/15 transition"
                  >
                    Preview
                  </a>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Used for WhatsApp/Facebook previews. Leave blank if not needed.
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-[#050818] border border-white/10 shadow-[0_18px_45px_rgba(0,0,0,0.55)] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                Country content (Website)
              </p>
              <p className="text-[12px] text-slate-500 mt-1">
                This content will appear on <code>/country/{country.slug}</code>{" "}
                under the visa packages.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  window.open(
                    `/admin/countries-pricing/${country.slug}/content-preview`,
                    "_blank",
                  )
                }
                className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2 text-xs font-semibold text-slate-100 hover:bg-white/10 transition"
                title="Preview content"
              >
                {/* If you have lucide: <Eye className="h-4 w-4" /> */}
                <Eye className="h-4 w-4" /> Preview
              </button>

              <button
                type="button"
                onClick={autoGenerateCountryContent}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-4 py-2 text-xs font-semibold text-slate-100 hover:bg-white/15 transition"
              >
                <Sparkles className="h-4 w-4" />
                Auto-generate
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-[#DEE05B] px-6 py-2 text-sm font-semibold text-[#141729] shadow-[0_18px_45px_rgba(222,224,91,0.6)] hover:bg-[#f2f46d] disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>

          {/* ✅ Single column layout (no right preview) */}
          <div className="px-5 py-4">
            <div className="space-y-4">
              {/* Heading */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-200">
                    Section heading
                  </label>
                  <span className="text-[11px] text-slate-500">
                    {contentHeadingLen}/90
                  </span>
                </div>

                <input
                  value={country.content?.heading || ""}
                  onChange={(e) =>
                    setCountry({
                      ...country,
                      content: {
                        ...(country.content || {}),
                        heading: e.target.value,
                      },
                    })
                  }
                  placeholder={`Dubai Visa for ${
                    country.name || "Your Country"
                  } – Requirements & Fees`}
                  className="w-full rounded-xl bg-slate-900/70 border border-white/10 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#DEE05B]/60"
                />

                <p className="text-[11px] text-slate-500">
                  This shows as the heading of the content section on the
                  country page.
                </p>
              </div>

              {/* Summary */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-200">
                    Short summary (optional)
                  </label>
                  <span className="text-[11px] text-slate-500">
                    {contentSummaryLen}/180
                  </span>
                </div>

                <textarea
                  value={country.content?.summary || ""}
                  onChange={(e) =>
                    setCountry({
                      ...country,
                      content: {
                        ...(country.content || {}),
                        summary: e.target.value,
                      },
                    })
                  }
                  rows={3}
                  placeholder="2–3 lines that explain what the user will learn…"
                  className="w-full rounded-xl bg-slate-900/70 border border-white/10 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#DEE05B]/60"
                />

                <p className="text-[11px] text-slate-500">
                  This appears under the heading. Keep it short and high-trust.
                </p>
              </div>

              {/* Editor */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-200">
                  Main content
                </label>

                <div className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200">
                      Editor
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Tip: Use headings, lists, and short paragraphs.
                    </span>
                  </div>

                  <div className="p-3">
                    <BlogEditor
                      value={country.content?.html || ""}
                      onChange={(html) =>
                        setCountry({
                          ...country,
                          content: {
                            ...(country.content || {}),
                            html,
                          },
                        })
                      }
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-500">
                  Use the Preview button to see the final formatted output
                  exactly like the website.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
