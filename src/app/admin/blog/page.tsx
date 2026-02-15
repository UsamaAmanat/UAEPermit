"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { BlogPost, getAllBlogs, deleteBlog } from "@/lib/blogs";
import { toast } from "sonner";

export default function BlogListPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const data = await getAllBlogs();
      setPosts(data);
      setLoading(false);
    })();
  }, []);

  const handleDeleteClick = async (post: BlogPost) => {
    // 1st click → just ask for confirmation inline
    if (confirmId !== post.id) {
      setConfirmId(post.id);
      return;
    }

    // 2nd click → actually delete
    try {
      setDeletingId(post.id);
      await deleteBlog(post.id);

      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      toast.success("Blog post deleted");
    } catch (err) {
      console.error(err);
      toast.error("Could not delete blog post. Please try again.");
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  const resetConfirm = () => setConfirmId(null);

  return (
    <AdminLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Blog</h1>
            <p className="text-sm text-slate-400">
              Create SEO-friendly content for Dubai visa, documents and travel.
            </p>
          </div>

          <Link
            href="/admin/blog/create"
            className="rounded-full bg-emerald-500 px-4 py-2 text-slate-900 font-medium text-sm hover:bg-emerald-400 shadow"
          >
            + New post
          </Link>
        </div>

        {/* Table */}
        <div className="rounded-xl bg-slate-900/70 border border-slate-700 shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-sm text-slate-400">Loading posts…</div>
          ) : posts.length === 0 ? (
            <div className="p-8 text-sm text-slate-400">
              No posts yet. Click{" "}
              <span className="font-medium text-emerald-400">New post</span> to
              create your first article.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-900/90 border-b border-slate-700">
                <tr>
                  <th className="p-4 text-left text-slate-300 font-medium">
                    Title
                  </th>
                  <th className="p-4 text-left text-slate-300 font-medium">
                    Status
                  </th>
                  <th className="p-4 text-left text-slate-300 font-medium">
                    Read time
                  </th>
                  <th className="p-4 text-right text-slate-300 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {posts.map((post) => {
                  const isConfirming = confirmId === post.id;
                  const isDeleting = deletingId === post.id;

                  return (
                    <tr
                      key={post.id}
                      className="hover:bg-slate-900/60 transition-colors"
                    >
                      <td className="p-4 text-white">{post.title}</td>
                      <td className="p-4">
                        {post.published ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/40 px-3 py-1 text-[11px] font-medium text-emerald-300">
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-slate-700/40 border border-slate-500 px-3 py-1 text-[11px] font-medium text-slate-200">
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-slate-300">
                        {post.readTime || 3} min
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/blog/${post.id}`}
                            className="px-3 py-1 rounded-full border border-slate-600 text-slate-200 hover:border-slate-400 text-xs"
                          >
                            Edit
                          </Link>

                          {post.published && (
                            <Link
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              className="px-3 py-1 rounded-full border border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/10 text-xs"
                            >
                              View
                            </Link>
                          )}

                          {/* Delete / Confirm UI */}
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(post)}
                            disabled={isDeleting}
                            className={`px-3 py-1 rounded-full border text-xs transition
                              ${
                                isConfirming
                                  ? "border-red-400 bg-red-500/10 text-red-200"
                                  : "border-red-500/60 text-red-300 hover:bg-red-500/10"
                              }
                              disabled:opacity-60 disabled:cursor-not-allowed
                            `}
                          >
                            {isDeleting
                              ? "Deleting…"
                              : isConfirming
                              ? "Confirm?"
                              : "Delete"}
                          </button>

                          {isConfirming && !isDeleting && (
                            <button
                              type="button"
                              onClick={resetConfirm}
                              className="px-3 py-1 rounded-full border border-slate-600 text-slate-300 hover:bg-slate-800/70 text-[11px]"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
