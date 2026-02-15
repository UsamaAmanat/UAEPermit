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

        // optional: sort by date if you have it
        // published.sort((a: any, b: any) =>
        //   (b.publishedAt || "").localeCompare(a.publishedAt || "")
        // );

        setPosts(published.slice(0, 3)); // show latest up to 3
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (!loading && posts.length === 0) return null;

  // dynamic grid classes to keep layout premium
  const getGridClasses = (count: number) => {
    if (count === 1) {
      // single card, nicely centered and not too wide
      return "grid gap-8 md:grid-cols-1 max-w-md mx-auto";
    }
    if (count === 2) {
      // two cards, centered in a tighter width
      return "grid gap-8 md:grid-cols-2 max-w-4xl mx-auto";
    }
    // 3 or more – normal layout
    return "grid gap-8 md:grid-cols-3";
  };

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-center text-3xl md:text-4xl font-extrabold text-[#3C4161] mb-10">
          Latest UAE Visa News & Travel Guides
        </h2>

        {loading ? (
          <div className="grid gap-8 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col animate-pulse"
              >
                <div className="h-52 w-full bg-gray-200" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-5/6" />
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
                anyPost.excerpt || anyPost.summary || anyPost.intro || "";

              const readTimeLabel = `${post.readTime || 3} min read`;

              return (
                <article
                  key={post.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
                >
                  <div className="relative h-52 w-full">
                    <Image
                      src={imageUrl}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-lg font-semibold text-[#3C4161] mb-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {excerpt}
                    </p>
                    <div className="mt-auto flex items-center justify-between text-xs text-gray-500">
                      <span>{readTimeLabel}</span>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="text-[#4CAF50] text-sm font-medium hover:underline"
                      >
                        Read more
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
