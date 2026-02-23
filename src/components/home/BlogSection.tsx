"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getAllBlogs, BlogPost } from "@/lib/blogs";

export default function BlogSection() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const all = await getAllBlogs();
        const published = all.filter((p) => p.published);
        setPosts(published.slice(0, 3)); // show latest up to 3
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (!loading && posts.length === 0) return null;

  const getGridClasses = (count: number) => {
    if (count === 1) return "grid gap-6 md:grid-cols-1 max-w-sm mx-auto";
    if (count === 2) return "grid gap-6 md:grid-cols-2 max-w-4xl mx-auto";
    return "grid gap-6 md:grid-cols-3";
  };

  return (
    <section className="py-12 md:py-16 relative overflow-hidden bg-white">
      {/* Background Dots Pattern */}
      <div 
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[80%] bg-[url('/images/home/BgDotspng.png')] bg-contain bg-center bg-no-repeat opacity-25 pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-[1200px] mx-auto px-4 relative z-10">
        <h2 className="text-center text-3xl md:text-5xl font-medium text-slate-900 mb-12 md:mb-16 tracking-tight">
          Blogs
        </h2>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl overflow-hidden flex flex-col animate-pulse shadow-[0_15px_40px_rgba(0,0,0,0.06)]"
              >
                <div className="h-56 w-full bg-slate-200" />
                <div className="p-7 space-y-4">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-100 rounded w-full" />
                    <div className="h-3 bg-slate-100 rounded w-full" />
                    <div className="h-3 bg-slate-100 rounded w-5/6" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={getGridClasses(posts.length)}>
            {posts.map((post) => {
              const anyPost = post as any;
              const imageUrl =
                anyPost.cardImageUrl ||
                anyPost.coverImageUrl ||
                anyPost.imageUrl ||
                "/images/blog/blog-1.png";

              const excerpt =
                anyPost.excerpt || anyPost.summary || anyPost.intro || "Learn more about the UAE visa requirements, travel tips, and documentation.";

              return (
                <article
                  key={post.id}
                  className="bg-white rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col border border-white/40"
                >
                  <div className="relative h-60 w-full overflow-hidden shrink-0">
                    <Image
                      src={imageUrl}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>

                  <div className="p-7 flex flex-col flex-1">
                    <h3 className="text-lg font-bold text-slate-900 mb-3 leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-sm font-medium text-slate-600 mb-6 line-clamp-4 leading-relaxed tracking-wide">
                      {excerpt}
                    </p>
                    <div className="mt-auto flex justify-end">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-2 text-[#62E9C9] font-medium text-sm hover:opacity-80 transition"
                      >
                        Read More
                        <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#62E9C9]" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
