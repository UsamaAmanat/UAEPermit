// src/app/blogs/BlogsClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { BlogPost } from "@/lib/blogs";
import { getPublishedBlogs } from "@/lib/blogs";

type SortOption = "newest" | "oldest";

export default function BlogsClient() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const all = await getPublishedBlogs();
        if (!mounted) return;
        setBlogs(all || []);
      } catch (e) {
        console.error("Failed to load blogs", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    let list = [...blogs];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((b) => {
        const title = b.title?.toLowerCase() || "";
        const excerpt = b.excerpt?.toLowerCase() || "";
        return title.includes(q) || excerpt.includes(q);
      });
    }

    list.sort((a, b) => {
      const da = a.createdAt ? a.createdAt.getTime() : 0;
      const db = b.createdAt ? b.createdAt.getTime() : 0;
      return sort === "newest" ? db - da : da - db;
    });

    return list;
  }, [blogs, search, sort]);

  return (
    <main className="min-h-screen bg-[#f5f7ff] pt-[6rem] pb-20">
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between text-center md:text-left">
          <div>
            <p className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Blog Library
            </p>
            <h1 className="mt-3 text-3xl sm:text-4xl lg:text-[2.6rem] font-extrabold tracking-tight text-slate-900">
              Blogs
            </h1>
            <p className="mt-2 max-w-2xl text-sm sm:text-base text-slate-600">
              Scam safety, Trustpilot insights, and step-by-step guides to help
              you apply for your Dubai visa with full confidence.
            </p>
          </div>

          <div className="flex items-center justify-center md:justify-end">
            <div className="rounded-2xl bg-white/80 shadow-sm border border-slate-200 px-4 py-3 text-left">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                Total Articles
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {loading ? "…" : blogs.length || "0"}
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search */}
          <div className="relative w-full md:max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search blogs by title or topic…"
              className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#3C4161] focus:ring-2 focus:ring-[#3C4161]/20"
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="21" y2="21" />
              </svg>
            </span>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Sort By
            </span>

            <div className="inline-flex items-center rounded-full border border-slate-200 bg-white shadow-sm px-1 py-1">
              <button
                type="button"
                onClick={() => setSort("newest")}
                aria-pressed={sort === "newest"}
                className={[
                  "relative mx-[1px] flex items-center justify-center rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold transition",
                  sort === "newest"
                    ? "bg-[#62E9C9] text-[#0c4d3d] shadow-sm"
                    : "text-slate-600 hover:bg-slate-50",
                ].join(" ")}
              >
                Newest first
                {sort === "newest" && (
                  <span className="absolute inset-0 rounded-full ring-2 ring-[#62E9C9]/40" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setSort("oldest")}
                aria-pressed={sort === "oldest"}
                className={[
                  "relative mx-[1px] flex items-center justify-center rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold transition",
                  sort === "oldest"
                    ? "bg-[#62E9C9] text-[#0c4d3d] shadow-sm"
                    : "text-slate-600 hover:bg-slate-50",
                ].join(" ")}
              >
                Oldest first
                {sort === "oldest" && (
                  <span className="absolute inset-0 rounded-full ring-2 ring-[#62E9C9]/40" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* States */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-300 border-t-[#3C4161]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 py-16 text-center">
            <p className="text-sm font-semibold text-slate-700">
              No blogs found.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Try changing your search or check back later.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

/* ────────────── Card ────────────── */

function formatDate(date: Date | null | undefined) {
  if (!date) return null;
  if (isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function BlogCard({ post }: { post: BlogPost }) {
  const href = `/blog/${post.slug}`;
  const dateLabel = formatDate(post.createdAt);
  const minutes = post.readTime ?? 3;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.06)] transition hover:-translate-y-1.5 hover:shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
      {/* Cover */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        {post.coverImageUrl ? (
          <Image
            src={post.coverImageUrl}
            alt={post.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.03] group-hover:brightness-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-slate-400">
            No image
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/25 via-black/5 to-transparent opacity-80" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col px-6 pb-5 pt-4 sm:px-7 sm:pb-6 sm:pt-5">
        <div className="mb-3 flex items-center justify-between gap-3 text-xs text-slate-500">
          <div className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {dateLabel && <span>{dateLabel}</span>}
          </div>
          {minutes && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
              {minutes} min read
            </span>
          )}
        </div>

        <h2 className="line-clamp-2 text-lg sm:text-xl font-semibold tracking-tight text-slate-900">
          {post.title}
        </h2>

        <p className="mt-2 line-clamp-3 text-sm text-slate-600">
          {post.excerpt || "Tap to read the full guide."}
        </p>

        <div className="mt-5 flex items-center justify-between">
          <Link
            href={href}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition group-hover:bg-slate-800"
          >
            Read full article
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-white/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-[10px] w-[10px]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 17L17 7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </span>
          </Link>

          <Link
            href={href}
            className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400 transition group-hover:text-slate-700"
          >
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}
