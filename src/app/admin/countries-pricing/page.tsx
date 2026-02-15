// src/app/admin/countries-pricing/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth, db } from "@/lib/firebaseClient";
import AdminLayout from "@/components/admin/AdminLayout";
import { useRouter } from "next/navigation";
import type { CountryDocument } from "@/types/country";
import { listCountries, deleteCountries } from "@/lib/countriesRepo";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { toast } from "sonner";

const ALLOWED_ADMINS = ["admin@uaepermit.com"];

type ExtraFastAddon = {
  enabled: boolean;
  amount: number; // USD per applicant
  currency: "USD";
  mode: "per_applicant";
};

export default function CountriesPricingPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [countries, setCountries] = useState<CountryDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);

  // ===== Global Add-ons state =====
  const [addonsLoading, setAddonsLoading] = useState(true);
  const [addonsSaving, setAddonsSaving] = useState(false);
  const [extraFast, setExtraFast] = useState<ExtraFastAddon>({
    enabled: true,
    amount: 30,
    currency: "USD",
    mode: "per_applicant",
  });
  const [globalExtraFast, setGlobalExtraFast] = useState<number>(100);
  const [savingAddons, setSavingAddons] = useState(false);

  // Auth guard
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

  // Load global add-ons (settings/pricing)
  useEffect(() => {
    if (!user) return;

    (async () => {
      setAddonsLoading(true);
      try {
        const ref = doc(db, "settings", "pricing");
        const snap = await getDoc(ref);
        const data = snap.exists() ? (snap.data() as any) : {};

        const ef = data?.addons?.extraFast;
        if (ef && typeof ef === "object") {
          setExtraFast({
            enabled: !!ef.enabled,
            amount: Number(ef.amount || 0),
            currency: "USD",
            mode: "per_applicant",
          });
        } else {
          // defaults already set
        }
      } catch (e) {
        console.error(e);
        toast.error("Failed to load add-ons pricing");
      } finally {
        setAddonsLoading(false);
      }
    })();
  }, [user]);
  useEffect(() => {
    if (!user) return;

    (async () => {
      const snap = await getDoc(doc(db, "settings", "pricing"));
      const fee = (snap.exists() ? (snap.data() as any) : null)?.addons
        ?.extraFast?.amount;
      setGlobalExtraFast(Number(fee ?? 100));
    })();
  }, [user]);

  // Load countries
  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      try {
        const data = await listCountries();
        setCountries(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/admin/login");
  };

  // Filtered countries based on search
  const filteredCountries = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return countries;

    return countries.filter((c) => {
      const name = c.name?.toLowerCase() ?? "";
      const code = c.code?.toLowerCase() ?? "";
      const region = c.region?.toLowerCase() ?? "";
      const defaultVisa = c.defaultVisaLabel?.toLowerCase() ?? "";
      return (
        name.includes(q) ||
        code.includes(q) ||
        region.includes(q) ||
        defaultVisa.includes(q)
      );
    });
  }, [countries, searchTerm]);

  // Checkbox helpers
  const toggleRowSelection = (slug: string) => {
    setSelectedSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  };

  const allFilteredSelected =
    filteredCountries.length > 0 &&
    filteredCountries.every((c) => selectedSlugs.includes(c.slug));

  const handleToggleAll = (checked: boolean) => {
    if (checked) {
      const slugs = filteredCountries.map((c) => c.slug);
      setSelectedSlugs(slugs);
    } else {
      setSelectedSlugs([]);
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (!selectedSlugs.length || deleting) return;

    const ok = window.confirm(
      `Delete ${selectedSlugs.length} selected ${
        selectedSlugs.length === 1 ? "country" : "countries"
      }? This cannot be undone.`,
    );
    if (!ok) return;

    try {
      setDeleting(true);
      await deleteCountries(selectedSlugs);

      // Remove from local state
      setCountries((prev) =>
        prev.filter((c) => !selectedSlugs.includes(c.slug)),
      );
      setSelectedSlugs([]);
      toast.success("Countries deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete countries. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1020]">
        <p className="text-slate-400 text-sm">Checking admin access…</p>
      </div>
    );
  }
  if (!user) return null;

  const previewApplicants = 3;
  const previewTotal =
    (extraFast.enabled ? extraFast.amount : 0) * previewApplicants;
  const saveGlobalAddons = async () => {
    try {
      setSavingAddons(true);

      await setDoc(
        doc(db, "settings", "pricing"),
        {
          addons: {
            extraFast: {
              enabled: true,
              amount: Number(globalExtraFast || 0),
              currency: "USD",
            },
          },
        },
        { merge: true },
      );

      toast.success("Global add-ons updated");
    } catch (e) {
      console.error(e);
      toast.error("Failed to save global add-ons");
    } finally {
      setSavingAddons(false);
    }
  };

  return (
    <AdminLayout userEmail={user.email} onLogout={handleLogout}>
      <div className="space-y-5">
        {/* Back */}
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="inline-flex items-center text-xs font-medium text-slate-300 hover:text-white"
        >
          <span className="mr-1 text-lg">←</span>
          Back to dashboard
        </button>

        {/* Heading */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Countries &amp; Pricing
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Manage which countries you support, default visa types, processing
              times and base / express prices. Changes apply to new applications
              only.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/admin/countries-pricing/new")}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-slate-900 shadow-[0_18px_45px_rgba(16,185,129,0.5)] hover:bg-emerald-300 transition"
          >
            <span className="text-lg">+</span>
            Add country
          </button>
        </div>

        {/* ✅ Global Add-ons Card */}
        <div className="rounded-2xl bg-[#050818] border border-white/10 shadow-[0_18px_45px_rgba(0,0,0,0.55)] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                Add-ons pricing
              </p>
              <p className="text-[12px] text-slate-500 mt-1">
                Controls checkout add-ons (e.g.{" "}
                <span className="text-slate-200">Extra Fast</span>) globally.
                <span className="ml-2 text-slate-400">Mode:</span>{" "}
                <span className="text-slate-200 font-semibold">
                  per applicant
                </span>
              </p>
            </div>

            <button
              type="button"
              disabled={addonsSaving || addonsLoading}
              onClick={saveGlobalAddons}
              className="inline-flex items-center gap-2 rounded-full bg-[#DEE05B] px-5 py-2 text-xs font-semibold text-[#141729] shadow-[0_18px_45px_rgba(222,224,91,0.45)] hover:bg-[#f2f46d] disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {addonsSaving ? "Saving…" : "Save add-ons"}
            </button>
          </div>

          <div className="px-5 py-4">
            {addonsLoading ? (
              <div className="text-xs text-slate-500">Loading add-ons…</div>
            ) : (
              <div className="grid grid-cols-1  gap-4">
                <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">
                      Extra Fast
                    </p>
                    <label className="inline-flex items-center gap-2 text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={extraFast.enabled}
                        onChange={(e) =>
                          setExtraFast((p) => ({
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
                    Adds an extra fee per applicant when selected at checkout.
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-[11px] text-slate-500">
                      Price / applicant
                    </div>
                    <div className="inline-flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">USD</span>
                      <input
                        type="number"
                        value={extraFast.amount}
                        onChange={(e) =>
                          setExtraFast((p) => ({
                            ...p,
                            amount: Number(e.target.value || 0),
                          }))
                        }
                        className="h-9 w-28 rounded-xl bg-slate-900/70 border border-white/10 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#DEE05B]/60"
                        min={0}
                      />
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl bg-slate-900/60 border border-white/10 p-3">
                    <p className="text-[11px] text-slate-300">
                      Preview: {previewApplicants} applicants →{" "}
                      <span className="font-semibold text-white">
                        ${(previewTotal || 0).toFixed(2)}
                      </span>{" "}
                      extra fee
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Applies only when customer selects “Extra Fast”.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-[#050818] border border-white/10 shadow-[0_18px_45px_rgba(0,0,0,0.55)] overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b border-white/5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                Country list
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {loading
                  ? "Loading countries…"
                  : `${filteredCountries.length} results matching your filters.`}
              </p>
            </div>

            {/* Search bar */}
            <div className="w-full md:w-80">
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-500">
                  <svg
                    className="w-4 h-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.6}
                      d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
                    />
                  </svg>
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search country, code or region…"
                  className="w-full rounded-full bg-slate-900/70 border border-white/10 pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#DEE05B]/60"
                />
              </div>
            </div>
          </div>

          {/* Bulk action bar – only when something selected */}
          {selectedSlugs.length > 0 && (
            <div className="px-5 py-2 border-b border-white/5 bg-[#070c1d] flex items-center justify-between text-xs">
              <span className="text-slate-200">
                {selectedSlugs.length} selected
              </span>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1 rounded-full bg-red-500/90 px-3 py-1 font-semibold text-[11px] text-white shadow-[0_10px_24px_rgba(248,113,113,0.45)] hover:bg-red-400 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {deleting ? "Deleting…" : "Delete selected"}
              </button>
            </div>
          )}

          {/* Table with internal vertical scroll */}
          <div className="overflow-x-auto">
            <div className="max-h-[520px] overflow-y-auto">
              <table className="min-w-full text-left">
                <thead className="text-[10px] uppercase tracking-[0.18em] text-slate-500 bg-slate-900/40">
                  <tr>
                    <th className="px-4 py-3 font-semibold w-10">
                      <input
                        type="checkbox"
                        checked={allFilteredSelected}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleToggleAll(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-500 bg-slate-900 text-[#DEE05B] focus:outline-none focus:ring-0 cursor-pointer"
                      />
                    </th>
                    <th className="px-4 py-3 font-semibold">Country</th>
                    <th className="px-4 py-3 font-semibold">Default visa</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {filteredCountries.map((c) => (
                    <tr
                      key={c.slug}
                      className="hover:bg-white/5 transition cursor-pointer"
                      onClick={() =>
                        router.push(`/admin/countries-pricing/${c.slug}`)
                      }
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3 align-middle">
                        <input
                          type="checkbox"
                          checked={selectedSlugs.includes(c.slug)}
                          onClick={(e) => e.stopPropagation()}
                          onChange={() => toggleRowSelection(c.slug)}
                          className="h-4 w-4 rounded border-slate-500 bg-slate-900 text-[#DEE05B] focus:outline-none focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* Country + region */}
                      <td className="px-4 py-3 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 border border-white/10 text-[11px] font-semibold">
                            {c.code || c.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-slate-100">
                              {c.name}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {c.region || "—"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Default visa */}
                      <td className="px-4 py-3 align-middle text-slate-100">
                        <div className="text-sm">
                          {c.defaultVisaLabel || "Not configured"}
                        </div>
                        {c.defaultEntryType && (
                          <div className="text-[11px] text-slate-500">
                            {c.defaultEntryType === "single"
                              ? "Single Entry"
                              : "Multiple Entry"}
                          </div>
                        )}
                      </td>

                      {/* Status pill */}
                      <td className="px-4 py-3 align-middle">
                        {c.status === "active" && (
                          <span className="inline-flex items-center rounded-full bg-emerald-400/15 text-emerald-200 px-3 py-1 text-[11px] font-medium">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-1.5" />
                            Active
                          </span>
                        )}
                        {c.status === "hidden" && (
                          <span className="inline-flex items-center rounded-full bg-slate-500/15 text-slate-200 px-3 py-1 text-[11px] font-medium">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400 mr-1.5" />
                            Hidden
                          </span>
                        )}
                        {c.status === "comingSoon" && (
                          <span className="inline-flex items-center rounded-full bg-sky-400/15 text-sky-200 px-3 py-1 text-[11px] font-medium">
                            <span className="h-1.5 w-1.5 rounded-full bg-sky-400 mr-1.5" />
                            Coming soon
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 align-middle text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/admin/countries-pricing/${c.slug}`);
                          }}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-900 text-xs font-semibold shadow-[0_10px_24px_rgba(15,23,42,0.55)] hover:bg-slate-100"
                        >
                          →
                        </button>
                      </td>
                    </tr>
                  ))}

                  {!loading && filteredCountries.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-sm text-slate-500"
                      >
                        No countries match this search. Try a different name or
                        code.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
