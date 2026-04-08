"use client";

import Image from "next/image";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const LINKS: Record<string, string[]> = {
  Product:    ["Docs", "Changelog", "Status", "Pricing"],
  Developers: ["SDK Reference", "API Reference", "Webhooks", "React Email"],
  Company:    ["About", "Blog", "Careers", "Contact"],
  Legal:      ["Privacy", "Terms", "Security", "DPA"],
};

const SOCIAL = ["GitHub", "X", "Discord"];

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-6xl px-6 pb-10 pt-16">
        <div className="grid grid-cols-[180px_repeat(4,1fr)] gap-8 pb-12">
          {/* Brand */}
          <div>
            <Link href="/" className="mb-3 flex items-center gap-2">
              <Image src="/logo.png" alt="Argus" width={20} height={20} className="object-contain dark:invert" />
              <span className="text-sm font-semibold tracking-tight text-foreground">Argus</span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Email delivery API built for developers.
            </p>
          </div>

          {Object.entries(LINKS).map(([group, items]) => (
            <div key={group}>
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground">{group}</p>
              <ul className="flex flex-col gap-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <Link
                      href={`/${item.toLowerCase().replace(/\s+/g, "-")}`}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator />

        <div className="flex items-center justify-between pt-6">
          <span className="text-xs text-muted-foreground/60">
            &copy; {new Date().getFullYear()} Argus, Inc.
          </span>
          <div className="flex gap-5">
            {SOCIAL.map((platform) => (
              <Link
                key={platform}
                href="#"
                className="text-xs text-muted-foreground/60 transition-colors hover:text-foreground"
              >
                {platform}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
