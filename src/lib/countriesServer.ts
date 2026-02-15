// src/lib/countriesServer.ts
import "server-only";
import { adminDB } from "@/lib/firebaseAdmin";
import type { CountryDocument } from "@/types/country";

export async function getCountryServer(slug: string): Promise<CountryDocument | null> {
  try {
    const safeSlug = String(slug || "").trim();
    if (!safeSlug) {
      console.error("[getCountryServer] ❌ empty slug received:", slug);
      return null;
    }

    const snap = await adminDB.collection("countries").doc(safeSlug).get();
    console.log("[getCountryServer]", safeSlug, "exists:", snap.exists);

    if (!snap.exists) return null;
    return snap.data() as CountryDocument;
  } catch (e) {
    console.error("getCountryServer failed:", e);
    return null;
  }
}

export async function getAllCountrySlugs(): Promise<string[]> {
  try {
    const snap = await adminDB.collection("countries").where("status", "==", "active").get();

    return snap.docs
      .map((d) => String((d.data() as any)?.slug || d.id).trim())
      .filter(Boolean);
  } catch (e) {
    console.error("getAllCountrySlugs failed:", e);
    return [];
  }
}

