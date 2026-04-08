"use client";

import { useEffect, useRef } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const QUESTIONS = [
  {
    q: "How is Argus different from Resend or Postmark?",
    a: "Argus is built API-first with a focus on multi-language SDK parity. Every SDK has identical capabilities — no partial implementations. We also expose raw SMTP access, dedicated IP management, and webhook replay without upsells.",
  },
  {
    q: "Which programming languages have an official SDK?",
    a: "TypeScript/JavaScript, Python, Go, Ruby, and PHP are all supported today. Each SDK is maintained by the Argus team, not the community, so they stay in sync with API releases.",
  },
  {
    q: "Can I use my own domain for sending?",
    a: "Yes. You can add any domain you own and verify it via DNS records. Argus walks you through SPF, DKIM, and DMARC setup and confirms alignment before enabling sending.",
  },
  {
    q: "How do I handle bounces and spam complaints?",
    a: "Argus automatically suppresses addresses that hard-bounce or mark messages as spam. You get webhook events for each, and can inspect or clear suppressions via the API or dashboard.",
  },
  {
    q: "Is there a free tier for production use?",
    a: "The Hobby plan (3,000 emails/month) has no time limit and is not a trial. You can use it in production for as long as your volume stays within the threshold.",
  },
  {
    q: "How are webhooks secured?",
    a: "Every webhook POST includes an Argus-Signature header — an HMAC-SHA256 signature computed with your endpoint's secret. The SDK ships a verification helper so you can validate it in one line.",
  },
];

export function FAQ() {
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
      { threshold: 0.1 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="bg-background px-6 py-28">
      <div className="mx-auto max-w-2xl">
        <div className="mb-14">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">FAQ</p>
          <h2
            className="text-[clamp(32px,4vw,48px)] leading-[1.1] tracking-[-0.025em] text-foreground"
            style={{ fontFamily: "'Instrument Serif','Newsreader',serif", fontWeight: 400 }}
          >
            Common questions.
          </h2>
        </div>

        <div
          ref={ref}
          className="opacity-0 translate-y-3 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        >
          <Accordion type="single" collapsible className="rounded-2xl">
            {QUESTIONS.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-base font-medium no-underline hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
