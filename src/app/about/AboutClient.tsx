"use client";

import Link from "next/link";
import {
  MessageCircle,
  ShieldCheck,
  Clock3,
  FileText,
  Upload,
  CreditCard,
  CheckCircle2,
  Users,
  Globe2,
} from "lucide-react";

export default function AboutClient() {
  return (
    <main className="min-h-screen bg-[#f5f7ff] pt-[5.5rem] pb-20">
      <section className="max-w-6xl mx-auto px-4 md:px-6 lg:px-0 pt-6 md:pt-8">
        {/* Breadcrumb + small meta */}
        <div className="flex items-center justify-between mb-4 text-xs sm:text-sm text-slate-500">
          <div>
            <span className="text-slate-400">Home</span>
            <span className="mx-1">/</span>
            <span className="font-semibold text-slate-700">About</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-500">
            <Users className="w-3.5 h-3.5 text-[#62E9C9]" />
            Trusted by 100,000+ travellers
          </div>
        </div>

        {/* HERO CARD */}
        <div className="rounded-[32px] bg-gradient-to-r from-[#3C4161] via-[#3C4161] to-[#0c4d3d] px-6 py-8 md:px-10 md:py-10 text-white shadow-[0_24px_60px_rgba(60,65,97,0.35)]">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#62E9C9]" />
              About UAE Permit
            </p>

            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-[2.6rem] font-extrabold tracking-tight leading-tight">
              Your trusted partner for Dubai visas &amp; seamless travel.
            </h1>

            <p className="mt-4 text-sm sm:text-base text-slate-100/90 max-w-xl">
              UAE Permit is a fast, secure, and hassle-free platform for Dubai
              and UAE visa services. We specialise in helping tourists,
              families, professionals, and business travellers complete their
              visa process with confidence.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href="https://wa.me/971558715533"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-white px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full text-white">
                  <MessageCircle className="w-3.5 h-3.5" />
                </span>
                Talk to us on WhatsApp
              </a>

              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/15 transition"
              >
                How it works
              </a>
            </div>

            <p className="mt-4 flex items-center gap-2 text-[11px] text-slate-100/80">
              <Users className="w-3.5 h-3.5 text-[#62E9C9]" />
              Trusted by 100,000+ travellers for Dubai &amp; UAE visa approvals.
            </p>
          </div>
        </div>
      </section>

      {/* WHO WE ARE */}
      <section className="mt-10">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-0">
          <div className="grid gap-6 lg:grid-cols-[1.6fr,1fr]">
            <Card className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Who We Are
              </h2>
              <p className="text-sm sm:text-base text-slate-700">
                Welcome to <span className="font-semibold">UAE Permit</span>,
                your trusted platform for fast, secure, and hassle-free Dubai
                Visa and UAE Visa services. We specialise in simplifying the
                visa process for tourists, families, professionals, and business
                travellers— delivering seamless digital solutions backed by
                industry expertise.
              </p>
              <p className="text-sm sm:text-base text-slate-700">
                With years of experience processing UAE visa applications, our
                team has assisted{" "}
                <span className="font-semibold">100,000+ travellers</span> with
                smooth, reliable, and timely visa approvals. We follow UAE
                regulations, uphold strict service standards, and ensure full
                transparency at every stage of the application journey.
              </p>
              <p className="text-sm sm:text-base text-slate-700">
                <span className="font-semibold">UAE Permit</span> is proudly
                operated by{" "}
                <span className="font-semibold">
                  Budget Travel &amp; Tourism LLC
                </span>
                , a reputable and legally compliant entity in the UAE’s travel
                industry. We operate with the highest commitment to
                professionalism, customer satisfaction, and regulatory
                compliance.
              </p>
            </Card>

            <Card className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">
                At a glance
              </h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#62E9C9] mt-[3px]" />
                  <span>100K+ visa applications assisted across UAE.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#62E9C9] mt-[3px]" />
                  <span>
                    Operated by Budget Travel &amp; Tourism LLC, a DTCM-licensed
                    travel agency.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Globe2 className="w-4 h-4 text-[#62E9C9] mt-[3px]" />
                  <span>
                    Supporting tourists, families, professionals, and business
                    visitors worldwide.
                  </span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* OUR MISSION + SMALL HIGHLIGHTS */}
      <section className="mt-10">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-0">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Our Mission
              </h3>
              <p className="text-sm text-slate-700">
                Our mission is to make UAE visa processing effortless,
                transparent, and ultra-fast. We remove stress from the visa
                journey with simplified forms, clear instructions, and dedicated
                support—so visitors can focus on planning their travel, not
                paperwork.
              </p>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Clear Timelines
              </h3>
              <p className="text-sm text-slate-700">
                Straightforward processing windows and realistic expectations
                from the very beginning—no vague promises or confusing
                timelines.
              </p>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Secure &amp; Human
              </h3>
              <p className="text-sm text-slate-700">
                Your data is handled using secure tools, while real visa
                specialists are available on WhatsApp and email whenever you
                need help.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* WHAT WE OFFER */}
      <section className="mt-14">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-0">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">
            What we offer
          </h2>
          <p className="text-sm sm:text-base text-slate-700 mb-7 max-w-2xl">
            Everything you need for a smooth Dubai or UAE visa—combined into one
            guided, online experience.
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            <FeatureCard
              icon={<Clock3 className="w-5 h-5" />}
              title="Fast approvals"
              text="Streamlined processing for Dubai and UAE visas with minimal waiting time; many applications are processed within 24 hours, depending on type."
            />
            <FeatureCard
              icon={<CreditCard className="w-5 h-5" />}
              title="Secure online checkout"
              text="Safe payments via Visa, Mastercard, and other trusted gateways with SSL-secured processing."
            />
            <FeatureCard
              icon={<FileText className="w-5 h-5" />}
              title="All UAE visa types"
              text="Tourist visas, visit visas, transit visas, visa extensions, and more—supported under one platform."
            />
            <FeatureCard
              icon={<Upload className="w-5 h-5" />}
              title="24/7 application tracking"
              text="Real-time updates through our easy-to-use online tracking system, available anytime."
            />
            <FeatureCard
              icon={<Users className="w-5 h-5" />}
              title="Expert support team"
              text="Friendly specialists ready to guide you from submission to approval, answering questions along the way."
            />
            <FeatureCard
              icon={<ShieldCheck className="w-5 h-5" />}
              title="Transparent pricing"
              text="No hidden fees—clear, upfront pricing and plan options you can trust."
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="mt-16">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-0">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">
            How UAE Permit works
          </h2>
          <p className="text-sm sm:text-base text-slate-700 mb-7 max-w-2xl">
            A guided 5-step flow that keeps your application organised—from
            terms to tracking.
          </p>

          <div className="grid gap-5 md:grid-cols-5">
            <StepCard
              step="1"
              title="Accept Terms"
              text="Start with a quick read and accept our service terms before you begin."
            />
            <StepCard
              step="2"
              title="Upload Documents"
              text="Upload your passport, photo, and required documents securely online."
            />
            <StepCard
              step="3"
              title="Fill Details"
              text="Enter your contact details, travel dates, and visit purpose in simple forms."
            />
            <StepCard
              step="4"
              title="Choose Pricing"
              text="Select visa type, duration, and optional express processing add-ons."
            />
            <StepCard
              step="5"
              title="Pay & Track"
              text="Complete secure payment and track your application status anytime."
            />
          </div>

          <p className="mt-3 text-[11px] text-slate-500">
            Note: Visa approvals are at the discretion of UAE immigration
            authorities. We facilitate applications and updates; we are not a
            government entity.
          </p>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="mt-16">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-0">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">
            Why choose UAE Permit
          </h2>
          <p className="text-sm sm:text-base text-slate-700 mb-7 max-w-2xl">
            A customer-first service built on trust, compliance, speed, and
            comfort.
          </p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <FeaturePill
              title="Trusted by 100K+ travellers"
              text="Reliable service built on accuracy, transparency, and user comfort."
            />
            <FeaturePill
              title="Licensed & compliant"
              text="Fully aligned with UAE immigration requirements and tourism regulations."
            />
            <FeaturePill
              title="Exceptional speed & convenience"
              text="100% online processing. No embassy visits and no long paper forms."
            />
            <FeaturePill
              title="Customer-first approach"
              text="We prioritise clarity, comfort, and support—every step of the way."
            />
          </div>
        </div>
      </section>

      {/* JOURNEY + LICENSE */}
      {/* JOURNEY CTA – styled like FAQ Contact Support */}
      <section className="mt-16">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-0">
          <div className="rounded-[28px] bg-[#3C4161] text-white px-6 py-6 md:px-10 md:py-8 shadow-[0_20px_55px_rgba(60,65,97,0.35)]">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              {/* Text */}
              <div className="max-w-2xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#62E9C9]">
                  Your journey starts here
                </p>
                <p className="mt-3 text-sm sm:text-base text-slate-100">
                  Whether you're visiting Dubai for tourism, business, family,
                  or exploration, UAE Permit ensures a smooth, fast, and
                  stress-free visa experience. Your trust drives us to deliver
                  excellence—every day, with every application.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-wrap gap-3 md:justify-end">
                {/* Primary – yellow, like Contact Support */}
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-full bg-[#62E9C9] px-5 py-2.5 text-sm font-semibold text-[#3C4161] hover:opacity-90 transition"
                >
                  Contact support
                </Link>

                {/* Secondary – outline, like Chat on WhatsApp */}
                <a
                  href="https://wa.me/971558715533"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full border border-white px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition"
                >
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ─── reusable components ─── */

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={
        "rounded-[28px] bg-white border border-slate-200 shadow-[0_18px_45px_rgba(15,23,42,0.06)] px-6 py-5 sm:px-7 sm:py-6 " +
        className
      }
    >
      {children}
    </div>
  );
}

