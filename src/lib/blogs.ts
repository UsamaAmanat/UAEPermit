// src/lib/blogs.ts
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

export type BlogPost = {
  id: string;            // Firestore document id
  title: string;
  slug: string;
  excerpt: string;
  content: string;       // long text / HTML
  coverImageUrl: string;
  readTime: number;      // minutes
  published: boolean;
  tags: string[];
  createdAt?: Date | null;
  updatedAt?: Date | null;
  seoTitle?: string;
  seoDescription?: string;
};

const colRef = collection(db, "blogs");

// simple slug generator
export function makeSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

// PUBLIC – only published posts, newest first
export async function getPublishedBlogs(): Promise<BlogPost[]> {
  const q = query(colRef, where("published", "==", true), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => toBlogPost(d.id, d.data()));
}

// PUBLIC – by slug
export async function getBlogBySlug(slug: string): Promise<BlogPost | null> {
  const q = query(colRef, where("slug", "==", slug), where("published", "==", true));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return toBlogPost(d.id, d.data());
}

// ADMIN – all posts
export async function getAllBlogs(): Promise<BlogPost[]> {
  const q = query(colRef, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => toBlogPost(d.id, d.data()));
}

export async function createBlog(input: Omit<BlogPost, "id" | "createdAt" | "updatedAt">) {
  const payload = {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDoc(colRef, payload);
  return docRef.id;
}

export async function updateBlog(
  id: string,
  input: Partial<Omit<BlogPost, "id" | "createdAt">>
) {
  const docRef = doc(db, "blogs", id);
  await updateDoc(docRef, {
    ...input,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteBlogById(id: string) {
  const docRef = doc(db, "blogs", id);
  await deleteDoc(docRef);
}

// helper to normalize timestamps
function toBlogPost(id: string, data: any): BlogPost {
  return {
    id,
    title: data.title ?? "",
    slug: data.slug ?? "",
    excerpt: data.excerpt ?? "",
    content: data.content ?? "",
    coverImageUrl: data.coverImageUrl ?? "",
    readTime: data.readTime ?? 3,
    published: !!data.published,
    tags: data.tags ?? [],
    seoTitle: data.seoTitle ?? data.title ?? "",
    seoDescription: data.seoDescription ?? data.excerpt ?? "",
    createdAt: data.createdAt?.toDate?.() ?? null,
    updatedAt: data.updatedAt?.toDate?.() ?? null,
  };
}

export async function getBlogById(id: string): Promise<BlogPost | null> {
  const ref = doc(db, "blogs", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return toBlogPost(snap.id, snap.data());
}
export async function deleteBlog(id: string): Promise<void> {
  const ref = doc(db, "blogs", id);
  await deleteDoc(ref);
}