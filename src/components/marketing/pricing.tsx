"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "Hobby",
    price: "Free",
    period: "",
    description: "Good for side projects and personal tools.",
    cta: "Get started",
    ctaHref: "/signup",
    highlighted: false,
    features: ["3,000 emails per month", "1 domain", "TypeScript & Python SDK", "Delivery webhooks", "7-day log retention", "Community support"],
  },
  {
    name: "Pro",
    price: "$20",
    period: "/month",
    description: "For production apps that send at scale.",
    cta: "Start Pro",
    ctaHref: "/signup?plan=pro",
    highlighted: true,
    features: ["50,000 emails/mo included", "Unlimited domains", "All SDK languages", "Webhooks + event retries", "30-day log retention", "Analytics dashboard", "Priority support"],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Dedicated infrastructure and SLAs.",
    cta: "Talk to us",
    ctaHref: "/contact",
    highlighted: false,
    features: ["Dedicated sending IPs", "Custom domain & BYOD", "99.99% uptime SLA", "90-day log retention", "SAML SSO", "Custom contracts & billing"],
  },
];

export function Pricing() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          ref.current?.querySelectorAll<HTMLElement>("[data-price-card]").forEach((el, i) => {
            setTimeout(() => {
              el.classList.remove("opacity-0", "translate-y-3");
              el.classList.add("opacity-100", "translate-y-0");
            }, i * 80);
          });
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="bg-muted/20 px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Pricing</p>
          <h2
            className="text-[clamp(36px,4vw,52px)] leading-[1.1] tracking-[-0.025em] text-foreground"
            style={{ fontFamily: "'Instrument Serif','Newsreader',serif", fontWeight: 400 }}
          >
            Pay for what you send.
          </h2>
        </div>

        <div ref={ref} className="grid grid-cols-3 items-start gap-4">
          {PLANS.map((plan, i) => (
            <div
              key={plan.name}
              data-price-card
              className={cn(
                "flex flex-col rounded-2xl border p-8 opacity-0 translate-y-3 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                plan.highlighted ? "bg-foreground text-background" : "bg-card"
              )}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <p className={cn("mb-4 text-xs font-semibold uppercase tracking-widest", plan.highlighted ? "text-background/50" : "text-muted-foreground")}>
                {plan.name}
              </p>

              <div className="mb-2 flex items-baseline gap-1">
                <span
                  className={cn("leading-none tracking-[-0.03em]", plan.highlighted ? "text-background" : "text-foreground")}
                  style={{ fontFamily: "'Instrument Serif','Newsreader',serif", fontWeight: 400, fontSize: "clamp(40px,5vw,52px)" }}
                >
                  {plan.price}
                </span>
                {plan.period && (
                  <span className={cn("text-sm", plan.highlighted ? "text-background/40" : "text-muted-foreground")}>
                    {plan.period}
                  </span>
                )}
              </div>

              <p className={cn("mb-7 text-sm leading-relaxed", plan.highlighted ? "text-background/55" : "text-muted-foreground")}>
                {plan.description}
              </p>

              <Button
                variant={plan.highlighted ? "secondary" : "default"}
                className={cn("mb-7 w-full", plan.highlighted && "bg-background/15 text-background hover:bg-background/25 border-background/20")}
                asChild
              >
                <Link href={plan.ctaHref}>{plan.cta}</Link>
              </Button>

              <Separator className={plan.highlighted ? "bg-background/15" : undefined} />

              <ul className="mt-5 flex flex-col gap-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <Check className={cn("size-3.5 shrink-0", plan.highlighted ? "text-background/60" : "text-foreground")} strokeWidth={2.5} />
                    <span className={cn("text-sm", plan.highlighted ? "text-background/65" : "text-muted-foreground")}>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
