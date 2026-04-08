"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const SDK_SNIPPET = `// TypeScript
const argus = new Argus({ apiKey });

// Python
argus = Argus(api_key=os.environ["ARGUS_API_KEY"])

// Go
client := argus.New(os.Getenv("ARGUS_API_KEY"))`;

const WEBHOOK_SNIPPET = `{
  "event":     "email.delivered",
  "timestamp": "2026-04-08T09:41:00Z",
  "data": {
    "email_id": "em_9xkA2zPq",
    "to":       "user@example.com",
    "latency":  "82ms"
  }
}`;

const TAGS: Record<string, string> = {
  SDK:           "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Deliverability:"bg-green-500/10 text-green-600 dark:text-green-400",
  Webhooks:      "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Analytics:     "bg-red-500/10 text-red-600 dark:text-red-400",
  Templates:     "bg-green-500/10 text-green-600 dark:text-green-400",
};

function Tag({ label }: { label: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wider", TAGS[label])}>
      {label}
    </span>
  );
}

function CodeBlock({ code, small }: { code: string; small?: boolean }) {
  return (
    <pre className={cn("overflow-x-auto rounded-xl border bg-muted/50 font-mono leading-[1.75] text-foreground/75", small ? "px-4 py-3 text-[11px]" : "px-5 py-4 text-[12px]")}>
      <code>{code}</code>
    </pre>
  );
}

export function Features() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          ref.current?.querySelectorAll<HTMLElement>("[data-card]").forEach((el, i) => {
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

  const card = "rounded-2xl border bg-card p-8 opacity-0 translate-y-3 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]";

  return (
    <section className="bg-background px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Platform</p>
          <h2
            className="text-[clamp(36px,4vw,52px)] leading-[1.1] tracking-[-0.025em] text-foreground"
            style={{ fontFamily: "'Instrument Serif','Newsreader',serif", fontWeight: 400, maxWidth: 500 }}
          >
            Everything the email stack needs.
          </h2>
        </div>

        <div ref={ref} className="grid grid-cols-12 gap-4">
          {/* SDK — large */}
          <div data-card className={cn(card, "col-span-7 flex flex-col gap-5")}>
            <Tag label="SDK" />
            <div>
              <h3 className="mb-1.5 text-xl font-semibold tracking-tight text-foreground">One API. Every language.</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Official SDKs for TypeScript, Python, Go, Ruby, and PHP. Idiomatic, typed, and battle-tested.
              </p>
            </div>
            <CodeBlock code={SDK_SNIPPET} />
          </div>

          {/* Deliverability */}
          <div data-card className={cn(card, "col-span-5 flex flex-col gap-5")} style={{ transitionDelay: "80ms" }}>
            <Tag label="Deliverability" />
            <div>
              <h3 className="mb-1.5 text-xl font-semibold tracking-tight text-foreground">99.9% inbox rate</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Argus manages SPF, DKIM, DMARC, and IP warming automatically. Your mail lands in the inbox, not spam.
              </p>
            </div>
            <div className="mt-auto flex flex-col gap-2.5">
              {[
                { label: "Inbox",   pct: 99,  active: true },
                { label: "Spam",    pct: 0.8, active: false },
                { label: "Bounced", pct: 0.2, active: false },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3">
                  <span className="w-14 shrink-0 font-mono text-[11px] text-muted-foreground">{row.label}</span>
                  <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className={cn("h-full rounded-full", row.active ? "bg-foreground" : "bg-border")} style={{ width: `${row.pct}%` }} />
                  </div>
                  <span className="w-9 shrink-0 text-right font-mono text-[11px] text-foreground">{row.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Webhooks */}
          <div data-card className={cn(card, "col-span-5 flex flex-col gap-5")} style={{ transitionDelay: "160ms" }}>
            <Tag label="Webhooks" />
            <div>
              <h3 className="mb-1.5 text-xl font-semibold tracking-tight text-foreground">Real-time delivery events</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Subscribe to delivered, bounced, opened, and clicked events. Signed payloads, retries included.
              </p>
            </div>
            <CodeBlock code={WEBHOOK_SNIPPET} small />
          </div>

          {/* Analytics */}
          <div data-card className={cn(card, "col-span-4 flex flex-col gap-5")} style={{ transitionDelay: "240ms" }}>
            <Tag label="Analytics" />
            <div>
              <h3 className="mb-1.5 text-xl font-semibold tracking-tight text-foreground">Observe every send</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Open rates, click-through, bounce, and complaint rates per domain, template, or time window.
              </p>
            </div>
            <div className="mt-auto flex h-14 items-end gap-1">
              {[30, 45, 38, 60, 52, 70, 65, 80, 72, 88, 76, 92].map((h, i) => (
                <div
                  key={i}
                  className={cn("flex-1 rounded-t-sm", i === 11 ? "bg-foreground" : "bg-border")}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          {/* Templates */}
          <div data-card className={cn(card, "col-span-3 flex flex-col gap-5")} style={{ transitionDelay: "320ms" }}>
            <Tag label="Templates" />
            <div>
              <h3 className="mb-1.5 text-xl font-semibold tracking-tight text-foreground">React Email built in</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Write email templates as React components. Version-controlled, testable, and rendered server-side.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
