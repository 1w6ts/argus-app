import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const STATS = [
  { label: "Sent this month", value: "0",  sub: "emails" },
  { label: "Delivered",       value: "—",  sub: "0% delivery rate" },
  { label: "Failed",          value: "0",  sub: "bounces + rejections" },
  { label: "Avg delivery",    value: "—",  sub: "milliseconds" },
];

const TABLE_COLS = ["To", "Subject", "Status", "Sent"];

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const firstName = session?.user.name?.split(" ")[0] ?? "there";

  return (
    <div className="flex flex-col gap-5">
      {/* Page header */}
      <div className="pt-1">
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          Good morning, {firstName}
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening with your emails.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-3">
        {STATS.map((stat) => (
          <Card key={stat.label} size="sm" className="shadow-none ring-0 border border-border">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-normal text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-0.5">
              <span className="text-2xl font-semibold tracking-tight text-foreground">
                {stat.value}
              </span>
              <span className="text-xs text-muted-foreground">{stat.sub}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent emails table */}
      <Card className="gap-0 overflow-hidden p-0 shadow-none ring-0 border border-border">
        <div className="flex items-center justify-between px-5 py-3.5">
          <span className="text-sm font-medium text-foreground">Recent emails</span>
          <Badge variant="secondary" className="text-xs">Last 30 days</Badge>
        </div>

        <Separator />

        <div className="grid grid-cols-[2fr_1.5fr_1fr_100px] bg-muted/30 px-5 py-2">
          {TABLE_COLS.map((col) => (
            <span key={col} className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
              {col}
            </span>
          ))}
        </div>

        <Separator />

        {/* Empty state */}
        <div className="flex flex-col items-center gap-3 py-14">
          <div className="flex size-9 items-center justify-center rounded-lg border bg-background">
            <Mail className="size-4 text-muted-foreground/40" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">No emails sent yet</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Install the SDK and send your first email to see it here.
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/docs/quickstart">View quickstart guide</Link>
          </Button>
        </div>
      </Card>

      {/* API key callout */}
      <Card className="shadow-none ring-0 border border-border flex-row items-center justify-between gap-4 py-4">
        <CardContent className="flex flex-col gap-0.5 px-5 py-0">
          <p className="text-sm font-medium text-foreground">Your API key</p>
          <p className="text-xs text-muted-foreground">
            Use this to authenticate requests from your application.
          </p>
        </CardContent>
        <CardContent className="flex shrink-0 items-center gap-2 px-5 py-0">
          <code className="rounded-md border bg-muted px-3 py-1.5 font-mono text-xs text-muted-foreground">
            arg_live_••••••••••••••••
          </code>
          <Button size="sm" asChild>
            <Link href="/dashboard/settings/api-keys">Manage keys</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
