// src/app/admin/blog/create/page.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { isAdminEmail } from "@/lib/authConstants";
import AdminLayout from "@/components/admin/AdminLayout";
import { createBlog, makeSlug } from "@/lib/blogs";
import BlogEditor from "@/components/admin/BlogEditor";
import { toast } from "sonner";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebaseClient";

export default function CreateBlogPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

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

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [readTime, setReadTime] = useState("3");
  const [published, setPublished] = useState(true);
  const [category, setCategory] = useState("");
  const [schemaInput, setSchemaInput] = useState("");
  const [saving, setSaving] = useState(false);
  // state
const [coverImageUrl, setCoverImageUrl] = useState("");
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
    const url = await uploadCoverImage(file);
    setCoverImageUrl(url);
    toast.success("Cover image uploaded");
  } catch (err) {
    console.error(err);
    toast.error("Failed to upload cover image");
  } finally {
    e.target.value = "";
  }
};

async function uploadCoverImage(file: File): Promise<string> {
  const path = `blog-covers/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}


  const handleSave = async () => {
    if (!title.trim()) return toast.error("Title is required");

    setSaving(true);
    try {
      const finalSlug = (slug || makeSlug(title)).trim();

      let parsedSchema: any = null;
      if (schemaInput.trim()) {
        try {
          parsedSchema = JSON.parse(schemaInput.trim());
        } catch (err) {
          toast.error("Invalid JSON in Schema field");
          setSaving(false);
          return;
        }
      }

      await createBlog({
        title: title.trim(),
        slug: finalSlug,
        excerpt: excerpt.trim(),
        content, // HTML from quill
        coverImageUrl: coverImageUrl.trim(),
        readTime: Number(readTime || "3"),
        published,
        tags: [],
        category: category.trim() || undefined,
        seoTitle: title.trim(),
        seoDescription: excerpt.trim(),
        ...(parsedSchema ? { schema: parsedSchema } : {}),
      } as any);

      toast.success("Blog post created");
      router.push("/admin/blog");
    } catch (e) {
      console.error(e);
      toast.error("Could not create blog post");
    } finally {
      setSaving(false);
    }
  };

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
      <div className="px-8 py-8 max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">New blog post</h1>
            <p className="text-sm text-slate-600">
              Write high-trust articles that answer travellers’ real questions.
            </p>
          </div>
        </div>

        {/* Basic fields */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => !slug && setSlug(makeSlug(title))}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-[2fr,1fr]">
            <div>
              <label className="block text-sm font-medium text-slate-700">Slug (URL)</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
              <p className="mt-1 text-[11px] text-slate-600">
                Final URL: <span className="text-slate-600">/{slug || makeSlug(title) || "your-slug"}</span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Read time (minutes)</label>
              <input
                type="number"
                min={1}
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                className="mt-1 w-24 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
              <div className="mt-3 flex items-center gap-2">
                <input id="published" type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
                <label htmlFor="published" className="text-xs text-slate-600">Published (visible on website)</label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Category (optional)</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Visa Tips, Documents"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Short summary</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-500/30"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Cover image</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="Paste image link or use Upload"
                className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
              <button type="button" onClick={triggerCoverUpload} className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700">
                Upload
              </button>
            </div>
            <input ref={coverFileInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverFileChange} />
            {coverImageUrl && (
              <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
                <div className="mb-1 text-[11px] text-slate-600">Cover preview</div>
                <img src={coverImageUrl} alt="Cover preview" className="h-40 w-full rounded-md object-cover" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Schema (JSON LD)</label>
            <p className="text-[11px] text-slate-500 mb-1">Optional structured data for SEO</p>
            <textarea
              value={schemaInput}
              onChange={(e) => setSchemaInput(e.target.value)}
              placeholder='{ "@context": "https://schema.org", "@type": "BlogPosting", ... }'
              className="w-full font-mono rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-500/30"
              rows={6}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Main content</label>
          <BlogEditor value={content} onChange={setContent} />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button type="button" onClick={() => router.push("/admin/blog")} className="px-4 py-2 rounded-full border border-slate-200 text-sm text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
          <button type="button" disabled={saving} onClick={handleSave} className="px-6 py-2 rounded-full bg-emerald-600 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60">
            {saving ? "Saving…" : "Publish post"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
