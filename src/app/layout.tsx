import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Instrument_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const instrumentSansHeading = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
});

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Argus — Email delivery API for developers",
  description:
    "A simple, reliable email API with official SDKs for TypeScript, Python, Go, Ruby, and PHP. Send transactional email at scale.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        "font-sans",
        inter.variable,
        instrumentSansHeading.variable,
      )}
    >
      <body className="min-h-full flex flex-col dark">{children}</body>
    </html>
  );
}
