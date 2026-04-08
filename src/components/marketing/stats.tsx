"use client";

import { useEffect, useRef } from "react";
import { Separator } from "@/components/ui/separator";

const STATS = [
  { value: "99.9%",  label: "Delivery rate" },
  { value: "<100ms", label: "API response time" },
  { value: "50B+",   label: "Emails delivered" },
  { value: "180+",   label: "Countries reached" },
];

export function Stats() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          ref.current?.querySelectorAll<HTMLElement>("[data-stat]").forEach((el, i) => {
            setTimeout(() => {
              el.classList.remove("opacity-0", "translate-y-3");
              el.classList.add("opacity-100", "translate-y-0");
            }, i * 80);
          });
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="border-y bg-muted/20">
      <div ref={ref} className="mx-auto grid max-w-6xl grid-cols-4 px-6">
        {STATS.map((stat, i) => (
          <div key={stat.label} className="flex items-stretch">
            <div
              data-stat
              className="flex flex-1 flex-col gap-2 px-8 py-12 opacity-0 translate-y-3 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            >
              <span
                className="text-[42px] leading-none tracking-tight text-foreground"
                style={{ fontFamily: "'Instrument Serif','Newsreader',serif", fontWeight: 400 }}
              >
                {stat.value}
              </span>
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
            {i < STATS.length - 1 && <Separator orientation="vertical" className="self-stretch" />}
          </div>
        ))}
      </div>
    </section>
  );
}
