"use client";

import { useState } from "react";
import { HiOutlineSearch } from "react-icons/hi";

type FaqItem = {
  id: number;
  question: string;
  answer: string;
  category: string;
};

const faqs: FaqItem[] = [
  {
    id: 1,
    category: "Application timing",
    question:
      "What is the optimal timing for submitting a permit application for the UAE?",
    answer:
      "The ideal moment is right now. If you have plans to visit the UAE and your itinerary is set, why delay? Your permit application will be processed within the next 12 hours.",
  },
  {
    id: 2,
    category: "Permit Through Airline",
    question:
      "Is it possible to obtain a UAE permit by applying through an airline?",
    answer:
      "Certain airlines do provide permit processing services, but it’s not their primary focus, and they may not have expertise in this area. Instead, their primary goal is to maximize ticket sales, and this remains true whether or not your permit application is successfully processed.",
  },
  {
    id: 3,
    category: "Authenticity of Permits",
    question: "Is the authenticity of permits from uaepermit.com guaranteed?",
    answer:
      "While we do offer verification links and e-receipts for each application, you can also verify your permit by visiting our website at “Web Address” and entering your permit number.",
  },
  {
    id: 4,
    category: "Processing Time",
    question: "What is the expected processing time for my application?",
    answer:
      "As stated on our website, your permit will be issued within 48 to 72 hours upon the completion of the application process, except during weekends and public holidays when it may take longer due to the unavailability of authorities to approve your permit. Nevertheless, we process the application on the following business day, adhering to the same timeline.",
  },
  {
    id: 5,
    category: "Types of Permits",
    question: "What types of permits are available through this service?",
    answer:
      "We offer two types of permits: “Single Entry,” allowing you to enter once and exit once, and “Multiple Entry,” permitting you to enter and exit as many times as specified on the permit.",
  },
  {
    id: 6,
    category: "Same Timing of Ticket Book and Application Process",
    question:
      "Is it advisable to book my ticket at the same time as the application process?",
    answer:
      "Certainly! Unless there are any legal issues associated with your profile, your permit will be delivered to you within the designated timeframe.",
  },
];

const categories = ["All", ...Array.from(new Set(faqs.map((f) => f.category)))];

const DARK_NAVY = "#0c4d3d";

