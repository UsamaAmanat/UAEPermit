"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import ReactCountryFlag from "react-country-flag";
import { X, Search as SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { COUNTRIES as STATIC_COUNTRIES, type Country } from "@/data/countries";

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
  const [query_, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Country | null>(null);
  const [countries, setCountries] = useState<Country[]>(STATIC_COUNTRIES);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  // Fetch countries from Firestore
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDocs(
          query(collection(db, "countries"), where("status", "==", "active"))
        );
        if (cancelled) return;
        const list: Country[] = [];
        snap.docs.forEach((d) => {
          const data = d.data() as any;
          const name = data?.name || d.id;
          const code = data?.countryCode || data?.code || "";
          const slug = data?.slug || d.id;
          list.push({ name, code, slug });
        });
        list.sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
        if (list.length > 0) setCountries(list);
      } catch (e) {
        console.error("Failed to fetch countries for hero:", e);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const prefetchCountry = (country: Country) => {
    const slug = country.slug || toSlug(country.name);
    router.prefetch(`/country/${slug}`);
  };

  // Filtered countries
  const filtered = useMemo(() => {
    const q = query_.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter((c) => c.name.toLowerCase().includes(q));
  }, [query_, countries]);

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
    const slug = country.slug || toSlug(country.name);
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

  const inputValue = query_ || selected?.name || "";

  return (
    <section className="container pt-16 md:pt-28 md:h-[800px] md:pt-35 pb-8 md:pb-20 md:bg-[url('/images/hero/hero-bg.png')] bg-no-repeat bg-right md:bg-[length:750px]">
      <div className=" grid md:grid-cols-[55%_45%] gap-6 md:gap-10 items-center">
        {/* Left */}
        <div>
          <h1 className="font-normal text-[24px] md:text-[32px] lg:text-[36px] leading-[32px] md:leading-[44px] lg:leading-[48px] tracking-tight">
            The Express Solution for Obtaining 
            <br /> Your Dubai Visa & 
            <span className="font-bold"> UAE Visa </span>Online
          </h1>

          <p className="mt-3 md:mt-5 font-medium text-[13px] md:text-[14px] leading-[22px] md:leading-[26px] max-w-[800px]">
           
            We provide expert assistance for Dubai visa and UAE visa services as a government-licensed private agency in the United Arab Emirates. We simplify the entire UAE visa online application process with fast, secure, and transparent support.
</p><p className="mt-3 md:mt-5 font-medium text-[13px] md:text-[14px] leading-[22px] md:leading-[26px] max-w-[800px]">
Whether you need a Dubai tourist visa, UAE tourist visa, Dubai visit visa, Dubai entry visa, or UAE travel visa, we make it easy to Apply Dubai visa online and complete your Dubai visa online process smoothly and efficiently.

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
                      className="w-full outline-none bg-white text-slate-800 placeholder-gray-400 text-sm md:text-base"
                    />

                    {inputValue && (
                      <button
                        type="button"
                        onClick={handleClear}
                        aria-label="Clear"
                        className="mr-2 grid h-8 w-8 place-items-center rounded-full hover:bg-black/5"
                      >
                        <X className="h-4 w-4 text-slate-500 cursor-pointer" />
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
                    <div className="px-4 py-4 text-sm text-slate-500">
                      No countries found. Try another spelling.
                    </div>
                  ) : (
                    <ul className="py-2">
                      {filtered.map((c) => (
                        <li key={c.code || c.name}>
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
                            <span className="text-[15px] text-slate-800">
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
          className="absolute -left-35 top-100 z-[-1]"
        />
      </div>
    </section>
  );
}
