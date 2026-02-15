import React from "react";
import Image from "next/image";

const StatsSection = () => {
  const stats = [
    {
      number: "99%",
      title: "Worldwide\nApproval Rate",
      hasCard: false,
    },
    {
      number: "12+",
      title: "Years of\nExperience",
      hasCard: true,
    },
    {
      number: "24/7",
      title: "Assistance In\nYour Language",
      hasCard: false,
    },
    {
      number: "200+",
      title: "Passport\nNationalities\nServed",
      hasCard: true,
    },
  ];

  return (
    <div className="relative min-h-[350px] md:min-h-[400px] flex items-center justify-center px-4 py-12 md:py-16 overflow-hidden">
      {/* Background Dots Pattern */}
      <div className="absolute inset-0 opacity-40">
        <Image
          src="/images/home/BgDotspng.png"
          alt=""
          fill
          className="object-cover opacity-[30%]"
        />
      </div>

      {/* Stats Grid */}
      <div className="relative z-10 max-w-5xl w-full grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center justify-center">
            {stat.hasCard ? (
              // Card Version
              <div className="bg-white/80 backdrop-blur-sm border-2 border-[#62E9C9]/30 rounded-3xl px-4 md:px-8 py-6 md:py-10 w-full max-w-[240px] min-h-[140px] md:min-h-[200px] flex flex-col justify-center">
                <h3 className="text-[32px] md:text-[46px] font-bold text-[#62E9C9] leading-none mb-2 md:mb-3 text-left">
                  {stat.number}
                </h3>
                <p className="text-[12px] md:text-[16px] font-medium text-black leading-tight text-left whitespace-pre-line">
                  {stat.title}
                </p>
              </div>
            ) : (
              // No Card Version
              <div className="w-full max-w-[240px] min-h-[140px] md:min-h-[200px] flex flex-col justify-center px-4 md:px-8 py-6 md:py-10">
                <h3 className="text-[32px] md:text-[46px] font-bold text-[#62E9C9] leading-none mb-2 md:mb-3 text-left">
                  {stat.number}
                </h3>
                <p className="text-[12px] md:text-[16px] font-medium text-black leading-tight text-left whitespace-pre-line">
                  {stat.title}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsSection;
