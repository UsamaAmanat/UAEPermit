"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isAdminRoute = pathname?.startsWith("/admin");

  // ⛔ Do not show public navbar on admin pages
  if (isAdminRoute) {
    return null;
  }

  const links = [
    { name: "Apply", href: "/apply" },
    { name: "Track", href: "/track" },
    { name: "FAQ’s", href: "/faqs" },
    { name: "Blogs", href: "/blogs" },
  ];

  const linkBase = `relative inline-block text-[16px] font-semibold transition-colors duration-300 ${
    isScrolled
      ? "text-white hover:text-[#c5f7e6]"
      : "text-[#3C4161] hover:text-[#2B2F55]"
  }`;
  const linkUnderline = `after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 ${
    isScrolled ? "after:bg-[#c5f7e6]" : "after:bg-[#2B2F55]"
  } hover:after:w-full after:transition-all after:duration-200`;
  const activeUnderline = `after:w-full ${
    isScrolled
      ? "after:bg-[#c5f7e6] text-[#c5f7e6]"
      : "after:bg-[#2B2F55] text-[#2B2F55]"
  }`;

  // CTA style: solid by default, outline on hover (like you wanted)
  const ctaDesktop = isScrolled
    ? "hidden md:inline-flex items-center justify-center rounded-[27px] px-7 py-3 text-[16px] font-semibold " +
      "border-2 border-[#62E9C9] bg-[#62E9C9] text-black " +
      "transition-all duration-200 ease-out hover:bg-transparent hover:text-[#62E9C9] " +
      "hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#62E9C9]/30"
    : "hidden md:inline-flex items-center justify-center rounded-[27px] px-7 py-3 text-[16px] font-semibold " +
      "border-2 border-black bg-black text-white " +
      "transition-all duration-200 ease-out hover:bg-transparent hover:text-black " +
      "hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3C4161]/30";

  return (
    <nav className="fixed inset-x-0 top-0 z-50 transition-all duration-300">
      <div
        className={`backdrop-blur-sm transition-colors duration-300 ${
          isScrolled ? "bg-[#0c4d3d]" : "bg-white/0"
        }`}
      >
        <div
          className={`container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 transition-all duration-300 ${
            isScrolled ? "md:h-20 h-[75px]" : "md:h-30 h-[100px]"
          }`}
        >
          {/* Left: Logo */}
          <Link
            href="/"
            className={`flex items-center gap-2 select-none transition-all duration-300 ${
              isScrolled ? "filter invert" : ""
            }`}
          >
            <Image
              src="/images/icons/logo-evisa.png"
              alt="UAEPermit Logo"
              width={189}
              height={48}
              priority
              className="md:w-auto w-[140px] h-auto"
            />
          </Link>

          {/* Right: Desktop links + CTA */}
          <div className="hidden md:flex items-center gap-10">
            {links.map((l) => {
              const isActive = pathname?.startsWith(l.href);
              return (
                <Link
                  key={l.name}
                  href={l.href}
                  className={`${linkBase} ${linkUnderline} ${isActive ? activeUnderline : ""}`}
                >
                  {l.name}
                </Link>
              );
            })}
            <Link
              href="https://wa.me/971558715533"
              target="_blank"
              rel="noopener noreferrer"
              className={ctaDesktop}
            >
              Contact us
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(true)}
            className={`md:hidden p-2 rounded-md transition-all duration-300 ${
              isScrolled
                ? "bg-[#62E9C9] text-black hover:bg-[#62E9C9]/90"
                : "text-[#3C4161] hover:bg-white/40"
            }`}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* Mobile overlay & drawer (no CTA inside) */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute top-0 left-0 right-0 bg-white rounded-b-2xl shadow-xl animate-[slideDown_.18s_ease-out]">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <Image
                  src="/images/icons/logo-evisa.png"
                  alt="Logo"
                  width={110}
                  height={30}
                />
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-md text-[#3C4161] hover:bg-gray-100 transition"
                  aria-label="Close menu"
                >
                  <X size={22} />
                </button>
              </div>

              <nav className="pb-4">
                <div className="flex flex-col gap-1">
                  {links.map((l) => {
                    const isActive = pathname?.startsWith(l.href);
                    return (
                      <Link
                        key={l.name}
                        href={l.href}
                        onClick={() => setOpen(false)}
                        className={`block w-full rounded-lg px-3 py-3 text-[16px] font-semibold ${
                          isActive
                            ? "text-[#2B2F55] bg-[#f4f5fb]"
                            : "text-[#3C4161]"
                        } hover:bg-gray-50 transition`}
                      >
                        {l.name}
                      </Link>
                    );
                  })}
                </div>
              </nav>
            </div>
          </div>

          <style jsx global>{`
            @keyframes slideDown {
              from {
                transform: translateY(-8px);
                opacity: 0;
              }
              to {
                transform: translateY(0);
                opacity: 1;
              }
            }
          `}</style>
        </div>
      )}
    </nav>
  );
}
