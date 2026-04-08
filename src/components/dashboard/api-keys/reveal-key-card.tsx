"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RevealKeyCardProps {
  apiKey: string;
}

export function RevealKeyCard({ apiKey }: RevealKeyCardProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-3">
      <Alert className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
        <AlertDescription className="text-xs text-amber-800 dark:text-amber-300">
          This key will not be shown again. Copy it now and store it somewhere safe.
        </AlertDescription>
      </Alert>
      <div className="flex items-center gap-2 rounded-lg border bg-muted px-3 py-2">
        <code className="flex-1 truncate font-mono text-xs text-foreground">{apiKey}</code>
        <Button variant="ghost" size="icon-sm" onClick={copy} className="shrink-0">
          {copied ? <Check className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />}
        </Button>
      </div>
    </div>
  );
}
