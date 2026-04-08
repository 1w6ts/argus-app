"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard" },
  { label: "Emails", href: "/dashboard/emails" },
  { label: "Domains", href: "/dashboard/domains" },
  { label: "Webhooks", href: "/dashboard/webhooks" },
];

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();

  async function handleSignOut() {
    await authClient.signOut({
      fetchOptions: { onSuccess: () => router.push("/") },
    });
  }

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "#FFFFFF",
        borderBottom: "1px solid #EAEAEA",
      }}
    >
      <div
        style={{
          maxWidth: "1120px",
          margin: "0 auto",
          padding: "0 24px",
          height: "56px",
          display: "flex",
          alignItems: "center",
          gap: "32px",
        }}
      >
        {/* Logo */}
        <Link
          href="/dashboard"
          style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", flexShrink: 0 }}
        >
          <Image src="/logo.png" alt="Argus" width={22} height={22} style={{ objectFit: "contain" }} />
          <span
            style={{
              fontFamily: "var(--font-sans), sans-serif",
              fontWeight: 600,
              fontSize: "15px",
              color: "#111111",
              letterSpacing: "-0.01em",
            }}
          >
            Argus
          </span>
        </Link>

        {/* Nav links */}
        <nav style={{ display: "flex", alignItems: "center", gap: "4px", flex: 1 }}>
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  fontFamily: "var(--font-sans), sans-serif",
                  fontSize: "13px",
                  fontWeight: active ? 500 : 400,
                  color: active ? "#111111" : "#787774",
                  textDecoration: "none",
                  padding: "5px 10px",
                  borderRadius: "5px",
                  background: active ? "#F7F6F3" : "transparent",
                  transition: "background 150ms, color 150ms",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "#F7F6F3";
                    e.currentTarget.style.color = "#111111";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#787774";
                  }
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User + sign out */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
          {session?.user && (
            <span
              style={{
                fontFamily: "var(--font-sans), sans-serif",
                fontSize: "13px",
                color: "#787774",
              }}
            >
              {session.user.email}
            </span>
          )}
          <button
            onClick={handleSignOut}
            className="btn-press"
            style={{
              fontFamily: "var(--font-sans), sans-serif",
              fontSize: "13px",
              color: "#787774",
              background: "none",
              border: "1px solid #EAEAEA",
              borderRadius: "5px",
              padding: "5px 12px",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#111111";
              e.currentTarget.style.borderColor = "#D0D0D0";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#787774";
              e.currentTarget.style.borderColor = "#EAEAEA";
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
