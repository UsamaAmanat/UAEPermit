// "use client";

// import Image from "next/image";
// import Link from "next/link";
// import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Star  } from "lucide-react";
// import { usePathname } from "next/navigation";

// const QUICK_LINKS = [
//   { label: "About", href: "/about" },
//   { label: "FAQ's", href: "/faqs" },
//   { label: "Blogs", href: "/blogs" },
//   { label: "Contact", href: "/contact" },
// ];

// const IMPORTANT_LINKS = [
//   { label: "Terms & Conditions", href: "/terms" },
//   { label: "Privacy & Policy", href: "/privacy" },
//   { label: "Stay & Overstay Rules", href: "/stay-overstay-rules" },
// ];

// const CONTACT = {
//   email: "support@uaepermit.com",
//   phone: "+971 558715533",
//   address: "402 NGI Building Deira Dubai",
//   socials: {
//     facebook: "https://www.facebook.com/uaepermit",,
//     instagram: "https://www.instagram.com/uaepermit",,
//    linkedin: "https://www.linkedin.com/company/ez-dubai-visa/",
//    trustpilot: "https://www.trustpilot.com/review/uaepermit.com"

//   },
// };

// const FOOTER_BADGES = {
//   qr: {
//     src: "/images/footer-qr.jpeg",
//     alt: "Scan QR Code",
//     href: "https://app.invest.dubai.ae/DUL/6D54282E-2584-4953-81F2-34F2D6EEF52F", // ✅ WhatsApp (same as footer phone)
//   },
//   dul: {
//     src: "/images/footer-dul.png",
//     alt: "DUL Logo",
//     href: "https://app.invest.dubai.ae/DUL/6D54282E-2584-4953-81F2-34F2D6EEF52F",
//   },
// };

// export default function Footer() {
//   const pathname = usePathname();
//   const isAdminRoute = pathname?.startsWith("/admin");

//   // ⛔ Do not show public footer on admin pages
//   if (isAdminRoute) return null;

//   return (
//     <footer
//       className="
//         bg-[#141729] text-white
//         pt-10 md:pt-14
//         bg-no-repeat bg-right-bottom
//       "
//       style={{ backgroundImage: "url('/images/footer-skyline.png')" }}
//     >
//       {/* ========= TOP: 3 columns ========= */}
//       <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-0 pb-8 md:pb-10">
//         <div className="flex flex-col md:flex-row md:items-start gap-10 md:gap-16">
//           {/* LEFT: logo */}
// <div className="md:w-1/6">
//   <div className="h-10 w-40 mb-4">
//     <Image
//       src="/images/icons/logo-footer.png"
//       alt="UAE Permit Logo"
//       width={140}
//       height={38}
//       priority
//     />
//   </div>

//   {/* QR + DUL badges */}
//   <div className="mt-4 flex items-center gap-4">
//     {/* QR */}
//     <a
//       href={FOOTER_BADGES.qr.href}
//       target="_blank"
//       rel="noopener noreferrer"
//       className="group relative block"
//       aria-label="Open WhatsApp"
//       title="Chat on WhatsApp"
//     >
//       <div className="rounded-xl border border-white/10 bg-white/5 p-2 transition group-hover:bg-white/10">
//         <div className="h-[78px] w-[78px] grid place-items-center">
//           <Image
//             src={FOOTER_BADGES.qr.src}
//             alt={FOOTER_BADGES.qr.alt}
//             width={78}
//             height={78}
//             className="max-h-[70px] max-w-[70px] rounded-lg object-contain"
//           />
//         </div>
//       </div>
//     </a>

//     {/* DUL */}
//     <a
//       href={FOOTER_BADGES.dul.href}
//       target="_blank"
//       rel="noopener noreferrer"
//       className="group relative block"
//       aria-label="Open DUL verification"
//       title="DUL"
//     >
//       <div className="rounded-xl border border-white/10 bg-white/5 p-2 transition group-hover:bg-white/10">
//         <div className="h-[78px] w-[78px] grid place-items-center">
//           <Image
//             src={FOOTER_BADGES.dul.src}
//             alt={FOOTER_BADGES.dul.alt}
//             width={78}
//             height={78}
//             className="max-h-[70px] max-w-[70px] rounded-lg object-contain"
//           />
//         </div>
//       </div>
//     </a>
//   </div>
// </div>

