"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { AlertCircle } from "lucide-react";

export default function NewsTicker() {
  const [active, setActive] = useState<boolean | null>(null);
  const [text, setText] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "general"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setActive(!!data.tickerActive);
        setText(data.tickerText || "");
      } else {
        setActive(false);
      }
    });

    return () => unsub();
  }, []);

  // We DO NOT want the green banner to flash on load.
  // Wait until we have confirmation from Firebase that it's active BEFORE rendering anything.
  if (active !== true || !text) return null;

  return (
    <div className="relative flex h-10 items-center overflow-hidden bg-gradient-to-r from-emerald-600 to-[#62E9C9] px-4 text-sm font-medium text-white shadow-sm sm:h-11">
      {/* Icon on the left that stays fixed */}
      <div className="absolute left-0 top-0 z-10 flex h-full items-center bg-emerald-600 px-3 pr-4 sm:px-4 sm:pr-6" style={{ clipPath: "polygon(0 0, 100% 0, 85% 100%, 0% 100%)" }}>
        <AlertCircle className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
        <span className="ml-2 hidden text-xs font-bold uppercase tracking-wider sm:inline-block">Update</span>
      </div>

      {/* Scrolling Text */}
      <div className="flex w-full overflow-hidden">
        <div className="animate-ticker">
          <span className="px-4">{text}</span>
        </div>
      </div>
    </div>
  );
}
