// src/components/home/WhyChooseUs.tsx
"use client";
import { ShieldCheck, Lightbulb, Headphones } from "lucide-react";


import type { ComponentType } from "react";




type IconType = ComponentType<{ className?: string }>;

function IconBadge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="
        inline-grid place-items-center
        w-12 h-12 rounded-full
        shrink-0
        bg-[#DEE05B]
        ring-8 ring-[#DEE05B]/30
      "
      aria-hidden
    >
      {children}
    </span>
  );
}

export default function WhyChooseUs() {
  const items: Array<{
    title: string;
    text: string;
    Icon: IconType;
  }> = [
    {
      title: "Reliability",
      text:
        "Trust us for accurate, up-to-date Dubai and UAE Visa information. We deliver dependable service to ensure a smooth visa process.",
      Icon: ShieldCheck,
    },
    {
      title: "Expertise",
      text:
        "Our skilled team has deep knowledge of UAE visa rules and procedures, ensuring your application is handled with precision.",
      Icon: Lightbulb,
    },
    {
      title: "Customer-Centric",
      text:
        "We put your needs first with prompt support and personalized service to make your experience seamless and stress-free.",
      Icon: Headphones,
    },
  ];

  return (
    <section className="relative bg-white">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-18">
        <h2 className="text-center text-[32px] md:text-[40px] font-extrabold text-[#3C4161] tracking-tight">
          Why Choose Us
        </h2>

        <div className="mt-10 grid gap-6 sm:gap-8 md:grid-cols-3">
          {items.map(({ title, text, Icon }) => (
            <article
              key={title}
              className="
                group relative rounded-2xl bg-white ring-1 ring-black/5
                shadow-sm hover:shadow-xl transition-all duration-300
                p-6 sm:p-7 md:p-8
              "
            >
              {/* top accent bar */}
              <span className="absolute inset-x-0 -top-px h-1 rounded-t-2xl bg-gradient-to-r from-[#DEE05B] via-[#F0E960] to-[#DEE05B]" />

              <div className="flex items-start gap-4">
                {/* single circular badge */}
                <IconBadge>
                  <Icon className="w-6 h-6 text-[#3C4161]" />
                </IconBadge>

                <div>
                  <h3 className="text-lg font-bold text-[#3C4161]">{title}</h3>
                  <p className="mt-2 text-[15px] leading-7 text-[#3C4161]/80">{text}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}


/* ---------- tiny inline icons (no extra lib) ---------- */
function ShieldCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3l7 3v5c0 4.97-3.23 9.14-7 10-3.77-.86-7-5.03-7-10V6l7-3z"
      />
      <path
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12l2 2 4-4"
      />
    </svg>
  );
}

function LightBulbIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12c.6.55 1 1.26 1 2v1h6v-1c0-.74.4-1.45 1-2A7 7 0 0012 2z"
      />
    </svg>
  );
}

function HeadsetIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 12a9 9 0 1118 0v6a2 2 0 01-2 2h-3v-6h3M6 20H5a2 2 0 01-2-2v-6"
      />
    </svg>
  );
}
