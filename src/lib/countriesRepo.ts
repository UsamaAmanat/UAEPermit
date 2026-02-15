// src/lib/countriesRepo.ts
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import type { CountryDocument } from "@/types/country";

const COLLECTION = "countries";

function normalizeCountry(data: CountryDocument): CountryDocument {
  const metaTitle = (data.seo?.metaTitle || "").trim();
  const metaDescription = (data.seo?.metaDescription || "").trim();
  const ogImage = (data.seo?.ogImage || "").trim();

  const heading = (data.content?.heading || "").trim();
  const summary = (data.content?.summary || "").trim();
  const html = (data.content?.html || ""); // keep as-is (don’t trim HTML)

  return {
    ...data,
    seo: { metaTitle, metaDescription, ogImage },
    content: { heading, summary, html },
  };
}



export async function listCountries(): Promise<CountryDocument[]> {
  const q = query(collection(db, COLLECTION), orderBy("name"));
  const snap = await getDocs(q);

  return snap.docs.map((d) => d.data() as CountryDocument);
}

export async function getCountry(slug: string): Promise<CountryDocument | null> {
  const ref = doc(db, COLLECTION, slug);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  const data = snap.data() as CountryDocument;

return {
  ...data,
  seo: {
    metaTitle: (data.seo?.metaTitle || "").trim(),
    metaDescription: (data.seo?.metaDescription || "").trim(),
    ogImage: (data.seo?.ogImage || "").trim(),
  },
  content: {
    heading: (data.content?.heading || "").trim(),
    summary: (data.content?.summary || "").trim(),
    html: (data.content?.html || ""),
  },
};


}

export async function upsertCountry(data: CountryDocument) {
  const ref = doc(db, COLLECTION, data.slug);

  const clean = normalizeCountry(data);

  await setDoc(
    ref,
    {
      ...clean,
      updatedAt: serverTimestamp(),
      // only set createdAt when doc is created (merge keeps existing createdAt)
      createdAt: clean.createdAt ?? serverTimestamp(),
    },
    { merge: true }
  );
}

export async function deleteCountries(slugs: string[]) {
  if (!slugs.length) return;

  const batch = writeBatch(db);

  slugs.forEach((slug) => {
    batch.delete(doc(db, COLLECTION, slug));
  });

  await batch.commit();
}
