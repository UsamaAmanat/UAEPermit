// src/app/country/[slug]/loading.tsx

export default function LoadingCountryPage() {
  return (
    <section className="bg-[#F5F6FB]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        {/* Heading / breadcrumb skeleton */}
        <div className="mb-8 space-y-3">
          <div className="h-4 w-40 rounded-full bg-slate-200 animate-pulse" />
          <div className="h-8 w-72 rounded-full bg-slate-200 animate-pulse" />
          <div className="h-4 w-64 rounded-full bg-slate-200 animate-pulse" />
        </div>

        {/* Tabs skeleton */}
        <div className="mb-8 flex flex-wrap gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-9 w-32 rounded-full bg-slate-200 animate-pulse"
            />
          ))}
        </div>

        {/* Visa cards skeleton */}
        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              {/* Card header */}
              <div className="mb-4 space-y-2">
                <div className="h-4 w-32 rounded-full bg-slate-200 animate-pulse" />
                <div className="h-3 w-24 rounded-full bg-slate-200 animate-pulse" />
              </div>

              {/* Price row */}
              <div className="mb-4 flex items-baseline gap-2">
                <div className="h-7 w-24 rounded-full bg-slate-200 animate-pulse" />
                <div className="h-4 w-16 rounded-full bg-slate-200 animate-pulse" />
              </div>

              {/* Features */}
              <div className="space-y-2 mb-5">
                <div className="h-3 w-full rounded-full bg-slate-200 animate-pulse" />
                <div className="h-3 w-5/6 rounded-full bg-slate-200 animate-pulse" />
                <div className="h-3 w-3/4 rounded-full bg-slate-200 animate-pulse" />
              </div>

              {/* Button skeleton */}
              <div className="h-10 w-full rounded-xl bg-slate-200 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
