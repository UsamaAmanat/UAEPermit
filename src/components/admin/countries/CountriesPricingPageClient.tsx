// src/components/admin/countries/CountriesPricingPageClient.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import {
  FiGlobe,
  FiPlus,
  FiEdit2,
  FiRefreshCw,
  FiSearch,
} from "react-icons/fi";

type CountrySummary = {
  id: string; // document ID (slug)
  name: string;
  singleCount: number;
  multipleCount: number;
};

export default function CountriesPricingPageClient() {
  const router = useRouter();
  const [countries, setCountries] = useState<CountrySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  async function loadCountries(isRefresh = false) {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const snap = await getDocs(collection(db, "countries"));

      const list: CountrySummary[] = [];

      snap.forEach((docSnap) => {
        const data = docSnap.data() as any;

        const singleArr = Array.isArray(data.pricing?.single)
          ? data.pricing.single
          : [];
        const multipleArr = Array.isArray(data.pricing?.multiple)
          ? data.pricing.multiple
          : [];

        list.push({
          id: docSnap.id,
          name: data.name || docSnap.id,
          singleCount: singleArr.length,
          multipleCount: multipleArr.length,
        });
      });

      // sort alphabetically by name for nice UX
      list.sort((a, b) => a.name.localeCompare(b.name));

      setCountries(list);
    } catch (err) {
      console.error("Failed to load countries", err);
      setError("Could not load countries. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadCountries(false);
  }, []);

  const filtered = countries.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)
    );
  });

  const totalSingle = countries.reduce((sum, c) => sum + c.singleCount, 0);
  const totalMulti = countries.reduce((sum, c) => sum + c.multipleCount, 0);

  return (
    <div className="space-y-6">
      {/* Top header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#DEE05B] text-[#141729] shadow-md">
            <FiGlobe className="text-xl" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-semibold text-slate-50">
              Countries &amp; Pricing
            </h1>
            <p className="text-xs md:text-sm text-slate-400">
              Manage visa pricing for each country. Single &amp; multiple entry
              packages are controlled from here.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => loadCountries(true)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-600/60 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-slate-300 hover:bg-slate-800 transition cursor-pointer"
          >
            <FiRefreshCw
              className={`text-sm ${refreshing ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => router.push("/admin/countries-pricing/new")}
            className="inline-flex items-center gap-2 rounded-full bg-[#DEE05B] px-4 py-2 text-xs md:text-sm font-semibold text-[#141729] shadow-md hover:shadow-lg hover:bg-[#e9eb6b] transition cursor-pointer"
          >
            <FiPlus className="text-sm" />
            <span>Add country</span>
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Total countries
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-50">
            {countries.length}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            Connected to visa pricing
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-300">
            Single entry packages
          </p>
          <p className="mt-1 text-2xl font-semibold text-emerald-200">
            {totalSingle}
          </p>
          <p className="mt-1 text-[11px] text-emerald-300/80">
            Sum of all single entry plans
          </p>
        </div>

        <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-sky-300">
            Multiple entry packages
          </p>
          <p className="mt-1 text-2xl font-semibold text-sky-200">
            {totalMulti}
          </p>
          <p className="mt-1 text-[11px] text-sky-300/80">
            Sum of all multiple entry plans
          </p>
        </div>
      </div>

      {/* Search + table card */}
      <div className="rounded-3xl border border-white/10 bg-white/95 text-slate-900 shadow-[0_22px_65px_rgba(0,0,0,0.45)]">
        {/* Card header */}
        <div className="flex flex-col gap-3 border-b border-slate-200/80 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Country pricing overview
            </p>
            <p className="text-xs text-slate-500">
              Click any row to manage that country’s visa packages.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or slug…"
                className="h-9 w-56 rounded-full border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-900 outline-none ring-0 focus:border-[#3946A7] focus:ring-2 focus:ring-[#3946A7]/20 transition"
              />
            </div>
          </div>
        </div>

        {/* Card body */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center px-6 py-12 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 animate-ping rounded-full bg-[#3946A7]" />
                <span>Loading countries…</span>
              </div>
            </div>
          ) : error ? (
            <div className="px-6 py-10 text-center text-sm text-red-600">
              {error}
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-slate-500">
              No countries found. Try adjusting your search or{" "}
              <button
                type="button"
                onClick={() => router.push("/admin/countries-pricing/new")}
                className="font-semibold text-[#3946A7] hover:underline cursor-pointer"
              >
                add a new country
              </button>
              .
            </div>
          ) : (
            <table className="min-w-full text-left text-xs md:text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] uppercase tracking-[0.12em] text-slate-500">
                  <th className="px-4 py-2.5">Country</th>
                  <th className="px-4 py-2.5">Slug</th>
                  <th className="px-4 py-2.5 text-center">Single entry</th>
                  <th className="px-4 py-2.5 text-center">Multiple entry</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((country, index) => {
                  const isEven = index % 2 === 0;
                  return (
                    <tr
                      key={country.id}
                      onClick={() =>
                        router.push(
                          `/admin/countries-pricing/${encodeURIComponent(
                            country.id
                          )}`
                        )
                      }
                      className={`group cursor-pointer border-b border-slate-100 transition ${
                        isEven ? "bg-white" : "bg-slate-50"
                      } hover:bg-[#EEF2FF]`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#DEE05B]/40 text-xs font-semibold text-[#141729]">
                            {country.name.charAt(0).toUpperCase()}
                          </span>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-900">
                              {country.name}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Public page: /country/{country.id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-middle text-xs text-slate-500">
                        {country.id}
                      </td>
                      <td className="px-4 py-3 align-middle text-center text-xs">
                        <span className="inline-flex min-w-[2.5rem] items-center justify-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 group-hover:bg-emerald-100">
                          {country.singleCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-middle text-center text-xs">
                        <span className="inline-flex min-w-[2.5rem] items-center justify-center rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700 group-hover:bg-sky-100">
                          {country.multipleCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-middle text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation(); // don’t trigger row click
                            router.push(
                              `/admin/countries-pricing/${encodeURIComponent(
                                country.id
                              )}`
                            );
                          }}
                          className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1 text-[11px] font-medium text-slate-700 shadow-sm hover:border-[#3946A7] hover:text-[#3946A7] hover:shadow-md transition cursor-pointer"
                        >
                          <FiEdit2 className="text-xs" />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