//           {/* CENTER: Quick + Important */}
//           <div className="md:w-1/3">
//             <div className="flex flex-col sm:flex-row gap-8 md:gap-14">
//               <div>
//                 <h4 className="text-sm font-semibold text-[#F0E960] mb-4">
//                   Quick Links
//                 </h4>
//                 <ul className="space-y-2 text-sm text-gray-200">
//                   {QUICK_LINKS.map((item) => (
//                     <li key={item.href}>
//                       <Link
//                         href={item.href}
//                         className="hover:text-[#F0E960] transition-colors"
//                       >
//                         {item.label}
//                       </Link>
//                     </li>
//                   ))}
//                 </ul>
//               </div>

//               <div>
//                 <h4 className="text-sm font-semibold text-[#F0E960] mb-4">
//                   Important
//                 </h4>
//                 <ul className="space-y-2 text-sm text-gray-200">
//                   {IMPORTANT_LINKS.map((item) => (
//                     <li key={item.href}>
//                       <Link
//                         href={item.href}
//                         className="hover:text-[#F0E960] transition-colors"
//                       >
//                         {item.label}
//                       </Link>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             </div>
//           </div>

//           {/* RIGHT: Get in touch */}
//           <div className="md:w-1/3 md:-ml-20">
//             <h4 className="text-sm font-semibold text-[#F0E960] mb-4">
//               Get in touch
//             </h4>

//             <ul className="space-y-2 text-sm text-gray-200">
//               <li className="flex items-center gap-2">
//                 <Mail className="w-4 h-4 text-[#F0E960]" />
//                 <a
//                   href={`mailto:${CONTACT.email}`}
//                   className="hover:text-[#F0E960] transition-colors"
//                 >
//                   {CONTACT.email}
//                 </a>
//               </li>
//               <li className="flex items-center gap-2">
//                 <Phone className="w-4 h-4 text-[#F0E960]" />
//                 <a
//                   href={`https://wa.me/${CONTACT.phone.replace(/\D/g, "")}`}
//                   target="_blank"
//                   rel="noreferrer"
//                   className="hover:text-[#F0E960] transition-colors"
//                 >
//                   {CONTACT.phone}
//                 </a>
//               </li>
//               <li className="flex items-center gap-2">
//                 <MapPin className="w-4 h-4 text-[#F0E960]" />
//                 <span>{CONTACT.address}</span>
//               </li>
//             </ul>

//            {/* Trustpilot + Socials (same row) */}
// {/* Socials first + compact Trustpilot (same row) */}
// <div className="mt-5 flex flex-wrap items-center gap-3">
//   {/* Social icons (first) */}
//   <div className="flex items-center gap-3">
//     <a
//       href={CONTACT.socials.facebook}
//       target="_blank"
//       rel="noopener noreferrer"
//       className="grid h-9 w-9 place-items-center rounded-full bg-[#F0E960] text-[#141729] hover:opacity-90 transition"
//       aria-label="Facebook"
//     >
//       <Facebook className="w-4 h-4" />
//     </a>

//     <a
//       href={CONTACT.socials.instagram}
//       target="_blank"
//       rel="noopener noreferrer"
//       className="grid h-9 w-9 place-items-center rounded-full bg-[#F0E960] text-[#141729] hover:opacity-90 transition"
//       aria-label="Instagram"
//     >
//       <Instagram className="w-4 h-4" />
//     </a>

//     <a
//       href={CONTACT.socials.linkedin}
//       target="_blank"
//       rel="noopener noreferrer"
//       className="grid h-9 w-9 place-items-center rounded-full bg-[#F0E960] text-[#141729] hover:opacity-90 transition"
//       aria-label="LinkedIn"
//     >
//       <Linkedin className="w-4 h-4" />
//     </a>
//   </div>

//   {/* Trustpilot (short + aligned to end on desktop) */}
//   <a
//     href={CONTACT.socials.trustpilot}
//     target="_blank"
//     rel="noopener noreferrer"
//     aria-label="Trustpilot Reviews"
//    className="
//   inline-flex items-center gap-2
//   h-9 rounded-full border border-white/10
//   bg-white/5 px-3
//   text-xs sm:text-sm text-gray-200
//   transition hover:bg-white/10 hover:text-[#F0E960]

// "

//   >
//     <span className="grid h-7 w-7 place-items-center rounded-full bg-[#F0E960] text-[#141729]">
//       <Star className="h-4 w-4" />
//     </span>

//     {/* keep it short */}
//     <span className="font-semibold">Trustpilot</span>
//     <span className="hidden md:inline text-gray-400">Reviews</span>
//   </a>
// </div>

//           </div>
//         </div>
//       </div>

