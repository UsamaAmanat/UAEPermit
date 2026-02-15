import type { Metadata } from "next";
import FaqsClient from "./FaqsClient";

export const metadata: Metadata = {
  title: "Dubai & UAE Visa FAQs | UAE Permit Help & Info",
  description:
    "Have visa questions? Read our FAQs for everything about Dubai & UAE visas: application timing, permit types, processing times, and how to apply with confidence.",
  alternates: {
    canonical: "/faqs",
  },
};

export default function FaqsPage() {
  return <FaqsClient />;
}
