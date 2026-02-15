"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Clock3,
  FileWarning,
  ShieldAlert,
  PlaneTakeoff,
  Landmark,
} from "lucide-react";

type Item = {
  id: string;
  label: string;
  icon: keyof typeof ICONS;
};

const ICONS = {
  Clock3,
  FileWarning,
  ShieldAlert,
  PlaneTakeoff,
  Landmark,
};

export default function TocSpy({ items }: { items: readonly Item[] }) {
  const [activeId, setActiveId] = useState(items?.[0]?.id ?? "");

  const ids = useMemo(() => items.map((i) => i.id), [items]);

  useEffect(() => {
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0),
          );

        if (visible[0]?.target?.id) setActiveId(visible[0].target.id);
      },
      {
        root: null,
        rootMargin: "-25% 0px -60% 0px",
        threshold: [0.1, 0.2, 0.35, 0.5, 0.7],
      },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [ids]);

  return (
    <ul className="mt-4 space-y-2">
      {items.map((item) => {
        const isActive = item.id === activeId;
        const Icon = ICONS[item.icon] ?? Clock3;

        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={[
                "group relative flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5 transition",
                "hover:bg-[#F5F7FF]",
                isActive ? "bg-[#F5F7FF]" : "",
              ].join(" ")}
              aria-current={isActive ? "true" : "false"}
            >
              <span className="flex items-center gap-3">
                <span
                  className={[
                    "h-9 w-9 rounded-xl ring-1 flex items-center justify-center transition",
                    isActive
                      ? "bg-white ring-[#D6DEFF] shadow-[0_10px_24px_rgba(31,42,100,0.10)]"
                      : "bg-[#F3F6FF] ring-[#E6ECFF] group-hover:bg-white",
                  ].join(" ")}
                >
                  <Icon
                    className={[
                      "h-4 w-4 transition",
                      isActive ? "text-[#0B1220]" : "text-[#1F2A64]",
                    ].join(" ")}
                  />
                </span>

                <span
                  className={[
                    "text-sm transition",
                    isActive
                      ? "text-[#0B1220] font-semibold"
                      : "text-[#34406A]",
                  ].join(" ")}
                >
                  {item.label}
                </span>
              </span>

              <span
                className={[
                  "h-2 w-2 rounded-full transition",
                  isActive
                    ? "bg-[#62E9C9] shadow-[0_0_0_4px_rgba(98,233,201,0.18)] animate-[tocPulse_1.8s_ease-in-out_infinite]"
                    : "bg-transparent opacity-0 group-hover:opacity-100 bg-[#62E9C9]/60",
                ].join(" ")}
              />

              <span
                className={[
                  "absolute left-1 top-1/2 -translate-y-1/2 h-7 w-[3px] rounded-full transition",
                  isActive ? "bg-[#1F2A64]" : "bg-transparent",
                ].join(" ")}
              />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
