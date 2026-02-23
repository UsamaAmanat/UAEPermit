"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { isAdminEmail } from "@/lib/authConstants";
import AdminLayout from "@/components/admin/AdminLayout";
import { BlogPost, getAllBlogs, deleteBlog } from "@/lib/blogs";
import { toast } from "sonner";

export default function BlogListPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setChecking(false);
        router.replace("/login");
        return;
      }
      if (!isAdminEmail(currentUser.email)) {
        setUser(null);
        setChecking(false);
        router.replace("/login");
        return;
      }
      setUser(currentUser);
      setChecking(false);
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const data = await getAllBlogs();
      setPosts(data);
      setLoading(false);
    })();
  }, [user]);

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

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600 text-sm">Checking access…</p>
      </div>
    );
  }
  if (!user) return null;

  return (
    <AdminLayout userEmail={user.email} onLogout={() => signOut(auth)}>
      <div className="p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Blog</h1>
            <p className="text-sm text-slate-600">
              Create SEO-friendly content for Dubai visa, documents and travel.
            </p>
          </div>

          <Link
            href="/admin/blog/create"
            className="inline-flex shrink-0 w-fit items-center rounded-full bg-emerald-600 px-4 py-2 text-white font-medium text-sm hover:bg-emerald-700 shadow"
          >
            + New post
          </Link>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-sm text-slate-600">Loading posts…</div>
          ) : posts.length === 0 ? (
            <div className="p-8 text-sm text-slate-600">
              No posts yet. Click{" "}
              <span className="font-medium text-emerald-600">New post</span> to
              create your first article.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-4 text-left text-slate-700 font-medium">Title</th>
                    <th className="p-4 text-left text-slate-700 font-medium">Status</th>
                    <th className="p-4 text-left text-slate-700 font-medium whitespace-nowrap">Read time</th>
                    <th className="p-4 text-right text-slate-700 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {posts.map((post) => {
                    const isConfirming = confirmId === post.id;
                    const isDeleting = deletingId === post.id;

                    return (
                      <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-slate-900 font-medium min-w-[200px]">{post.title}</td>
                        <td className="p-4 whitespace-nowrap">
                          {post.published ? (
                            <span className="inline-flex items-center rounded-full bg-emerald-100 border border-emerald-200 px-3 py-1 text-[11px] font-medium text-emerald-800">
                              Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-[11px] font-medium text-slate-700">
                              Draft
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-slate-600 whitespace-nowrap">{post.readTime || 3} min</td>
                        <td className="p-4 whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/blog/${post.id}`}
                              className="px-3 py-1 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs inline-flex items-center"
                            >
                              Edit
                            </Link>

                            {post.published && (
                              <Link
                                href={`/blog/${post.slug}`}
                                target="_blank"
                                className="px-3 py-1 rounded-full border border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-xs inline-flex items-center"
                              >
                                View
                              </Link>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeleteClick(post)}
                              disabled={isDeleting}
                              className={`px-3 py-1 rounded-full border text-xs transition inline-flex items-center
                                ${isConfirming ? "border-red-400 bg-red-50 text-red-700" : "border-red-200 text-red-600 hover:bg-red-50"}
                                disabled:opacity-60 disabled:cursor-not-allowed
                              `}
                            >
                              {isDeleting ? "Deleting…" : isConfirming ? "Confirm?" : "Delete"}
                            </button>

                            {isConfirming && !isDeleting && (
                              <button
                                type="button"
                                onClick={resetConfirm}
                                className="px-3 py-1 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50 text-[11px] inline-flex items-center"
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
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
