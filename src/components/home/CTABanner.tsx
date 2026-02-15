import React from "react";
import Link from "next/link";

const CTABanner = () => {
  return (
    <div className="w-full py-10 md:py-12 px-4 bg-[#0c4d3d]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
          <div>
            <h2 className="text-[24px] md:text-[28px] lg:text-[36px] font-medium text-[#62E9C9] mb-2 md:mb-3">
              Need fast assistance to UAE travel?
            </h2>
            <p className="text-[16px] md:text-[20px] lg:text-[26px] font-medium text-white leading-relaxed">
              Apply now to get professional assistance and quick processing
              support
              <br />
              from our licensed travel agency.
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
            Disclaimer: uaepermit.com is operated by Budget Travel & Tourism LLC
            (License No. 1202281), a licensed private travel and tourism agency
            based in Dubai, United Arab Emirates. We provide professional
            assistance and support for UAE visit visa applications and related
            travel documentation. uaepermit.com is not affiliated with the UAE
            Government or any official immigration authority. Our services
            include consultation, document preparation, and customer support.
            Service fees apply in addition to any applicable government visa
            charges. Applicants may also choose to apply directly through
            official UAE government channels at a lower cost, without using our
            private support services.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CTABanner;
