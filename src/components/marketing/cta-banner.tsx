"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CtaBanner() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          ref.current!.classList.remove("opacity-0", "translate-y-3");
          ref.current!.classList.add("opacity-100", "translate-y-0");
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="border-t bg-muted/20 px-6 pb-28 pt-20">
      <div
        ref={ref}
        className="mx-auto max-w-2xl text-center opacity-0 translate-y-3 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
      >
        <Image
          src="/logo.png"
          alt="Argus"
          width={40}
          height={40}
          className="mx-auto mb-7 object-contain dark:invert"
        />

        <h2
          className="mb-5 text-[clamp(36px,5vw,56px)] leading-[1.1] tracking-[-0.03em] text-foreground"
          style={{ fontFamily: "'Instrument Serif','Newsreader',serif", fontWeight: 400 }}
        >
          Send your first email
          <br />
          <span className="italic text-muted-foreground">in under five minutes.</span>
        </h2>

        <p className="mx-auto mb-10 max-w-sm text-base leading-relaxed text-muted-foreground">
          Start with 3,000 free emails per month. No credit card required.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/signup">Create free account</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/docs/quickstart">Quickstart guide</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
