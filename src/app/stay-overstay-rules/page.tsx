import Link from "next/link";
import {
  BadgeCheck,
  Clock3,
  FileWarning,
  ShieldAlert,
  BriefcaseBusiness,
  Baby,
  PlaneTakeoff,
  Building2,
  Landmark,
  ChevronRight,
  AlertTriangle,
  Banknote,
  CalendarX2,
  PhoneCall,
  MessageCircle,
} from "lucide-react";
import TocSpy from "./_components/TocSpy";

export const metadata = {
  title: "Short-Stay Visa & Overstay Rules | Dubai & UAE Visa Guide",
  description:
    "Learn the rules for short-stay Dubai & UAE visas, overstay fines, absconding penalties, extension advice, and how to stay compliant. Read more.",
  alternates: {
    canonical: "/stay-overstay-rules",
  },
};

const TOC = [
  { id: "visa-validity", label: "Visa Validity & Stay", icon: "Clock3" },
  {
    id: "overstay-policy",
    label: "Overstay & Absconding Policy",
    icon: "FileWarning",
  },
  { id: "restrictions", label: "Restrictions & Rules", icon: "ShieldAlert" },
  {
    id: "travel-advisory",
    label: "Travel, Extension & Exit Advisory",
    icon: "PlaneTakeoff",
  },
  { id: "authorities", label: "Authorities & Regulation", icon: "Landmark" },
] as const;

function SectionCard({
  id,
  title,
  subtitle,
  Icon,
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  Icon: any;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={[
        "rounded-3xl border border-[#E6ECFF] bg-white",
        "shadow-[0_18px_60px_rgba(20,30,80,0.08)]",
        "transition will-change-transform",
        "hover:-translate-y-[2px] hover:shadow-[0_26px_80px_rgba(20,30,80,0.12)]",
      ].join(" ")}
    >
      <div className="p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl bg-[#F3F6FF] ring-1 ring-[#E6ECFF] flex items-center justify-center">
            <Icon className="h-6 w-6 text-[#1F2A64]" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B1220] tracking-tight">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-1 text-sm sm:text-base text-[#5B668C] leading-relaxed">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}

function Bullet({
  Icon,
  title,
  text,
  tone = "soft",
}: {
  Icon: any;
  title: string;
  text: string;
  tone?: "soft" | "warn";
}) {
  const wrap =
    tone === "warn"
      ? "bg-[#FFF7ED] ring-[#FED7AA]"
      : "bg-[#F7FAFF] ring-[#E6ECFF]";
  const iconWrap =
    tone === "warn" ? "bg-white/90 ring-[#FED7AA]" : "bg-white ring-black/5";
  const iconColor = tone === "warn" ? "text-[#B45309]" : "text-[#1F2A64]";
  const titleColor = tone === "warn" ? "text-[#7C2D12]" : "text-[#0B1220]";
  const textColor = tone === "warn" ? "text-[#9A3412]" : "text-[#5B668C]";

  return (
    <li
      className={[
        "rounded-2xl ring-1 p-4 sm:p-5 transition will-change-transform",
        wrap,
        "hover:-translate-y-[1px] hover:shadow-[0_14px_40px_rgba(20,30,80,0.10)]",
      ].join(" ")}
    >
      <div className="flex gap-3">
        <div
          className={`mt-0.5 h-10 w-10 rounded-2xl ring-1 flex items-center justify-center ${iconWrap}`}
        >
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div className="flex-1">
          <div className={`font-semibold ${titleColor}`}>{title}</div>
          <div className={`mt-1 text-sm leading-relaxed ${textColor}`}>
            {text}
          </div>
        </div>
      </div>
    </li>
  );
}