type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  text: string;
};

function FeatureCard({ icon, title, text }: FeatureCardProps) {
  return (
    <Card>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 p-[.5rem] flex h-9 w-9 items-center justify-center rounded-full bg-[#62E9C9]/10 text-[#62E9C9] border border-[#62E9C9]/20">
          {icon}
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-1">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-700">{text}</p>
        </div>
      </div>
    </Card>
  );
}

type StepCardProps = {
  step: string;
  title: string;
  text: string;
};

function StepCard({ step, title, text }: StepCardProps) {
  return (
    <div className="rounded-[26px] border border-slate-200 bg-white px-4 py-4 sm:px-5 sm:py-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
      <div className="flex items-center gap-2 mb-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#62E9C9] text-[#3C4161] text-sm font-bold shadow-[0_10px_26px_rgba(98,233,201,0.3)]">
          {step}
        </div>
        <h3 className="text-sm sm:text-base font-semibold text-slate-900">
          {title}
        </h3>
      </div>
      <p className="text-xs sm:text-sm text-slate-700">{text}</p>
    </div>
  );
}

type FeaturePillProps = {
  title: string;
  text: string;
};

function FeaturePill({ title, text }: FeaturePillProps) {
  return (
    <div className="rounded-[26px] border border-slate-200 bg-white px-5 py-4 shadow-[0_14px_32px_rgba(15,23,42,0.06)]">
      <h3 className="text-sm font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-700">{text}</p>
    </div>
  );
}
