"use client";

import { useEffect, useState, useRef  } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { getBlogById, updateBlog, makeSlug, BlogPost } from "@/lib/blogs";
import BlogEditor from "@/components/admin/BlogEditor";
import { toast } from "sonner";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebaseClient";


async function uploadBlogImage(file: File): Promise<string> {
  const path = `blog-covers/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

export default function EditBlogPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // local form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [readTime, setReadTime] = useState("3");
  const [published, setPublished] = useState(true);

  // 👉 new: for cover upload
  const coverFileInputRef = useRef<HTMLInputElement | null>(null);

  const triggerCoverUpload = () => {
    coverFileInputRef.current?.click();
  };

  const handleCoverFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadBlogImage(file);
      setCoverImageUrl(url); // updates both preview and value to be saved
      toast.success("Cover image uploaded");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload cover image");
    } finally {
      e.target.value = "";
    }
  };

  useEffect(() => {
    (async () => {
      if (!id) return;
      const data = await getBlogById(id);
      if (!data) {
        toast.error("Post not found");
        router.push("/admin/blog");
        return;
      }
      setPost(data);
      setTitle(data.title);
      setSlug(data.slug);
      setExcerpt(data.excerpt);
      setContent(data.content || "");
      setCoverImageUrl(data.coverImageUrl || ""); // existing cover shows here
      setReadTime(String(data.readTime || 3));
      setPublished(data.published);
      setLoading(false);
    })();
  }, [id, router]);

  const handleSave = async () => {
    if (!post) return;
    if (!title.trim()) return toast.error("Title is required");

    setSaving(true);
    try {
      const finalSlug = (slug || makeSlug(title)).trim();

      await updateBlog(post.id, {
        title: title.trim(),
        slug: finalSlug,
        excerpt: excerpt.trim(),
        content,
        coverImageUrl: coverImageUrl.trim(),
        readTime: Number(readTime || "3"),
        published,
      });

      toast.success("Post updated");
      router.push("/admin/blog");
    } catch (e) {
      console.error(e);
      toast.error("Could not update post");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8 text-sm text-slate-400">Loading post…</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="px-8 py-8 max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">
              Edit blog post
            </h1>
            <p className="text-sm text-slate-400">
              /blog/{slug || post?.slug}
            </p>
          </div>
        </div>

        {/* same form as create */}
        <div className="space-y-5">
          <div>
            <label className="text-sm text-slate-300">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => !slug && setSlug(makeSlug(title))}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white outline-none focus:border-emerald-400"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-[2fr,1fr]">
            <div>
              <label className="text-sm text-slate-300">Slug (URL)</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="text-sm text-slate-300">Read time</label>
              <input
                type="number"
                min={1}
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                className="mt-1 w-24 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
              />
              <div className="mt-3 flex items-center gap-2">
                <input
                  id="published-edit"
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                />
                <label
                  htmlFor="published-edit"
                  className="text-xs text-slate-300"
                >
                  Published
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-300">Short summary</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white outline-none focus:border-emerald-400"
              rows={3}
            />
          </div>

          {/* Cover image */}
          <div className="space-y-2">
            <label className="text-sm text-slate-300">Cover image</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="Paste image link or use Upload"
                className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={triggerCoverUpload}
                className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-emerald-400"
              >
                Upload
              </button>
            </div>

            <input
              ref={coverFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverFileChange}
            />

            {coverImageUrl && (
              <div className="mt-2 rounded-lg border border-slate-700 bg-slate-900/60 p-2">
                <div className="mb-1 text-[11px] text-slate-400">
                  Cover preview
                </div>
                <img
                  src={coverImageUrl}
                  alt="Cover preview"
                  className="h-40 w-full rounded-md object-cover"
                />
              </div>
            )}
          </div>

        </div>

        <div className="space-y-2">
          <label className="text-sm text-slate-300">Main content</label>
          <BlogEditor  value={content} onChange={setContent} />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => router.push("/admin/blog")}
            className="px-4 py-2 rounded-full border border-slate-600 text-sm text-slate-200 hover:border-slate-400"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="px-6 py-2 rounded-full bg-emerald-500 text-sm font-medium text-slate-900 hover:bg-emerald-400 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}



