import React from "react";
import Image from "next/image";
import {
  Check,
  CheckCheck,
  CheckCheckIcon,
  LucideCheckCheck,
} from "lucide-react";

const ComparisonSection = () => {
  const diyItems = [
    "Confusing government websites and forms",
    "Unclear instructions",
    "One mistake can cause rejection or delays",
    "Applications accepted only at limited times",
    "Little or no assistance available",
    "Must restart if you lose progress",
    "Limited payment methods",
  ];

  const uaePermitItems = [
    "Simple, user-friendly application",
    "Clear, step-by-step guidance",
    "Careful review to avoid mistakes",
    "Apply anytime, 24/7",
    "Dedicated chat, WhatsApp, and email support",
    "Save and continue anytime",
    "Multiple payment options",
  ];

  return (
    <div className="flex items-center justify-center px-4 md:px-6 lg:px-8 pb-8 md:pb-15">
      <div className="max-w-5xl w-full">
        {/* Heading */}
        <h1 className="text-[22px] md:text-[28px] lg:text-[36px] font-medium text-center text-black mb-8 md:mb-16 leading-tight">
          Why millions of travelers
          <br />
          choose UAEPermit
        </h1>

        {/* Comparison Container */}
        <div className="relative">
          {/* Background Circles Image - Hidden on mobile */}
          <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 w-[530px] h-[530px] pointer-events-none">
            <Image
              src="/images/comparisonsection/withUAEPERMITblob.png"
              alt=""
              width={500}
              height={500}
              className="w-full h-full object-contain"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4 md:gap-8 relative z-10">
            {/* Do It Yourself Column */}
            <div className=" rounded-3xl p-6 md:p-12">
              <h2 className="text-[18px] md:text-[22px] font-bold text-black mb-4 md:mb-6">
                Do It Yourself
              </h2>
              <div className="space-y-3 md:space-y-4">
                {diyItems.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCheck className="w-4 md:w-5 h-4 md:h-5 text-[#62E9C9] flex-shrink-0 mt-0.5" />
                    <p className="text-black text-[12px] md:text-[14px] font-medium leading-relaxed">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* With UAEPermit Column */}
            <div
              className="rounded-3xl p-6 md:p-12 shadow-lg border border-[#62E9C9]/20 backdrop-blur-[90px]"
              style={{ backgroundColor: "rgba(217, 217, 217, 0.2)" }}
            >
              <div className="flex items-center gap-2 mb-4 md:mb-6 flex-wrap">
                <span className="text-[18px] md:text-[22px] font-bold text-black">
                  With
                </span>
                <Image
                  src="/images/comparisonsection/uae_logo.png"
                  alt="UAEPermit"
                  width={129}
                  height={21}
                  className="h-[16px] md:h-[21px] w-auto"
                />
              </div>

              <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                {uaePermitItems.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCheck className="w-4 md:w-5 h-4 md:h-5 text-black flex-shrink-0 mt-0.5" />
                    <p className="text-black text-[12px] md:text-[14px] font-medium leading-relaxed">
                      {item}
                    </p>
                  </div>
                ))}
              </div>

              {/* Get Started Button */}
              <div className="flex justify-center">
                <button className="px-6 md:px-8 py-2 md:py-3 bg-transparent border-2 border-black rounded-full text-black font-semibold text-[14px] md:text-[16px] hover:bg-black hover:text-white transition-all duration-300">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonSection;
