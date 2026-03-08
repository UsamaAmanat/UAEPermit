// src/app/sitemap.ts
import type { MetadataRoute } from "next";
import { getAllCountrySlugs } from "@/lib/countriesServer";
import { adminDB } from "@/lib/firebaseAdmin";

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://www.uaepermit.com";

async function getPublishedBlogSlugs(): Promise<string[]> {
  try {
    const snap = await adminDB
      .collection("blogs")
      .where("published", "==", true)
      .get();

    return snap.docs
      .map((d) => String(d.data()?.slug || "").trim())
      .filter(Boolean);
  } catch (e) {
    console.error("[sitemap] getPublishedBlogSlugs failed:", e);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let countrySlugs: string[] = [];
  let blogSlugs: string[] = [];

  try {
    [countrySlugs, blogSlugs] = await Promise.all([
      getAllCountrySlugs(),
      getPublishedBlogSlugs(),
    ]);
  } catch (e) {
    console.error("[sitemap] failed to load slugs:", e);
  }

  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, lastModified: now },
    { url: `${SITE}/apply`, lastModified: now },
    { url: `${SITE}/track`, lastModified: now },
    { url: `${SITE}/faq`, lastModified: now },
    { url: `${SITE}/blog`, lastModified: now },
    { url: `${SITE}/contact-us`, lastModified: now },

    // ✅ Countries MUST be /country/{slug}
    ...countrySlugs.map((slug) => ({
      url: `${SITE}/country/${slug}`,
      lastModified: now,
    })),

    // ✅ Blogs are at the root level /slug
    ...blogSlugs.map((slug) => ({
      url: `${SITE}/${slug}`,
      lastModified: now,
    })),
  ];

  return entries;
}
