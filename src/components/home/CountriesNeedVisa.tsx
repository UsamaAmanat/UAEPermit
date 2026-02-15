"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ReactCountryFlag from "react-country-flag";
import { Search, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { COUNTRIES } from "./utils/utils";

const INITIAL_COUNT = 16;

// 👉 helper to convert "Mauritania" → "mauritania", "Saudi Arabia" → "saudi-arabia"
function countrySlug(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[()]/g, "")
    .replace(/['']/g, "")
    .replace(/\s+/g, "-")
    .trim();
}

type Country = {
  name: string;
  code: string;
};

export default function CountriesNeedVisa() {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();

  const prefetchCountry = (name: string) => {
    const slug = countrySlug(name);
    router.prefetch(`/country/${slug}`);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? COUNTRIES.filter((c) => c.name.toLowerCase().includes(q))
      : COUNTRIES;
  }, [query]);

  const visible = expanded ? filtered : filtered.slice(0, INITIAL_COUNT);

  const handleSearchAction = () => {
    if (query.trim()) {
      // Handle search action
      console.log("Searching for:", query);
    }
  };

  const handleClear = () => {
    setQuery("");
  };

  return (
    <section className="relative py-12 md:py-16 md:py-20 overflow-hidden">
      {/* Background Circles - Hidden on mobile */}
      <div className="hidden lg:block absolute top-0 left-0 h-[400px] pointer-events-none">
        <Image
          src="/images/home/circle-left.png"
          alt=""
          width={400}
          height={400}
          className="w-full h-full object-contain opacity-60"
        />
      </div>
      <div className="hidden lg:block absolute bottom-0 right-0 h-[400px] pointer-events-none">
        <Image
          src="/images/home/circle-right.png"
          alt=""
          width={400}
          height={400}
          className="w-full h-full object-contain opacity-60"
        />
      </div>

      <div
        className="py-12 md:py-20 backdrop-blur-[90px]"
        style={{ backgroundColor: "rgba(217, 217, 217, 0.2)" }}
      >
        <div className="relative z-10 mx-auto max-w-5xl w-full px-4 sm:px-6 lg:px-8">
          {/* Title */}
          <h2 className="text-center font-medium text-black text-[22px] md:text-[28px] lg:text-[36px] leading-tight mb-6 md:mb-8">
            Countries whose Citizens need a<br />
            UAE visit Visa
          </h2>

          {/* Search - Gradient Border */}
          <div className="mx-auto mt-6 md:mt-8 max-w-2xl">
            <div className="border-[2px] border-[#E2E2E2] rounded-[37px] bg-white">
              <div className="flex items-center pl-4 md:pl-6 pr-1.5 py-1.5 bg-white rounded-[37px]">
                <Search
                  className="mr-2 text-[#62E9C9] flex-shrink-0"
                  style={{ width: "24px", height: "24px" }}
                />

                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSearchAction();
                    }
                  }}
                  placeholder="Type your Country to proceed"
                  className="w-full outline-none bg-white text-[#3C4161] placeholder-gray-400 text-sm md:text-base"
                />

                {query && (
                  <button
                    type="button"
                    onClick={handleClear}
                    aria-label="Clear"
                    className="mr-2 grid h-8 w-8 place-items-center rounded-full hover:bg-black/5"
                  >
                    <X className="h-4 w-4 text-[#3C4161]/60 cursor-pointer" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSearchAction}
                  className="ml-2 px-6 py-2 rounded-[41px] font-semibold text-[16px] bg-[#62E9C9] text-black font-medium hover:opacity-90 transition"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="mt-8 md:mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            {visible.map((c) => (
              <CountryRow
                key={c.name}
                country={c}
                href={`/country/${countrySlug(c.name)}`}
                onHover={() => prefetchCountry(c.name)}
              />
            ))}
          </div>

          {/* All Countries Button */}
          {filtered.length > INITIAL_COUNT && !query && (
            <div className="mt-8 md:mt-12 flex justify-center">
              <button
                onClick={() => setExpanded((s) => !s)}
                className="px-6 md:px-8 py-2 md:py-3 bg-transparent border-2 border-black rounded-full text-black font-semibold text-[14px] md:text-[16px] hover:bg-black hover:text-white transition-all duration-300"
              >
                {expanded ? "Show less" : "All Countries"}
              </button>
            </div>
          )}

          {/* Empty state */}
          {filtered.length === 0 && (
            <p className="mt-8 md:mt-10 text-center text-black/70 text-[13px] md:text-[14px]">
              No countries match your search.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

type CountryRowProps = {
  country: Country;
  href: string;
  onHover?: () => void;
};

/** A single country card */
function CountryRow({ country, href, onHover }: CountryRowProps) {
  return (
    <Link
      href={href}
      onMouseEnter={onHover}
      onFocus={onHover}
      className="flex items-center gap-3 rounded-2xl px-4 py-3 hover:shadow-md transition-all"
    >
      <span className="inline-block w-12 overflow-hidden rounded-md shadow-sm flex-shrink-0">
        <ReactCountryFlag
          svg
          countryCode={country.code}
          aria-label={country.name}
          style={{ width: "100%", height: "auto", display: "block" }}
        />
      </span>

      <span className="text-[15px] font-normal text-black">{country.name}</span>
    </Link>
  );
}
