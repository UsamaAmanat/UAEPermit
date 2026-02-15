// src/app/contact/page.tsx
import { Metadata } from "next";
import { Mail, MapPin, Phone, MessageCircle } from "lucide-react";
import ContactFormClient from "./ContactFormClient";

export const metadata = {
  title: "Contact UAE Permit – Get Help With Your Dubai Visa",
  description:
    "Need help or have questions? Contact UAE Permit — our support team is ready to assist you with your Dubai & UAE visa application. Fast, reliable, friendly service.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <main className="bg-white">
      <section className="pt-28 pb-24">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Heading */}
          <div className="text-center mb-10 md:mb-14">
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#3C4161]/70">
              Support
            </p>
            <h1 className="mt-3 text-[32px] leading-[40px] md:text-[40px] md:leading-[48px] font-extrabold text-[#3C4161]">
              Contact our Dubai Permit Experts
            </h1>
            <p className="mt-3 text-sm md:text-[15px] text-[#3C4161]/80 max-w-2xl mx-auto">
              Multilingual, friendly and fast. Reach us on WhatsApp, call, or
              send a quick message and we&apos;ll reply within{" "}
              <span className="font-semibold text-[#3C4161]">
                15–30 minutes
              </span>
              .
            </p>
          </div>

          {/* Layout: Form + Info card */}
          <div className="grid gap-10 md:grid-cols-[minmax(0,1.6fr),minmax(0,1fr)] items-start">
            {/* Left: Form */}
            <div className="rounded-3xl border border-[#E2E4F0] bg-[#F9FAFF]/90 px-6 py-10 sm:px-8 sm:py-10 shadow-[0_22px_55px_rgba(9,18,61,0.08)]">
              <div className="flex items-center justify-between gap-4 mb-7">
                <div>
                  <h2 className="text-lg md:text-xl font-semibold text-[#3C4161]">
                    Send us a quick message
                  </h2>
                  <p className="mt-1 text-xs md:text-sm text-[#3C4161]/70">
                    Share a few details and we&apos;ll get back with exact
                    permit options and pricing.
                  </p>
                </div>
                <span className="hidden sm:inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-[11px] font-medium text-[#3C4161] shadow-[0_6px_18px_rgba(15,23,42,0.08)]">
                  <span className="h-2 w-2 rounded-full bg-[#2ECC71]" />
                  Typically replies in under 30 min
                </span>
              </div>

              {/* ✅ our updated form with phone + nationality + captcha */}
              <ContactFormClient />
            </div>

            {/* Right: Contact info card */}
            <aside className="relative md:mt-2">
              <div className="rounded-3xl bg-[#0c4d3d] text-white px-7 py-8 shadow-[0_22px_55px_rgba(12,77,61,0.26)] overflow-hidden">
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#62E9C9]/15 blur-3xl" />

                <p className="text-xs uppercase tracking-[0.25em] text-[#62E9C9]">
                  WhatsApp & Call
                </p>

                <div className="mt-3 flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#62E9C9] text-[#0c4d3d] shadow-[0_10px_24px_rgba(0,0,0,0.25)]">
                    <MessageCircle className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-[12px] uppercase tracking-[0.18em] text-white/65">
                      24/7 Emergency Line
                    </p>
                    <p className="mt-1 text-2xl font-semibold">
                      +971 55 871 5533
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4 text-sm">
                  <InfoRow
                    icon={<MapPin className="h-4 w-4" />}
                    label="Office"
                    value="402 NGI Building, Deira, Dubai"
                  />
                  <InfoRow
                    icon={<Mail className="h-4 w-4" />}
                    label="Email"
                    value="support@uaepermit.com"
                  />
                </div>

                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                  <a
                    href="https://wa.me/971558715533"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(0,0,0,0.32)] hover:brightness-105 hover:-translate-y-0.5 active:translate-y-0 transition cursor-pointer"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Chat on WhatsApp
                  </a>
                  <a
                    href="tel:+971558715533"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/40 px-5 text-sm font-semibold text-white hover:bg-white/10 hover:-translate-y-0.5 active:translate-y-0 transition cursor-pointer"
                  >
                    <Phone className="h-4 w-4" />
                    Call now
                  </a>
                </div>

                <p className="mt-4 text-[11px] text-white/65">
                  All conversations are handled securely by our licensed travel
                  consultants.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-[#62E9C9]">
        {icon}
      </span>
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-white/60">
          {label}
        </p>
        <p className="mt-0.5 text-sm text-white">{value}</p>
      </div>
    </div>
  );
}
