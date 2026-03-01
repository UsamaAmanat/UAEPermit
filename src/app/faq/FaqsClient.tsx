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
  // 1️⃣ About UAEPermit.com
  {
    id: 1,
    category: "About UAEPermit.com",
    question: "What is UAEPermit.com?",
    answer: "UAEPermit.com is a professional UAE visa assistance platform that helps international travellers apply for a Dubai tourist visa online through a fully digital and secure application process."
  },
  {
    id: 2,
    category: "About UAEPermit.com",
    question: "Is UAEPermit.com part of any company?",
    answer: "Yes. UAEPermit.com is a part of Budget Travel & Tourism LLC, a Dubai-based destination management company specializing in tours, excursions, travel services, and UAE visa assistance. Being part of Budget Travel & Tourism LLC ensures structured processing, professional support, and reliable customer service for all UAE visa applications."
  },
  {
    id: 3,
    category: "About UAEPermit.com",
    question: "Is UAEPermit.com an official government website?",
    answer: "UAEPermit.com is not a government website. It operates as a professional visa facilitation service that processes applications through authorized UAE immigration channels."
  },
  {
    id: 4,
    category: "About UAEPermit.com",
    question: "Why apply through UAEPermit.com?",
    answer: "• Simple online visa application form\n• Fast UAE visa processing\n• Express Dubai visa options available\n• Secure online payment gateway\n• Approved UAE e-visa delivered by email (PDF format)\n• Dedicated customer support\n• Backed by Budget Travel & Tourism LLC (Dubai-based company)"
  },

  // 2️⃣ Dubai Visa & UAE Visa Information
  {
    id: 5,
    category: "Dubai Visa Information",
    question: "What is a Dubai visa?",
    answer: "A Dubai visa is an official travel authorization issued by UAE immigration authorities that allows foreign nationals to enter Dubai and other emirates for tourism, transit, or short-term visits."
  },
  {
    id: 6,
    category: "Dubai Visa Information",
    question: "Is a Dubai visa the same as a UAE visa?",
    answer: "Yes. A Dubai visa is a UAE visa. Once approved, it allows travel to all seven emirates: Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah, Fujairah, and Umm Al Quwain."
  },
  {
    id: 7,
    category: "Dubai Visa Information",
    question: "What is a Dubai visa online (UAE e-visa)?",
    answer: "A Dubai visa online, also known as a UAE e-visa, is an electronically issued visa that can be applied for digitally and received via email in PDF format. No physical stamping is required before travel."
  },

  // 3️⃣ Types of Dubai Tourist Visas Available
  {
    id: 8,
    category: "Visa Types",
    question: "What visa types can I apply for at UAEPermit.com?",
    answer: "We assist with: 48 Hours Transit Visa, 96 hours Transit Visa, 14 Days Dubai Tourist Visa, 30 Days Dubai Tourist Visa, 60 Days Dubai Tourist Visa, Single Entry Visa, Multiple Entry Visa, and Express Dubai Visa."
  },
  {
    id: 9,
    category: "Visa Types",
    question: "What is a single-entry visa?",
    answer: "A single-entry visa allows one entry into the UAE during its validity period. Once you exit, the visa cannot be reused."
  },
  {
    id: 10,
    category: "Visa Types",
    question: "What is a multiple-entry visa?",
    answer: "A multiple-entry visa allows travellers to enter and exit the UAE multiple times within the approved validity period."
  },

  // 4️⃣ Dubai Visa Requirements
  {
    id: 11,
    category: "Visa Requirements",
    question: "What documents are required to apply for a UAE visa online?",
    answer: "Standard requirements include: Passport copy (minimum 6 months validity), Passport-size photograph, Return Air Ticket (both ways), and Passport Cover (outside). Additional documents may be required depending on nationality."
  },
  {
    id: 12,
    category: "Visa Requirements",
    question: "Does every traveller need a separate visa?",
    answer: "Yes. Each traveller — including minors and infants — must have an individual UAE visa."
  },
  {
    id: 13,
    category: "Visa Requirements",
    question: "How long must my passport be valid?",
    answer: "Your passport must be valid for at least six months from your intended date of travel to the UAE."
  },

  // 5️⃣ How to Apply for a Dubai Visa Online
  {
    id: 14,
    category: "Application Process",
    question: "What is the step-by-step process to apply?",
    answer: "1. Select your visa type (14, 30, or 60 days)\n2. Complete the online visa application form\n3. Upload required documents\n4. Make secure online payment\n5. Receive your approved UAE e-visa by email"
  },
  {
    id: 15,
    category: "Application Process",
    question: "Can I apply from any country?",
    answer: "Yes. You can apply for a UAE visa online from anywhere in the world."
  },
  {
    id: 16,
    category: "Application Process",
    question: "How will I receive my approved visa?",
    answer: "Your approved UAE tourist visa will be delivered to your registered email address in PDF format."
  },

  // 6️⃣ Dubai Visa Processing Time & Express Service
  {
    id: 17,
    category: "Processing Time",
    question: "How long does UAE visa processing take?",
    answer: "Standard processing time: 24 to 72 working hours. Processing may vary depending on nationality and immigration review."
  },
  {
    id: 18,
    category: "Processing Time",
    question: "Is express Dubai visa available?",
    answer: "Yes. UAEPermit.com offers express visa processing for urgent travel cases with 8 to 12 hours turnaround time."
  },
  {
    id: 19,
    category: "Processing Time",
    question: "Are weekends and public holidays included?",
    answer: "Processing depends on UAE immigration working days. UAE public holidays may impact timelines."
  },

  // 7️⃣ Dubai Visa Fees
  {
    id: 20,
    category: "Visa Fees",
    question: "How much does a Dubai visa cost?",
    answer: "Visa fees vary based on visa duration (14, 30, 60 days), single or multiple entry, applicant nationality, and standard or express processing. Live visa fees can be checked directly on UAEPermit.com."
  },
  {
    id: 21,
    category: "Visa Fees",
    question: "Is the UAE visa fee refundable?",
    answer: "No. UAE visa fees are non-refundable once the application is submitted to immigration authorities."
  },

  // 8️⃣ Visa Validity, Stay Duration & Extensions
  {
    id: 22,
    category: "Visa Validity",
    question: "How long can I stay in Dubai?",
    answer: "Stay duration depends on visa type: 48 Hours, 96 Hours, 14 days, 30 days, or 60 days."
  },
  {
    id: 23,
    category: "Visa Validity",
    question: "Can I extend my UAE tourist visa?",
    answer: "Yes. Many UAE tourist visas are extendable subject to immigration approval and additional charges."
  },
  {
    id: 24,
    category: "Visa Validity",
    question: "What happens if I overstay?",
    answer: "Overstaying may result in daily fines and penalties. All fines must be cleared before exiting the UAE."
  },

  // 9️⃣ Dubai Visa Status Check
  {
    id: 25,
    category: "Visa Status",
    question: "How can I check my visa application status?",
    answer: "You can track your UAE visa status using your application reference number through UAEPermit.com support or tracking page."
  },
  {
    id: 26,
    category: "Visa Status",
    question: "What does 'Under Process' mean?",
    answer: "Your application is currently being reviewed by UAE immigration authorities."
  },
  {
    id: 27,
    category: "Visa Status",
    question: "What does 'Approved or Issued' mean?",
    answer: "Your visa has been granted and you are eligible to travel to the UAE."
  },

  // 🔟 Travel & Entry Requirements
  {
    id: 28,
    category: "Travel Requirements",
    question: "What should I carry when traveling to the UAE?",
    answer: "Travelers should carry printed or digital copy of UAE e-visa, valid passport, return flight ticket, and hotel booking or accommodation details."
  },
  {
    id: 29,
    category: "Travel Requirements",
    question: "Is travel insurance required?",
    answer: "Travel insurance is strongly recommended for all travellers visiting the UAE."
  },
  {
    id: 30,
    category: "Travel Requirements",
    question: "Can entry be denied even with an approved visa?",
    answer: "Yes. Final entry approval is determined by immigration officers at the UAE port of entry."
  },

  // 1️⃣1️⃣ Dubai Visa Rejection & Reapplication
  {
    id: 31,
    category: "Visa Rejection",
    question: "Why is a UAE visa rejected?",
    answer: "Common reasons include incorrect or incomplete documents, blurry passport copy, passport validity less than 6 months, previous UAE overstay history, and incorrect personal details."
  },
  {
    id: 32,
    category: "Visa Rejection",
    question: "Can I reapply after rejection?",
    answer: "Yes. Applicants may reapply after correcting the issue that led to rejection."
  },

  // 1️⃣2️⃣ Security, Payments & Trust
  {
    id: 33,
    category: "Security & Trust",
    question: "Is it safe to apply for a UAE visa on UAEPermit.com?",
    answer: "Yes. UAEPermit.com follows strict data protection standards and secure payment protocols. Key security measures include encrypted HTTPS website protection, secure online payment gateway, professional document verification process, application submission through authorized UAE immigration channels, and dedicated customer assistance. UAEPermit.com operates under Budget Travel & Tourism LLC, a Dubai-based destination management company."
  },
  {
    id: 34,
    category: "Security & Trust",
    question: "How can I verify if UAEPermit.com is trustworthy?",
    answer: "Before applying, complete these 3 important trust checks: 1. Check Company Background - UAEPermit.com is part of Budget Travel & Tourism LLC (Dubai-based company). 2. Check Trustpilot Reviews - Review overall rating and read 1-star, 2-star, and 3-star reviews carefully. 3. Verify Website Security & Contact Details - Confirm HTTPS encryption, verify official contact numbers, and avoid dealing with random social media agents."
  },
  {
    id: 35,
    category: "Security & Trust",
    question: "Why is checking 1-star, 2-star, and 3-star reviews important?",
    answer: "Reading lower and mid-tier reviews helps you identify recurring issues, understand real customer experiences, evaluate how the company handles complaints, and assess response time and professionalism. A trustworthy visa service provider responds transparently and professionally to all levels of feedback."
  },
  {
    id: 36,
    category: "Security & Trust",
    question: "How can I avoid UAE visa scams?",
    answer: "To protect yourself: Apply only through verified platforms like UAEPermit.com, cross-check reviews on Trustpilot, avoid unofficial WhatsApp-only agents, never share passport details on unsecured websites, and confirm payment gateway security."
  },
  {
    id: 37,
    category: "Security & Trust",
    question: "Does an approved visa guarantee entry into the UAE?",
    answer: "No. Final entry approval remains at the discretion of immigration officers at the UAE port of entry in the United Arab Emirates."
  },
  {
    id: 38,
    category: "Security & Trust",
    question: "What is UAEPermit.com's transparency commitment?",
    answer: "UAEPermit.com believes in clear visa fee structure, honest processing timelines, professional customer communication, transparent review visibility, and secure digital processing. Being part of Budget Travel & Tourism LLC ensures structured operations and accountability within Dubai's regulated travel sector."
  }
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
      <section className="relative overflow-hidden pt-16 md:pt-20 pb-4 ">
        {/* subtle background accent (also reduced height) */}
        <div className="pointer-events-none absolute inset-x-0 -bottom-24 h-40" />

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
            apply to how you'll receive it. Start with the most common questions
            below.
          </p>
        </div>
      </section>

      {/* FAQ CONTENT – added top padding so it doesn't stick to hero */}
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
                          isOpen ? "max-h-[400px] md:max-h-[350px]" : "max-h-0"
                        }`}
                      >
                        <div className="px-5 md:px-7 pb-5 md:pb-6">
                          <div className="mt-1 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 md:px-5 py-4 text-sm md:text-[15px] text-[#4B5563] leading-relaxed whitespace-pre-line">
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
                  <div className="flex gap-3 text-nowrap items-center flex-wrap md:flex-nowrap lg:flex-nowrap">
                    <a
                      href="/contact-us"
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