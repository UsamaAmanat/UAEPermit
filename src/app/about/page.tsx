import type { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About UAE Permit – Trusted Dubai & UAE Visa Service",
  description:
    "Learn about UAE Permit — operated by Budget Travel & Tourism LLC — providing fast, secure Dubai Visa & UAE Visa services, 24/7 support, and transparent pricing.",
  // canonical: "/about",
};

export default function AboutPage() {
  return <AboutClient />;
}