function KeyWarningsStrip() {
  return (
    <div className="mt-6">
      <div className="rounded-[24px] border border-[#E6ECFF] bg-white shadow-[0_18px_60px_rgba(20,30,80,0.08)] overflow-hidden">
        <div className="px-5 sm:px-7 py-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-11 w-11 rounded-2xl bg-[#0B1220] flex items-center justify-center shadow-[0_16px_40px_rgba(11,18,32,0.22)]">
                <AlertTriangle className="h-5 w-5 text-[#62E9C9]" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-[#0B1220] tracking-tight">
                  Key warnings (read before you travel)
                </div>
                <div className="mt-1 text-sm text-[#5B668C] leading-relaxed">
                  Avoid absconding risk and unnecessary penalties by extending
                  early.
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <a
                href="#overstay-policy"
                className="inline-flex items-center gap-2 rounded-full
bg-white px-4 py-2 text-sm font-semibold text-[#0B1220]
ring-1 ring-[#E6ECFF]
shadow-[0_6px_18px_rgba(20,30,80,0.08)]
hover:bg-[#F7FAFF] hover:ring-[#D6DEFF]
transition"
              >
                <FileWarning className="h-4 w-4 text-[#1F2A64]" />
                Overstay policy
                <ChevronRight className="h-4 w-4 opacity-60" />
              </a>
              <a
                href="#travel-advisory"
                className="inline-flex items-center gap-2 rounded-full
bg-[#1F2A64] px-4 py-2 text-sm font-semibold text-white
shadow-[0_14px_36px_rgba(31,42,100,0.28)]
hover:bg-[#263170] hover:-translate-y-[1px]
transition"
              >
                <PlaneTakeoff className="h-4 w-4" />
                Extension advice
                <ChevronRight className="h-4 w-4 opacity-70" />
              </a>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl bg-[#FFF7ED] ring-1 ring-[#FED7AA] p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-2xl bg-white/90 ring-1 ring-[#FED7AA] flex items-center justify-center">
                  <Clock3 className="h-5 w-5 text-[#B45309]" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#7C2D12]">
                    24-hour window
                  </div>
                  <div className="mt-1 text-xs text-[#9A3412] leading-relaxed">
                    Not extended within 24 hours after expiry may move status to
                    absconding.
                  </div>
                </div>
              </div>
            </div>

            <div
              className="rounded-2xl border border-[#EDE68A] bg-gradient-to-br from-[#FFFDE6] via-white to-[#F7FAFF]
  p-4 shadow-[0_18px_55px_rgba(222,224,91,0.20)] transition hover:-translate-y-[1px]"
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-2xl bg-white ring-1 ring-[#EDE68A] flex items-center justify-center">
                  <Banknote className="h-5 w-5 text-[#B45309]" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#0B1220]">
                    AED 5,000 penalty
                  </div>
                  <div className="mt-1 text-xs text-[#5B668C] leading-relaxed">
                    Absconding status removal can include AED 5,000 + daily
                    fines.
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-[#F7FAFF] ring-1 ring-[#E6ECFF] p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-2xl bg-white ring-1 ring-black/5 flex items-center justify-center">
                  <CalendarX2 className="h-5 w-5 text-[#1F2A64]" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#0B1220]">
                    Weekend/holiday delays
                  </div>
                  <div className="mt-1 text-xs text-[#5B668C] leading-relaxed">
                    Extensions may not process on weekends/public holidays —
                    apply 1 week early.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* subtle premium divider */}
        <div className="h-[1px] bg-gradient-to-r from-transparent via-[#E6ECFF] to-transparent" />
      </div>
    </div>
  );
}

export default function StayOverstayRulesPage() {
  return (
    <main className="min-h-screen bg-[#F5F7FF] pt-[5rem] pb-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb row */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-6">
          <div className="text-sm text-[#6B74A6]">
            <Link href="/" className="hover:text-[#1F2A64] transition-colors">
              Home
            </Link>
            <span className="mx-2 text-[#A4ADD3]">/</span>
            <span className="font-semibold text-[#0B1220]">
              Stay & Overstay Rules
            </span>
          </div>

          <div className="text-sm text-[#6B74A6]">
            Last updated:{" "}
            <span className="font-semibold text-[#0B1220]">
              05 December 2025
            </span>
          </div>
        </div>

        {/* Hero */}
        <section className="relative overflow-hidden rounded-[28px] border border-[#E6ECFF] shadow-[0_28px_90px_rgba(18,30,80,0.18)]">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B1220] via-[#1F2A64] to-[#0c4d3d]" />
          <div className="absolute inset-0 opacity-[0.25] bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.22),transparent_40%)]" />

          <div className="relative p-8 sm:p-10 lg:p-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold tracking-[0.18em] text-white/90 ring-1 ring-white/15">
              <BadgeCheck className="h-4 w-4" />
              VISIT VISA COMPLIANCE
            </div>

            <h1 className="mt-6 text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Stay & Overstay Rules
            </h1>

            <p className="mt-4 max-w-2xl text-white/85 text-sm sm:text-base leading-relaxed">
              Clear guidance on visa validity, stay duration, extension timing,
              overstay fines, and absconding status — aligned with Dubai
              immigration record handling and national regulation.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#overstay-policy"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#0B1220] shadow-[0_18px_45px_rgba(0,0,0,0.25)] hover:translate-y-[-1px] transition"
              >
                <FileWarning className="h-4 w-4" />
                Overstay policy details
                <ChevronRight className="h-4 w-4 opacity-70" />
              </a>

              <a
                href="#travel-advisory"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/20 hover:bg-white/15 transition"
              >
                <PlaneTakeoff className="h-4 w-4" />
                Extension & exit advisory
              </a>
            </div>
          </div>
        </section>

        {/* ✅ Key warnings strip under hero */}
        <KeyWarningsStrip />

        {/* Content grid */}
        <section className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main */}
          <div className="lg:col-span-8 space-y-6">
            <SectionCard
              id="visa-validity"
              title="Visa Validity & Stay"
              subtitle="How short-stay tourist/visit visas work once you enter the UAE."
              Icon={Clock3}
            >
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Bullet
                  Icon={Clock3}
                  title="30 or 60 days"
                  text="Short-stay tourist/visit visas are commonly issued for 30 or 60 days, depending on your selected option."
                />
                <Bullet
                  Icon={BadgeCheck}
                  title="Stay starts on entry"
                  text="Your stay duration starts from the UAE entry date (not the issuance date)."
                />
                <Bullet
                  Icon={BadgeCheck}
                  title="Use before expiry"
                  text="Your visa must be used (entry) before the visa expiry date shown in the system."
                />
                <Bullet
                  Icon={PlaneTakeoff}
                  title="Single or multiple entry"
                  text="Depending on the plan, your visa may be single-entry or multiple-entry."
                />
              </ul>
            </SectionCard>

            <SectionCard
              id="overstay-policy"
              title="Overstay & Absconding Policy"
              subtitle="What happens when a visa expires and an extension isn’t processed in time."
              Icon={FileWarning}
            >
              <ul className="space-y-4">
                <Bullet
                  Icon={AlertTriangle}
                  title="Critical 24-hour window"
                  text="If your visa is not extended within 24 hours after expiry, your status may change to absconding."
                  tone="warn"
                />
                <Bullet
                  Icon={Clock3}
                  title="Apply early"
                  text="We recommend applying for extension at least 1 week before expiry to avoid weekend/holiday delays."
                />
                <Bullet
                  Icon={Banknote}
                  title="Daily overstay fines"
                  text="Overstay fines apply daily if the visa is not extended before its expiry date."
                  tone="warn"
                />

                <div
                  className="rounded-2xl border border-[#FED7AA] bg-gradient-to-br from-[#FFF7ED] via-white to-[#FFFBEB]
  p-5 sm:p-6 shadow-[0_18px_50px_rgba(180,83,9,0.12)] transition hover:-translate-y-[1px]"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-white/10 ring-1 ring-white/15 flex items-center justify-center">
                      <FileWarning className="h-5 w-5 text-[#B45309]" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-[#7C2D12]">
                        If status changes to absconding, penalties can include
                      </div>
                      <ul className="mt-3 space-y-2 text-sm text-[#9A3412]">
                        <li>• AED 5,000 fine for absconding status removal</li>
                        <li>
                          • Daily overstay fines continue to add on top of AED
                          5,000
                        </li>
                        <li>
                          • Total fines can increase each day until resolved
                        </li>
                        <li>
                          • Extensions are not processed on weekends or public
                          holidays
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </ul>
            </SectionCard>

            <SectionCard
              id="restrictions"
              title="Restrictions & Rules"
              subtitle="Important limitations you must follow while on a short-stay visa."
              Icon={ShieldAlert}
            >
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Bullet
                  Icon={BriefcaseBusiness}
                  title="No work or business"
                  text="Short-stay visas do not permit employment or business activities in the UAE."
                  tone="warn"
                />
                <Bullet
                  Icon={Baby}
                  title="Children need separate visa"
                  text="Children must have a separate passport and visa — not on a parent passport."
                />
              </ul>
            </SectionCard>

            <SectionCard
              id="travel-advisory"
              title="Travel, Extension & Exit Advisory"
              subtitle="Best practices to avoid fines, delays, and last-minute complications."
              Icon={PlaneTakeoff}
            >
              <div className="rounded-2xl bg-[#F7FAFF] ring-1 ring-[#E6ECFF] p-5 sm:p-6 transition hover:-translate-y-[1px] hover:shadow-[0_14px_40px_rgba(20,30,80,0.10)]">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-white ring-1 ring-black/5 flex items-center justify-center">
                    <PlaneTakeoff className="h-5 w-5 text-[#1F2A64]" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-[#0B1220]">
                      Recommended actions before expiry
                    </div>
                    <ul className="mt-3 space-y-2 text-sm text-[#5B668C]">
                      <li>
                        • Extend your visa before expiry to avoid absconding
                        status and penalties.
                      </li>
                      <li>
                        • Apply for extension at least 1 week before visa
                        expiry.
                      </li>
                      <li>
                        • If not extending, exit the UAE before the visa expiry
                        date.
                      </li>
                      <li>
                        • Avoid delays around public holidays (e.g., Eid) due to
                        slower processing.
                      </li>
                      <li>
                        • Extension processing may pause during weekends, public
                        holidays, and government office closures.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-white ring-1 ring-[#E6ECFF] p-5 sm:p-6 transition hover:-translate-y-[1px] hover:shadow-[0_14px_40px_rgba(20,30,80,0.10)]">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-[#FFF7ED] ring-1 ring-[#FED7AA] flex items-center justify-center">
                    <ShieldAlert className="h-5 w-5 text-[#B45309]" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-[#7C2D12]">
                      Final decisions at airport remain with immigration
                      officers
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-[#9A3412]">
                      Final exit or re-entry decisions at UAE airports are
                      handled by immigration officers and remain subject to
                      officer approval at the point of travel and your valid
                      visa status in the system.
                    </p>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              id="authorities"
              title="Authorities & Regulation"
              subtitle="Who manages visa records and status updates in Dubai and at national level."
              Icon={Landmark}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  className="rounded-2xl border border-[#E6ECFF] bg-gradient-to-br from-white to-[#F7FAFF]
  p-5 sm:p-6 shadow-[0_18px_60px_rgba(20,30,80,0.08)] transition hover:-translate-y-[1px] hover:shadow-[0_26px_80px_rgba(20,30,80,0.12)]"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-[#FFFDE6] ring-1 ring-[#EDE68A] flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-[#1F2A64]" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-[#0B1220]">
                        Dubai visa records managed by
                      </div>
                      <p className="mt-2 text-sm text-[#5B668C] leading-relaxed">
                        General Directorate of Residency and Foreigners Affairs
                        — Dubai (GDRFA Dubai)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-white ring-1 ring-[#E6ECFF] p-5 sm:p-6 shadow-[0_18px_60px_rgba(20,30,80,0.08)] transition hover:-translate-y-[1px]">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-[#F3F6FF] ring-1 ring-[#E6ECFF] flex items-center justify-center">
                      <Landmark className="h-5 w-5 text-[#1F2A64]" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-[#0B1220]">
                        National regulations overseen by
                      </div>
                      <p className="mt-2 text-sm text-[#5B668C] leading-relaxed">
                        Federal Authority for Identity, Citizenship, Customs and
                        Port Security
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-[6.5rem] space-y-4">
              <div className="rounded-3xl border border-[#E6ECFF] bg-white shadow-[0_18px_60px_rgba(20,30,80,0.08)] p-5 sm:p-6">
                <div className="text-sm font-semibold text-[#0B1220]">
                  On this page
                </div>

                {/* ✅ Scroll-spy here */}
                <TocSpy items={TOC} />
              </div>

              <div className="rounded-3xl border border-[#E6ECFF] bg-gradient-to-br from-white to-[#F7FAFF] shadow-[0_18px_60px_rgba(20,30,80,0.08)] p-5 sm:p-6 transition hover:-translate-y-[1px]">
                <div className="text-sm font-semibold text-[#0B1220]">
                  Need urgent help?
                </div>
                <p className="mt-2 text-sm text-[#5B668C] leading-relaxed">
                  If your visa is close to expiry, contact support early so you
                  can avoid avoidable fines and processing delays.
                </p>
                <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* WhatsApp */}
                  <a
                    href="https://wa.me/971558715533"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full
    bg-[#1F2A64] px-4 py-2.5 text-sm font-semibold text-white
    shadow-[0_14px_36px_rgba(31,42,100,0.28)]
    hover:bg-[#263170] hover:-translate-y-[1px]
    transition"
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15">
                      <MessageCircle className="h-4 w-4 text-[#25D366]" />
                    </span>
                    WhatsApp
                    <ChevronRight className="h-4 w-4 opacity-70" />
                  </a>

                  {/* Call */}
                  <a
                    href="tel:+971558715533"
                    className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full
    bg-white px-4 py-2.5 text-sm font-semibold text-[#0B1220]
    ring-1 ring-[#E6ECFF] hover:bg-[#F5F7FF] transition text-nowrap"
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#F3F6FF] ring-1 ring-[#E6ECFF]">
                      <PhoneCall className="h-4 w-4 text-[#1F2A64]" />
                    </span>
                    Call now
                  </a>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
