"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, User } from "firebase/auth";

import AdminLayout from "@/components/admin/AdminLayout";
import { auth } from "@/lib/firebaseClient";
import { upsertCountry } from "@/lib/countriesRepo";
import type { CountryDocument } from "@/types/country";
import {
  COUNTRY_SEED,
  createDefaultSinglePackages,
  createDefaultMultiplePackages,
} from "@/data/countrySeed";

const ALLOWED_ADMINS = ["admin@uaepermit.com"];

const slugify = (name: string) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "") || "new-country";

export default function CountriesBulkImportPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState<string[]>([]);

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

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/admin/login");
  };

  const appendLog = (line: string) =>
    setLog((prev) => [...prev, `${new Date().toLocaleTimeString()}  ${line}`]);

  const handleImport = async () => {
    if (running) return;
    const ok = window.confirm(
      `This will upsert ${COUNTRY_SEED.length} countries with default visa cards. Continue?`,
    );
    if (!ok) return;

    setRunning(true);
    setLog([]);
    appendLog(`Starting import for ${COUNTRY_SEED.length} countries…`);

    try {
      for (const seed of COUNTRY_SEED) {
        const slug = slugify(seed.name);

        const single = createDefaultSinglePackages(slug);
        const multiple = createDefaultMultiplePackages(slug);

        // Use highlighted single card as default, fallback to first
        const highlighted = single.find((c) => c.highlight);
        const firstSingle = highlighted || single[0];
        const defaultVisaLabel = `${firstSingle.title} ${firstSingle.subtitle}`;

        const doc: CountryDocument = {
          slug,
          name: seed.name,
          code: seed.code,
          region: seed.region,
          status: "active",
          single,
          multiple,
          defaultVisaLabel,
          defaultEntryType: "single",
        };

        await upsertCountry(doc);
        appendLog(`✓ Imported ${seed.name} (${slug})`);
      }

      appendLog("✅ All countries imported.");
    } catch (err: any) {
      console.error(err);
      appendLog(`❌ Error: ${err?.message || String(err)}`);
    } finally {
      setRunning(false);
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

  return (
    <AdminLayout userEmail={user.email} onLogout={handleLogout}>
      <div className="space-y-6 max-w-3xl">
        <button
          type="button"
          onClick={() => router.push("/admin/countries-pricing")}
          className="inline-flex items-center text-xs font-medium text-slate-300 hover:text-white"
        >
          <span className="mr-1 text-lg">←</span>
          Back to Countries &amp; Pricing
        </button>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Bulk import countries
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            One-time tool to create all countries with the default
            Single/Multiple visa packages (same structure as your current
            Firestore “china” document).
          </p>
        </div>

        <div className="rounded-2xl bg-[#050818] border border-white/10 p-5 space-y-4">
          <button
            type="button"
            onClick={handleImport}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-full bg-[#DEE05B] px-6 py-2 text-sm font-semibold text-[#141729] shadow-[0_18px_45px_rgba(222,224,91,0.6)] hover:bg-[#f2f46d] disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {running ? "Importing…" : "Import seed countries"}
          </button>

          <p className="text-xs text-slate-500">
            Safe to re-run: it uses <code>upsertCountry</code> so existing docs
            are updated, not duplicated.
          </p>

          <div className="mt-3 h-56 overflow-auto rounded-lg bg-slate-950/70 border border-white/10 px-3 py-2 text-[11px] font-mono text-slate-200">
            {log.length === 0 ? (
              <span className="text-slate-500">
                Log output will appear here after you click Import.
              </span>
            ) : (
              log.map((line, i) => <div key={i}>{line}</div>)
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
