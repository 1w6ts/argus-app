"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { UserButton } from "@/components/dashboard/user-button";
import { LayoutGrid, Mail, Globe, Webhook, KeyRound, Settings } from "lucide-react";

const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard", icon: LayoutGrid, exact: true },
  { label: "Emails",   href: "/dashboard/emails",   icon: Mail },
  { label: "Domains",  href: "/dashboard/domains",  icon: Globe },
  { label: "Webhooks", href: "/dashboard/webhooks", icon: Webhook },
  { label: "API Keys", href: "/dashboard/api-keys", icon: KeyRound },
];

const BOTTOM_ITEMS = [
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

function NavLink({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors",
        active
          ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
          : "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
      )}
    >
      <Icon
        className={cn(
          "size-4 shrink-0 transition-colors",
          active ? "text-sidebar-foreground" : "text-sidebar-foreground/40"
        )}
      />
      {label}
    </Link>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <aside className="flex h-screen w-[220px] shrink-0 flex-col border-r bg-sidebar">
      {/* Logo — h-12 matches topbar exactly, border-b creates the L-join */}
      <div className="flex h-12 shrink-0 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Argus"
            width={20}
            height={20}
            className="object-contain dark:invert"
          />
          <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">
            Argus
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2 pt-3">
        {NAV_ITEMS.map(({ label, href, icon, exact }) => (
          <NavLink key={href} href={href} icon={icon} label={label} active={isActive(href, exact)} />
        ))}
      </nav>

      {/* Bottom */}
      <div className="flex flex-col gap-0.5 p-2 pb-3">
        <Separator className="mb-2" />
        {BOTTOM_ITEMS.map(({ label, href, icon }) => (
          <NavLink key={href} href={href} icon={icon} label={label} active={isActive(href)} />
        ))}
        <div className="mt-1">
          <UserButton />
        </div>
      </div>
    </aside>
  );
}
