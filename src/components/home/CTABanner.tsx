import React from "react";
import Link from "next/link";

const CTABanner = () => {
  return (
    <div className="w-full py-10 md:py-12 px-4 bg-[#0c4d3d]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
          <div>
            <h2 className="text-[24px] md:text-[28px] lg:text-[30px] font-medium text-[#62E9C9] mb-2 md:mb-3">
              Need Fast and Expert Assistance for Your Dubai Visa or UAE Visa?
            </h2>
            <p className="text-[16px] md:text-[20px] lg:text-[22px] font-medium text-white leading-relaxed">
              Apply now for expert assistance with your Dubai visa and UAE visa online, and enjoy fast, secure, and hassle-free processing from our licensed travel agency.
            </p>
          </div>

          <Link
            href="/contact"
            className="px-6 md:px-8 py-2 md:py-3 bg-white text-black rounded-full text-[14px] md:text-[16px] font-semibold hover:shadow-lg transition-all whitespace-nowrap"
          >
            Contact us
          </Link>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-white/20">
          <p className="text-[11px] md:text-[12px] font-medium text-white/90 leading-relaxed">
            Disclaimer: UAEpermit.com is operated by Budget Travel & Tourism LLC (License No. 1202281), a licensed private travel and tourism agency based in Dubai, United Arab Emirates. We provide professional assistance and expert support for Dubai visa, UAE visa, Dubai visa online, and UAE visa online applications, including consultation, document preparation, and dedicated customer support.
            </p>
            <p className="text-[11px] md:text-[12px] font-medium text-white/90 leading-relaxed">
Service fees include all applicable government visa charges. Alternatively, applicants may choose to submit their applications directly through official UAE government channels without utilizing our private support services.

          </p>
        </div>
      </div>
    </div>
  );
};

export default CTABanner;
