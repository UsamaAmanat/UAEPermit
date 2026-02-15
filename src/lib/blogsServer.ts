import "server-only";
import { adminDB } from "@/lib/firebaseAdmin";
import type { BlogPost } from "@/lib/blogs";

// convert admin Timestamp etc. to JSON-safe
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

function toBlogPost(id: string, data: any): BlogPost {
  // NOTE: in server we keep dates as strings (ISO), client will format
  return {
    id,
    title: data?.title ?? "",
    slug: data?.slug ?? "",
    excerpt: data?.excerpt ?? "",
    content: data?.content ?? "",
    coverImageUrl: data?.coverImageUrl ?? "",
    readTime: Number(data?.readTime ?? 3),
    published: !!data?.published,
    tags: Array.isArray(data?.tags) ? data.tags : [],
    seoTitle: data?.seoTitle ?? data?.title ?? "",
    seoDescription: data?.seoDescription ?? data?.excerpt ?? "",
    createdAt: data?.createdAt?.toDate?.() ?? null, // not used much in server page
    updatedAt: data?.updatedAt?.toDate?.() ?? null,
  };
}

export async function getPublishedBlogBySlugServer(
  slug: string
): Promise<BlogPost | null> {
  try {
    const snap = await adminDB
      .collection("blogs")
      .where("slug", "==", slug)
      .where("published", "==", true)
      .limit(1)
      .get();

    if (snap.empty) return null;

    const d = snap.docs[0];
    // keep it plain-safe if you pass it to client later
    const post = toBlogPost(d.id, d.data());
    return toPlain(post) as BlogPost;
  } catch (e) {
    console.error("getPublishedBlogBySlugServer failed:", e);
    return null;
  }
}