//   {/* ========= BOTTOM BAR (with inline disclaimer) ========= */}
// <div className="border-t border-white/10 bg-[#141729]/80">
//   <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-0 py-3 md:py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-[13px] text-gray-300">
//     <div className="space-y-1 max-w-2xl">
//       <p>Copyright © 2025 uaepermit.ae – All Rights Reserved</p>
//       <p className="text-gray-400">
//         Powered by Budget Travel &amp; Tourism LLC, your Trusted Partner
//         for Seamless Travel Experiences.
//       </p>
//       <p className="text-[9px] leading-snug text-gray-500">
//         Disclaimer: UAE Permit is operated by Budget Travel &amp; Tourism LLC
//         (License No. 1202281), a licensed private travel and tourism agency based
//         in Dubai, United Arab Emirates. We provide professional assistance and
//         support for UAE visit visa applications and related travel documentation.
//         UAE Permit is not affiliated with the UAE Government or any official
//         immigration authority. Our services include consultation, document
//         preparation, and customer support. Service fees apply in addition to any
//         applicable government visa charges. Applicants may also choose to apply
//         directly through official UAE government channels at a lower cost, without
//         using our private support services.
//       </p>
//     </div>

//     <div className="flex items-center justify-start md:justify-end">
//       <Image
//         src="/images/credit-img.png"
//         alt="Accepted payment cards"
//         width={220}
//         height={40}
//         className="object-contain"
//       />
//     </div>
//   </div>
// </div>

//     </footer>
//   );
// }
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#063127] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Social */}
          <div>
            <Image
              src="/images/icons/uae_logo.png"
              alt="UAEPermit.com"
              width={180}
              height={60}
              className="mb-4"
            />
            <div className="flex gap-3 mb-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
              >
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
              >
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
            <p className="text-[14px] font-normal text-white leading-relaxed">
              Copyrights © 2026
              <br />
              UAEPermit.com
              <br />
              All Rights Reserved.
            </p>
          </div>

          {/* Get in Touch */}
          <div>
            <h3 className="text-[14px] font-bold text-white mb-4">
              Get in Touch
            </h3>
            <div className="space-y-3">
              <a
                href="mailto:sales@uaepermit.com"
                className="flex items-center gap-2 text-[14px] font-normal text-white hover:text-[#62E9C9] transition"
              >
                <Mail className="w-4 h-4 flex-shrink-0" />
                sales@uaepermit.com
              </a>
              <a
                href="tel:+971562617646"
                className="flex items-center gap-2 text-[14px] font-normal text-white hover:text-[#62E9C9] transition"
              >
                <Phone className="w-4 h-4 flex-shrink-0" />
                +971 56 261 7646
              </a>
              <div className="flex items-start gap-2 text-[14px] font-normal text-white">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>
                  M21 Abdul Rahman Hassan
                  <br />
                  Building Al Khabeesi Deira
                  <br />
                  Dubai
                </span>
              </div>
            </div>
          </div>

          {/* Help & Support */}
          <div>
            <h3 className="text-[14px] font-bold text-white mb-4">
              Help & Support
            </h3>
            <div className="space-y-2">
              <a
                href="mailto:support@uaepermit.com"
                className="block text-[14px] font-normal text-white hover:text-[#62E9C9] transition"
              >
                support@uaepermit.com
              </a>
              <Link
                href="/faq"
                className="block text-[14px] font-normal text-white hover:text-[#62E9C9] transition"
              >
                FAQ
              </Link>
              <p className="text-[14px] font-normal text-white/80 mt-4 leading-relaxed">
                UAEPermit.com is operated by Budget Travel & Tourism LLC (DTCM
                License No. 1202281). Verify License
              </p>
            </div>
          </div>

          {/* About Us */}
          <div>
            <h3 className="text-[14px] font-bold text-white mb-4">About Us</h3>
            <div className="space-y-2">
              <Link
                href="/about"
                className="block text-[14px] font-normal text-white hover:text-[#62E9C9] transition"
              >
                About Us
              </Link>
              <Link
                href="/stay-overstay-rules"
                className="block text-[14px] font-normal text-white hover:text-[#62E9C9] transition"
              >
                Stay & Overstay Rules
              </Link>
              <Link
                href="/terms"
                className="block text-[14px] font-normal text-white hover:text-[#62E9C9] transition"
              >
                Term of use
              </Link>
              <Link
                href="/privacy"
                className="block text-[14px] font-normal text-white hover:text-[#62E9C9] transition"
              >
                Privacy Policy
              </Link>
              <Link
                href="/blogs"
                className="block text-[14px] font-normal text-white hover:text-[#62E9C9] transition"
              >
                Blogs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
