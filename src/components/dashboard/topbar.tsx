"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, MessageSquare, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/emails": "Emails",
  "/dashboard/domains": "Domains",
  "/dashboard/webhooks": "Webhooks",
  "/dashboard/api-keys": "API Keys",
  "/dashboard/settings": "Settings",
};

function getTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  for (const [key, val] of Object.entries(PAGE_TITLES)) {
    if (key !== "/dashboard" && pathname.startsWith(key)) return val;
  }
  return "Dashboard";
}

function FeedbackPopover() {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [open, setOpen] = useState(false);

  function handleSubmit() {
    if (!message.trim()) return;
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setMessage("");
      setOpen(false);
    }, 1800);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-muted-foreground">
          <MessageSquare className="size-3.5" />
          Feedback
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" sideOffset={6} className="w-72 p-0 gap-0">
        {sent ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="flex size-8 items-center justify-center rounded-full bg-green-50 ring-1 ring-green-200">
              <Check className="size-4 text-green-600" strokeWidth={2.5} />
            </div>
            <p className="text-sm font-medium text-foreground">Thanks for the feedback!</p>
          </div>
        ) : (
          <>
            <div className="px-4 pb-3 pt-4">
              <p className="text-sm font-medium text-foreground">Send feedback</p>
              <p className="text-xs text-muted-foreground">Help us improve Argus with your thoughts.</p>
            </div>
            <Separator />
            <div className="flex flex-col gap-3 p-4">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What's on your mind?"
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
                }}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" disabled={!message.trim()} onClick={handleSubmit}>
                  Send
                </Button>
              </div>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

export function DashboardTopbar() {
  const pathname = usePathname();
  const title = getTitle(pathname);

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b bg-background px-6">
      <span className="text-sm font-medium text-muted-foreground">{title}</span>

      <div className="flex items-center gap-2">
        <FeedbackPopover />
        <Button variant="outline" size="icon-sm" aria-label="Notifications">
          <Bell className="size-4" />
        </Button>
      </div>
    </header>
  );
}
