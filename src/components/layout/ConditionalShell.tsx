"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/home/Footer";
import NewsTicker from "@/components/layout/NewsTicker";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

export default function ConditionalShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const isAccount = pathname.startsWith("/account");
  const isAdmin = pathname.startsWith("/admin");
  const hideShell = isAccount || isAdmin;

  const [tickerActive, setTickerActive] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "general"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTickerActive(!!data.tickerActive && !!data.tickerText);
      } else {
        setTickerActive(false);
      }
    });
    return () => unsub();
  }, []);

  return (
    <>
      {!hideShell && <NewsTicker />}
      {/* We pass tickerActive to Navbar so it knows its top offset.
          The wrapper strictly adds padding to prevent the hero from sliding under the Navbar.
          During initial load, tickerActive is false, preventing the huge empty space. */}
      <div className={`transition-[padding-top] duration-500 will-change-[padding-top] ${hideShell ? "" : tickerActive ? "pt-[115px] sm:pt-[119px] md:pt-[120px]" : "pt-[75px] md:pt-[80px]"}`}>
        {!hideShell && <Navbar tickerActive={tickerActive} />}
        {children}
      </div>
      {!hideShell && <Footer />}
    </>
  );
}

