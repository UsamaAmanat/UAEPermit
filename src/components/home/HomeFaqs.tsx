"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

const faqs = [
  {
    id: 1,
    question: "What is the optimal timing for submitting a permit application for the UAE?",
    answer: "The ideal moment is right now. If you have plans to visit the UAE and your itinerary is set, why delay? Your permit application will be processed within the next 12 hours.",
  },
  {
    id: 2,
    question: "Is it possible to obtain a UAE permit by applying through an airline?",
    answer: "Certain airlines do provide permit processing services, but it’s not their primary focus, and they may not have expertise in this area. Instead, their primary goal is to maximize ticket sales, and this remains true whether or not your permit application is successfully processed.",
  },
  {
    id: 3,
    question: "Is the authenticity of permits from uaepermit.com guaranteed?",
    answer: "While we do offer verification links and e-receipts for each application, you can also verify your permit by visiting our website and entering your permit number.",
  },
  {
    id: 4,
    question: "What is the expected processing time for my application?",
    answer: "Your permit will be issued within 48 to 72 hours upon the completion of the application process, except during weekends and public holidays when it may take longer due to the unavailability of authorities. Nevertheless, we process the application on the following business day.",
  },
  {
    id: 5,
    question: "What types of permits are available through this service?",
    answer: "We offer two types of permits: “Single Entry,” allowing you to enter once and exit once, and “Multiple Entry,” permitting you to enter and exit as many times as specified on the permit.",
  },
];

export default function HomeFaqs() {
  const [openId, setOpenId] = useState<number | null>(faqs[0].id);

  return (
    <section className="py-12 md:py-16  relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-10 md:mb-14">
          <p className="inline-flex items-center gap-2 rounded-full bg-emerald-100/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-800 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Clear Answers
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-[2.6rem] font-extrabold tracking-tight text-slate-900 leading-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto md:text-lg">
            Everything you need to know about processing your UAE Visa. Can&apos;t find your answer? Our friendly support team is here to help.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div 
                key={faq.id} 
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen 
                    ? "bg-white border-emerald-500/30 shadow-[0_8px_30px_rgba(16,185,129,0.06)]" 
                    : "bg-white/60 border-slate-200 hover:border-emerald-500/20 hover:bg-white"
                }`}
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="flex w-full items-start justify-between gap-4 px-6 py-5 text-left focus:outline-none"
                >
                  <span className={`font-semibold text-[15px] sm:text-base leading-snug transition-colors ${isOpen ? "text-emerald-900" : "text-slate-800"}`}>
                    {faq.question}
                  </span>
                  <span 
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all ${
                      isOpen 
                        ? "bg-emerald-50 border-emerald-200 text-emerald-600 rotate-180" 
                        : "bg-slate-50 border-slate-200 text-slate-400"
                    }`}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </span>
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="px-6 pb-6 pt-1 text-sm sm:text-[15px] leading-relaxed text-slate-600">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link 
            href="/faqs" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition"
          >
            View all FAQs
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
