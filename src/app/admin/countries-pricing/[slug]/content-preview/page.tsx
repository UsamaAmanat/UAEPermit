"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import type { CountryDocument } from "@/types/country";
import { getCountry } from "@/lib/countriesRepo";
import {  ExternalLink  } from "lucide-react";

export default function CountryContentPreviewPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [country, setCountry] = useState<CountryDocument | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const doc = await getCountry(slug);
      setCountry(doc || null);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1020]">
        <p className="text-slate-400 text-sm">Loading preview…</p>
      </div>
    );
  }

  const heading = country?.content?.heading?.trim() || `Dubai Visa for ${country?.name || slug}`;
  const summary = country?.content?.summary?.trim() || "";
  const html = country?.content?.html || "";

  return (
    <AdminLayout userEmail="preview" onLogout={() => {}}>
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="rounded-2xl bg-[#050818] border border-white/10 shadow-[0_18px_45px_rgba(0,0,0,0.55)] overflow-hidden">
          <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                Website Preview
              </p>
              <p className="text-xs text-slate-500 mt-1">
                This is how the content will render on the country page.
              </p>
            </div>
            <div 
                          className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-4 py-2 text-xs font-semibold text-slate-100 hover:bg-white/15 transition"

            >
<ExternalLink className="h-4 w-4" />
            <a
              href={`/country/${slug}`}
              target="_blank"
              rel="noreferrer"
              title="Open live country page"
            >
               Open country page
            </a>
            </div>
          </div>

          <div className="px-6 py-6">
            <h1 className="text-2xl font-semibold text-white">{heading}</h1>

            {summary ? (
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">{summary}</p>
            ) : null}

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
              {html?.trim() ? (
                <div
                  className="text-slate-200 leading-relaxed
                    [&_h1]:text-white [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:mt-6
                    [&_h2]:text-white [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-6
                    [&_h3]:text-white [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-5
                    [&_p]:mt-3
                    [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6
                    [&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:pl-6
                    [&_li]:mt-1
                    [&_a]:text-[#DEE05B] [&_a]:font-semibold"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              ) : (
                <p className="text-sm text-slate-400">No content yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
