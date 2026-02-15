// src/app/page.tsx

import Hero from "@/components/home/Hero";
import Process from "@/components/home/ComparisonSection";
import Benefits from "@/components/home/StatsSection";
import Testimonials from "@/components/home/Testimonials";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import Authorized from "@/components/home/Authorized";
import CountriesNeedVisa from "@/components/home/CountriesNeedVisa";
import BlogSection from "@/components/home/BlogSection";

import type { Metadata } from "next";
import HomeSchema from "@/components/seo/HomeSchema";
import ComparisonSection from "@/components/home/ComparisonSection";
import StatsSection from "@/components/home/StatsSection";
import ProcessSection from "@/components/home/ProcessSection";
import CTABanner from "@/components/home/CTABanner";
// import TempHome from "@/components/home/TempHome";
export const metadata: Metadata = {
  title: "Hassle-Free Dubai & UAE Visa Assistance | Govt Licensed",
  description:
    "Dubai & UAE Visa in 24 Hours — Fast, reliable approval from a DTCM-licensed company trusted by 100,000+ travelers. Enjoy secure checkout with Mastercard, Visa, and more.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <>
      <HomeSchema />
      <Hero />
      <ComparisonSection />
      <StatsSection />
      <ProcessSection />
      <Testimonials />

      {/* <WhyChooseUs /> */}
      {/* <Authorized /> */}
      <CountriesNeedVisa />
      <CTABanner />
      {/* <BlogSection /> */}
      {/* <TempHome /> */}
    </>
  );
}