export default function FaqsClient() {
  const [openId, setOpenId] = useState<number | null>(faqs[0]?.id ?? null);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const toggle = (id: number) => {
    setOpenId((current) => (current === id ? null : id));
  };

  const filteredFaqs = faqs.filter((item) => {
    const matchesCategory =
      activeCategory === "All" || item.category === activeCategory;

    const matchesSearch =
      !searchTerm.trim() ||
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <main className="bg-[#F5F6FB]">
      {/* HERO – shorter height now */}
      <section className="relative overflow-hidden pt-16 md:pt-20 pb-4 bg-white">
        {/* subtle background accent (also reduced height) */}
        <div className="pointer-events-none absolute inset-x-0 -bottom-24 h-40 bg-[radial-gradient(circle_at_top,_rgba(240,233,96,0.18),_transparent_60%)]" />

        <div className="relative max-w-4xl mx-auto px-4 md:px-6 lg:px-0 text-center ">
          <p className="inline-flex items-center  gap-2 px-4 py-1.5 rounded-full bg-[#62E9C9]/30 text-[11px] md:text-xs font-semibold uppercase tracking-[0.16em] text-[#62E9C9] shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#62E9C9]" />
            Support Center
          </p>

          <h1 className="mt-3 text-3xl md:text-[2.4rem] font-extrabold tracking-tight text-[#262B40]">
            FAQs
          </h1>

          <p className="mt-2 text-sm md:text-base text-[#4B5563] max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about your Dubai visa – from when to
            apply to how you’ll receive it. Start with the most common questions
            below.
          </p>
        </div>
      </section>

      {/* FAQ CONTENT – added top padding so it doesn’t stick to hero */}
      <section className="pt-6 md:pt-8 pb-16 md:pb-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-[230px_minmax(0,1fr)] gap-8 md:gap-10">
            {/* ===== LEFT: categories (desktop) ===== */}
            <aside className="hidden lg:block pt-1">
              <div className="sticky top-28 space-y-4">
                <div className="inline-flex items-center gap-2 text-[11px] font-medium text-[#6B7280] bg-white/70 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                  <span className="h-6 w-6 flex items-center justify-center rounded-full bg-[#62E9C9] text-[11px] font-bold text-[#0c4d3d]">
                    {faqs.length}
                  </span>
                  <span>Questions answered for you</span>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-[0_16px_40px_rgba(15,23,42,0.06)] border border-white/60 p-4 space-y-3">
                  <p className="text-xs font-semibold text-[#111827] uppercase tracking-[0.18em]">
                    Categories
                  </p>
                  <div className="space-y-1.5">
                    {categories.map((cat) => {
                      const isActive = activeCategory === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setActiveCategory(cat)}
                          className={`w-full text-left text-xs rounded-xl px-3 py-2.5 border transition-all ${
                            isActive
                              ? `bg-[#62E9C9] text-[#0c4d3d] border-[#62E9C9] shadow-sm`
                              : "bg-white/80 text-[#4B5563] border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </aside>

            {/* ===== RIGHT: FAQs ===== */}
            <div>
              {/* top bar: count (mobile) + search */}
              <div className="flex flex-col gap-3 mb-5 md:mb-7">
                {/* mobile count + categories chips */}
                <div className="flex flex-col gap-2 lg:hidden">
                  <div className="inline-flex items-center gap-2 text-xs md:text-sm text-[#6B7280]">
                    <span className="h-6 w-6 flex items-center justify-center rounded-full bg-[#62E9C9] text-[11px] font-bold text-[#0c4d3d]">
                      {faqs.length}
                    </span>
                    <span>Questions answered for you</span>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                    {categories.map((cat) => {
                      const isActive = activeCategory === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setActiveCategory(cat)}
                          className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs transition ${
                            isActive
                              ? `bg-[#62E9C9] text-[#0c4d3d] border-[#62E9C9]`
                              : "bg-white text-[#4B5563] border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* search bar */}
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                    <HiOutlineSearch className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search your question..."
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm py-2.5 pl-9 pr-3 text-sm text-[#111827] placeholder:text-slate-400 shadow-[0_12px_30px_rgba(15,23,42,0.04)] focus:outline-none focus:ring-2 focus:ring-[#62E9C9] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-4 md:space-y-5">
                {filteredFaqs.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 px-4 py-6 text-center text-sm text-slate-500">
                    No questions match your search yet. Try a different keyword
                    or category.
                  </div>
                )}

                {filteredFaqs.map((item) => {
                  const isOpen = openId === item.id;

                  return (
                    <article
                      key={item.id}
                      className={`rounded-3xl border backdrop-blur-sm transition-all duration-300 shadow-[0_18px_45px_rgba(15,23,42,0.06)] ${
                        isOpen
                          ? "bg-white border-[#62E9C9] shadow-[0_20px_60px_rgba(98,233,201,0.15)]"
                          : "bg-white/80 border-white/60 hover:border-[#62E9C9]/70"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggle(item.id)}
                        className="w-full flex items-center justify-between gap-4 px-5 md:px-7 py-4 md:py-5 text-left"
                        aria-expanded={isOpen}
                      >
                        <div className="flex items-start gap-3 md:gap-4 flex-1">
                          {/* tiny accent icon */}
                          <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#62E9C9] shadow-[0_0_0_4px_rgba(98,233,201,0.35)] shrink-0" />

                          <div>
                            <p className="text-[11px] uppercase tracking-[0.18em] text-[#9CA3AF] mb-1">
                              {item.category}
                            </p>
                            <h2 className="text-sm md:text-base font-semibold text-[#111827] leading-relaxed">
                              {item.question}
                            </h2>
                          </div>
                        </div>

                        {/* chevron icon button – now using emergency navy */}
                        <span
                          className={`flex h-10 w-10 items-center justify-center rounded-full border text-slate-100 text-sm shrink-0 transition-all duration-300 ${
                            isOpen
                              ? `bg-[#62E9C9] border-[#62E9C9] rotate-180 shadow-[0_10px_25px_rgba(98,233,201,0.35)]`
                              : "bg-white/80 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 shadow-[0_6px_16px_rgba(15,23,42,0.08)]"
                          }`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.8}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 9l7 7 7-7"
                            />
                          </svg>
                        </span>
                      </button>

                      {/* answer */}
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-out ${
                          isOpen ? "max-h-[260px] md:max-h-[220px]" : "max-h-0"
                        }`}
                      >
                        <div className="px-5 md:px-7 pb-5 md:pb-6">
                          <div className="mt-1 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 md:px-5 py-4 text-sm md:text-[15px] text-[#4B5563] leading-relaxed">
                            {item.answer}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* bottom callout – also uses emergency navy */}
              <div className="mt-10 md:mt-12">
                <div
                  className={`rounded-2xl border border-dashed border-[#62E9C9]/60 bg-[#0c4d3d] text-white px-5 md:px-7 py-5 md:py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4`}
                >
                  <div>
                    <p className="text-xs md:text-sm uppercase tracking-[0.18em] text-[#62E9C9] font-semibold">
                      Still have questions?
                    </p>
                    <p className="mt-2 text-sm md:text-[15px] text-slate-100 max-w-xl">
                      Our experts are available to review your case and guide
                      you on the best option for your trip.
                    </p>
                  </div>
                  <div className="flex gap-3 text-nowrap items-center">
                    <a
                      href="/contact"
                      className="inline-flex items-center justify-center rounded-full bg-[#62E9C9] px-5 py-2.5 text-sm font-semibold text-[#0c4d3d] shadow-sm hover:shadow-md hover:opacity-90 transition"
                    >
                      Contact Support
                    </a>
                    <a
                      href="https://wa.me/xxxxxxxxxxx"
                      className="inline-flex items-center justify-center rounded-full border border-slate-200/70 px-5 py-2.5 text-sm font-medium text-slate-100 hover:bg-slate-100/10 transition"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Chat on WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
