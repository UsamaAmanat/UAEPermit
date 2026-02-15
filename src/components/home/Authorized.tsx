// src/components/home/Authorized.tsx
"use client";

import Image from "next/image";

type Logo = { src: string; alt: string; width?: number; height?: number };

export default function Authorized() {
  const logos: Logo[] = [
    { src: "/images/authorized/govt-dubai.png", alt: "Government of Dubai" },
    { src: "/images/authorized/dubai-tourism.png", alt: "Dubai Economy & Tourism" },
    { src: "/images/authorized/the-emirates.png", alt: "The Emirates" },
  ];

 return (
    <section className="relative bg-white">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-18">
        <h2 className="text-center text-[28px] md:text-[36px] font-extrabold text-[#3C4161] tracking-tight">
           Authorized By The Government Of UAE
        </h2>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16 items-center">
          {logos.map((logo) => (
            <div
              key={logo.alt}
              className="
                flex items-center justify-center
                p-2 md:p-4
                transition-transform duration-200 will-change-transform
                hover:-translate-y-0.5
              "
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                width={640}
                height={260}
                priority={false}
                // Ensure no grayscale/filters dimming the logo colors
                className="h-20 md:h-28 lg:h-32 w-auto object-contain filter-none !grayscale-0 !saturate-100 !opacity-100"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
