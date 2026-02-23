// src/app/apply/ApplyCountryPicker.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReactCountryFlag from "react-country-flag";
import { Search, SearchX, Loader2 } from "lucide-react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

type Country = { name: string; code: string };

function countrySlug(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[()]/g, "")
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function ApplyCountryPicker() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch active countries from Firestore
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDocs(
          query(collection(db, "countries"), where("status", "==", "active"))
        );
        if (cancelled) return;
        const list: Country[] = [];
        snap.docs.forEach((d) => {
          const data = d.data() as any;
          const name = data?.name || d.id;
          const code = data?.countryCode || data?.code || "";
          list.push({ name, code });
        });
        list.sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
        setCountries(list);
      } catch (e) {
        console.error("Failed to load countries:", e);
        // Fallback: import static list
        const { COUNTRIES } = await import("@/data/countries");
        if (!cancelled) setCountries(COUNTRIES);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredCountries = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = !q
      ? countries
      : countries.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.code.toLowerCase().includes(q),
        );
    return [...list].sort((a, b) =>
      a.name.localeCompare(b.name, "en", { sensitivity: "base" }),
    );
  }, [search, countries]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F5F6FB] pb-16">
      <section className="mx-auto max-w-6xl px-4 pt-28">
        {/* Breadcrumb */}
        <div className="mb-6 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#62E9C9]" />
            Home
            <span className="text-slate-400">/</span>
            <span className="font-medium text-slate-700">Apply</span>
          </span>
        </div>

        {/* Heading */}
        <div className="mb-8 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">
              Apply for Dubai Visa
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Start by choosing your country. We'll then show you the visa types
              and prices available for travellers from that country.
            </p>
          </div>
          <p className="mt-2 text-xs text-slate-400 lg:mt-0">
            Secure online process · Encrypted uploads · Expert visa team
          </p>
        </div>

        {/* Country card */}
        <div className="rounded-3xl bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          {/* Header + search */}
          <div className="mb-4 flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-semibold text-slate-800">
              Select your country
            </h2>

            <div className="w-full max-w-xs">
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs shadow-[0_1px_0_rgba(15,23,42,0.03)]">
                <Search className="h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search country or code"
                  className="w-full bg-transparent text-xs text-slate-700 placeholder:text-slate-400 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Scrollable list */}
          <div className="max-h-[520px] overflow-y-auto overflow-x-hidden pr-1">
            {loading ? (
              <div className="flex h-44 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
              </div>
            ) : filteredCountries.length === 0 ? (
              <div className="flex h-44 flex-col items-center justify-center text-center">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-50">
                  <SearchX className="h-5 w-5 text-slate-400" />
                </div>
                <p className="mt-3 text-sm font-medium text-slate-800">
                  No country found
                </p>
                <p className="mt-1 max-w-xs text-[11px] text-slate-500">
                  Please check the spelling or try searching with the full
                  country name or country code.
                </p>
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-3 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700 shadow-sm hover:border-[#62E9C9] hover:text-[#62E9C9]"
                >
                  Clear search &amp; show all countries
                </button>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {filteredCountries.map((c: Country) => {
                  const slug = countrySlug(c.name);
                  const href = `/country/${slug}`;

                  return (
                    <Link
                      key={c.code || c.name}
                      href={href}
                      onMouseEnter={() => router.prefetch(href)}
                      onFocus={() => router.prefetch(href)}
                      className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-3 py-2.5 text-left text-sm text-slate-700 shadow-sm transition hover:border-[#62E9C9] hover:bg-white hover:shadow-md"
                    >
                      {/* LEFT */}
                      <span className="flex min-w-0 flex-1 items-center gap-2">
                        <span className="inline-grid h-4 w-6 shrink-0 place-items-center overflow-hidden rounded-[4px] bg-white ring-1 ring-slate-200">
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

                        <span className="truncate text-xs sm:text-[13px]">
                          {c.name}
                        </span>
                      </span>

                      {/* RIGHT */}
                      <span className="shrink-0 text-[10px] font-medium text-slate-400 group-hover:text-[#62E9C9]">
                        View visas →
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
