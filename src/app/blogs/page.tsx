// src/app/blogs/page.tsx
import type { Metadata } from "next";
import BlogsClient from "./BlogsClient";

export const metadata: Metadata = {
  title: "UAE Dubai Visa Online Guide & Tips – UAE Permit Blog",
  description:
    "Explore expert blog posts to help you Apply UAE Dubai Visa Online. Get step-by-step tips, travel insights, and visa news from UAE Permit.",
  alternates: {
    canonical: "https://uaepermit.com/blogs",
  },
};

export default function BlogsPage() {
  return <BlogsClient />;
}
