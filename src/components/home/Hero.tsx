"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import ReactCountryFlag from "react-country-flag";
import { X, Search as SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Country } from "@/data/countries";
import { COUNTRIES } from "@/data/countries";

// ----------------------------------------------------------------------
function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default function Hero() {
  // NEW: prefetch helper

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Country | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const prefetchCountry = (country: Country) => {
    const slug = toSlug(country.name);
    router.prefetch(`/country/${slug}`);
  };
  // Filtered countries
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter((c) => c.name.toLowerCase().includes(q));
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        !panelRef.current ||
        !inputRef.current ||
        panelRef.current.contains(e.target as Node) ||
        inputRef.current.contains(e.target as Node)
      ) {
        return;
      }
      setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function navigateToCountry(country: Country) {
    const slug = toSlug(country.name);
    router.push(`/country/${slug}`);
  }

  function handleSelect(country: Country) {
    setSelected(country);
    setQuery(country.name);
    setOpen(false);
    navigateToCountry(country);
  }

  function handleClear() {
    setSelected(null);
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  }

  function handleSearchAction() {
    if (filtered.length > 0) {
      handleSelect(filtered[0]);
    } else {
      // nothing found – just open dropdown
      setOpen(true);
    }
  }

  const inputValue = query || selected?.name || "";

  return (
    <section className="container pt-16 md:pt-28 md:h-[800px] md:pt-35 pb-8 md:pb-20 md:bg-[url('/images/hero/hero-bg.png')] bg-no-repeat bg-right md:bg-[length:750px]">
      <div className=" grid md:grid-cols-[55%_45%] gap-6 md:gap-10 items-center">
        {/* Left */}
        <div>
          <h1 className="font-normal text-[24px] md:text-[32px] lg:text-[36px] leading-[32px] md:leading-[44px] lg:leading-[48px] tracking-tight">
            The Quickest Method to
            <br /> Obtain Your
            <span className="font-bold"> UAE PERMIT</span>
          </h1>

          <p className="mt-3 md:mt-5 font-medium text-[13px] md:text-[14px] leading-[22px] md:leading-[26px] max-w-[800px]">
            Our expertise lies in providing permit assistance and travel-related
            services to individuals and businesses in the United Arab Emirates.
            As a licensed private agency, we simplify the process of obtaining
            travel permits and documentation with professionalism and
            transparency.
          </p>

          {/* Search */}
          <div className="mt-6 md:mt-8 w-full max-w-2xl">
            <div className="relative">
              <div className="p-[1px] rounded-[41px] bg-gradient-to-r from-[#62E9C9] to-[#CDEFBE]">
                <div className="border-[10px] border-[#BEBEBE33] rounded-[37px] bg-white">
                  <div className="flex items-center pl-6 pr-1.5 py-1.5 bg-white rounded-[37px]">
                    <SearchIcon
                      className="mr-2 text-[#62E9C9] flex-shrink-0"
                      style={{ width: "24px", height: "24px" }}
                    />

                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                      }}
                      onFocus={() => setOpen(true)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSearchAction();
                        }
                      }}
                      placeholder="Type your Country to proceed"
                      className="w-full outline-none bg-white text-[#3C4161] placeholder-gray-400 text-sm md:text-base"
                    />

                    {inputValue && (
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
                      className="ml-2 px-4 md:px-6 py-2 rounded-[41px] font-semibold text-[13px] md:text-[16px] bg-[#62E9C9] text-black font-medium hover:opacity-90 transition flex-shrink-0"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </div>

              {/* Dropdown panel */}
              {open && (
                <div
                  ref={panelRef}
                  className="absolute z-20 mt-2 w-full rounded-3xl bg-white shadow-xl ring-1 ring-black/10 max-h-80 overflow-y-auto
                             scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
                >
                  {filtered.length === 0 ? (
                    <div className="px-4 py-4 text-sm text-[#3C4161]/70">
                      No countries found. Try another spelling.
                    </div>
                  ) : (
                    <ul className="py-2">
                      {filtered.map((c) => (
                        <li key={c.code}>
                          <button
                            type="button"
                            onMouseEnter={() => prefetchCountry(c)}
                            onFocus={() => prefetchCountry(c)}
                            onClick={() => handleSelect(c)}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-[#F8F8F8] transition"
                          >
                            <span className="inline-grid h-10 w-14 place-items-center overflow-hidden rounded-md ring-1 ring-black/10 bg-white">
                              <ReactCountryFlag
                                svg
                                countryCode={c.code}
                                aria-label={c.name}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            </span>
                            <span className="text-[15px] text-[#3C4161]">
                              {c.name}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right (NO overflow clip) */}
        <div className="relative flex items-center justify-center md:justify-center">
          <div className="relative ">
            <Image
              src="/images/hero/visa-client.png"
              alt="Dubai skyline"
              width={297}
              height={456.51}
              className="block drop-shadow-[0_20px_40px_rgba(0,0,0,0.25)]"
              priority
            />
          </div>
        </div>
        <Image
          src="/images/hero/blob-left.png"
          alt="Decorative blob"
          width={297}
          height={456}
          priority
          className="absolute -left-35 top-100"
        />
      </div>
    </section>
  );
}
