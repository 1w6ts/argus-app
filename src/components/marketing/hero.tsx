"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const CODE = `import { Argus } from "@argus/sdk";

const argus = new Argus({ apiKey: process.env.ARGUS_API_KEY });

await argus.emails.send({
  from:    "onboarding@yourapp.com",
  to:      "user@example.com",
  subject: "Welcome to the platform",
  html:    "<p>You're in. Let's build something.</p>",
});`;

const ENTER = "opacity-100 translate-y-0";
const HIDDEN = "opacity-0 translate-y-3";
const TRANSITION = "transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]";

export function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = [heroRef.current, codeRef.current].filter(Boolean) as HTMLElement[];
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.remove("opacity-0", "translate-y-3");
            e.target.classList.add("opacity-100", "translate-y-0");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-muted/20 px-6 pb-20 pt-32">
      {/* Ambient glow */}
      <div
        className="argus-blob pointer-events-none absolute left-1/2 top-[20%] h-[520px] w-[860px]"
        style={{ background: "radial-gradient(ellipse at center, hsl(var(--primary)/0.07) 0%, transparent 70%)" }}
      />

      <div ref={heroRef} className={`relative z-10 max-w-2xl text-center ${HIDDEN} ${TRANSITION}`}>
        {/* Badge */}
        <div className="mb-10 inline-flex items-center gap-1.5 rounded-full border bg-muted/60 px-3 py-1">
          <span className="size-1.5 shrink-0 rounded-full bg-green-600" />
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            v1.0 now available
          </span>
        </div>

        <h1
          className="mb-7 text-[clamp(48px,7vw,76px)] leading-[1.08] tracking-[-0.03em] text-foreground"
          style={{ fontFamily: "'Instrument Serif','Newsreader','Playfair Display',serif", fontWeight: 400 }}
        >
          Email delivery built
          <br />
          <span className="italic text-muted-foreground">for developers.</span>
        </h1>

        <p className="mx-auto mb-12 max-w-[520px] text-lg leading-relaxed text-muted-foreground">
          A simple, reliable email API with SDKs for every stack. Send transactional email, track delivery, and handle
          webhooks — without the operational overhead.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/signup">Start for free</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/docs">Read the docs</Link>
          </Button>
        </div>
      </div>

      {/* Code window */}
      <div
        ref={codeRef}
        className={`relative z-10 mt-18 w-full max-w-[680px] overflow-hidden rounded-2xl border bg-card shadow-sm ${HIDDEN} ${TRANSITION} delay-150`}
      >
        {/* Window chrome */}
        <div className="flex items-center gap-1.5 border-b bg-muted/40 px-4 py-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="size-2.5 shrink-0 rounded-full bg-border" />
          ))}
          <span className="ml-2 font-mono text-[11px] text-muted-foreground/60">send-email.ts</span>
        </div>
        <pre className="overflow-x-auto px-8 py-7 font-mono text-[13px] leading-[1.75] text-foreground/80">
          <code>{CODE}</code>
        </pre>
      </div>
    </section>
  );
}
