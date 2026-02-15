import type { Metadata } from "next";
import Link from "next/link";
import "../blog-content.css";
import { getPublishedBlogBySlugServer } from "@/lib/blogsServer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  params: Promise<{ slug: string }>;
};

function stripInlineTextColorsServer(html: string): string {
  // server-safe light clean (no DOM)
  if (!html) return "";
  return html.replace(/color\s*:\s*[^;"]+;?/gi, "");
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  let post: any = null;
  try {
    post = await getPublishedBlogBySlugServer(slug);
  } catch (e) {
    console.error(
      "[Blog.generateMetadata] getPublishedBlogBySlugServer failed:",
      e,
    );
  }

  if (!post) {
    return {
      title: "Blog | UAE Permit",
      robots: { index: false, follow: false },
    };
  }

  const title = (post.seoTitle || post.title || "Blog").toString();
  const description = (post.seoDescription || post.excerpt || "").toString();

  return {
    title,
    description,
    alternates: { canonical: `/blog/${slug}` },

    // ✅ explicit (good SEO hygiene)
    robots: { index: true, follow: true },

    openGraph: {
      title,
      description,
      type: "article",
      images: post.coverImageUrl ? [{ url: post.coverImageUrl }] : undefined,
    },
    twitter: {
      card: post.coverImageUrl ? "summary_large_image" : "summary",
      title,
      description,
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    },
  };
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const post = await getPublishedBlogBySlugServer(slug);

  if (!post) {
    return (
      <main className="min-h-screen bg-[#f5f7ff] pt-28">
        <div className="max-w-3xl mx-auto px-4 pb-16">
          <p className="text-sm text-slate-600 mb-4">
            This article is no longer available.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center text-sm font-medium text-[#00a35a]"
          >
            ← Back to all blogs
          </Link>
        </div>
      </main>
    );
  }

  // date formatting (publishedAt if you have it, else createdAt)
  const meta: any = post as any;
  const rawDate =
    meta.publishedAt || meta.createdAt || meta.date || meta.created_at;

  let formattedDate: string | null = null;
  if (rawDate) {
    const d =
      rawDate instanceof Date
        ? rawDate
        : typeof rawDate === "string"
          ? new Date(rawDate)
          : null;

    if (d && !isNaN(d.getTime())) {
      formattedDate = d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
  }

  const cleanContent = stripInlineTextColorsServer(post.content || "");

  return (
    <main className="min-h-screen bg-[#f5f7ff] pt-[5rem] pb-20">
      {/* Hero band */}
      <section className="relative w-full bg-gradient-to-r from-[#0f172a] via-[#132146] to-[#1e293b]">
        <div className="relative max-w-5xl mx-auto px-3 lg:px-0 pt-4 pb-10 text-white">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>Dubai Visa Guide</span>
          </div>

          <h1 className="mt-4 text-3xl md:text-4xl lg:text-[2.6rem] font-semibold leading-tight text-white">
            {post.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-200/85">
            {formattedDate && <span>{formattedDate}</span>}
            {post.readTime ? (
              <>
                <span className="h-1 w-1 rounded-full bg-slate-400" />
                <span>{post.readTime} min read</span>
              </>
            ) : null}

            {post.tags?.length ? (
              <>
                <span className="hidden h-1 w-1 rounded-full bg-slate-400 md:inline-flex" />
                <div className="flex flex-wrap gap-1">
                  {post.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-white/10 px-2 py-0.5 text-[11px]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </section>

      {/* Floating article card */}
      <div className="mt-6 max-w-5xl mx-auto px-3 lg:px-0">
        <article className="rounded-[28px] bg-white shadow-[0_22px_70px_rgba(15,23,42,0.12)] overflow-hidden">
          {post.coverImageUrl ? (
            <div className="h-[260px] w-full overflow-hidden">
              <img
                src={post.coverImageUrl}
                alt={post.title}
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}

          <div className="px-5 pt-6 pb-10 md:px-10 md:pt-8">
            {post.excerpt ? (
              <p className="text-sm text-slate-500 mb-4 max-w-2xl">
                {post.excerpt}
              </p>
            ) : null}

            <div className="mb-8 h-px w-16 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400" />

            <div
              className="blog-post-content text-[15px]"
              dangerouslySetInnerHTML={{ __html: cleanContent }}
            />
          </div>
        </article>
      </div>
    </main>
  );
}
