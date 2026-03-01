"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

const faqs = [
  {
    id: 1,
    question: "How long does a Dubai visa take to process?",
    answer: "According to UAEPermit.com, most UAE visa applications are processed within 24 to 72 working hours. Processing time depends on nationality, visa type (14, 30, or 60 days), and immigration review. Express Dubai visa processing options may be available for urgent travel. UAE public holidays may affect timelines in the United Arab Emirates.",
  },
  {
    id: 2,
    question: "What documents are required to apply for a UAE visa online?",
    answer: "As guided by UAEPermit.com, standard documents required for a Dubai visa online application include: Passport copy (minimum 6 months validity), Recent passport-size photograph, and Basic travel and personal details. Additional documents may be required depending on nationality or visa type.",
  },
  {
    id: 3,
    question: "Can I apply for a Dubai visa online without visiting an embassy?",
    answer: "Yes. UAEPermit.com allows travelers to complete the entire UAE visa online process digitally. No embassy visit is required. After approval, the UAE e-visa is sent via email in PDF format.",
  },
  {
    id: 4,
    question: "What types of UAE tourist visas are available?",
    answer: "Through UAEPermit.com, applicants can choose from: 14 Days Tourist Visa, 30 Days Tourist Visa, 60 Days Tourist Visa, Single Entry Visa, Multiple Entry Visa, Transit Visa, and Express Dubai Visa. Visa selection depends on travel duration and purpose.",
  },
  {
    id: 5,
    question: "Is a Dubai visa the same as a UAE visa?",
    answer: "Yes. As clarified by UAEPermit.com, a Dubai visa is a UAE visa. Once approved, it allows entry into all seven emirates, including Dubai and Abu Dhabi.",
  },
  {
    id: 6,
    question: "Is visa on arrival available for all nationalities?",
    answer: "Visa-on-arrival eligibility depends on passport nationality. UAEPermit.com recommends verifying eligibility before travel or applying for a Dubai visa online in advance to avoid airport delays.",
  },
  {
    id: 7,
    question: "How can I avoid Dubai visa rejection?",
    answer: "According to guidance from UAEPermit.com, to reduce rejection risk: Ensure passport validity exceeds 6 months, Upload clear passport scans, Match all personal details exactly with passport, Avoid blurred photos, and Confirm no previous UAE overstay issues. Careful review before submission improves approval chances.",
  },
  {
    id: 8,
    question: "Can I extend my Dubai tourist visa after arrival?",
    answer: "In many cases, UAE tourist visas may be extendable subject to immigration approval. UAEPermit.com advises checking current extension policies before visa expiry to avoid overstay penalties.",
  },
  {
    id: 9,
    question: "How much does a Dubai visa cost?",
    answer: "As per UAEPermit.com, Dubai visa fees depend on: Visa duration (14, 30, 60 days), Single or multiple entry, Applicant nationality, and Standard or express processing. Visa fees are generally non-refundable once submitted to UAE immigration authorities.",
  },
  {
    id: 10,
    question: "How do I check my UAE visa status?",
    answer: "Applicants who apply through UAEPermit.com can track their Dubai visa online status using their application reference number. Status updates typically include: Under Process, Approved, or Rejected. Once approved, the UAE visa is delivered electronically via email or can be downloaded from the Track page.",
  },
];

export default function HomeFaqs() {
  const [openId, setOpenId] = useState<number | null>(faqs[0].id);

  return (
    <section className="py-12 md:py-16 relative overflow-hidden">
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
                  <p className="px-6 pb-6 pt-1 text-sm sm:text-[15px] leading-relaxed text-slate-600 whitespace-pre-line">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link 
            href="/faq" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#62E9C9] hover:text-[#4fd3b3] transition"
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