"use client";

import { useState } from "react";
import { Plus, Key, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateKeyDialog } from "./create-key-dialog";
import { toast } from "sonner";

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  revokedAt: string | null;
}

interface ApiKeyListProps {
  initialKeys: ApiKey[];
}

function formatDate(iso: string | null) {
  if (!iso) return "Never";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function ApiKeyList({ initialKeys }: ApiKeyListProps) {
  const [keys, setKeys] = useState(initialKeys);
  const [dialogOpen, setDialogOpen] = useState(false);

  async function refresh() {
    const res = await fetch("/api/v1/api-keys");
    if (res.ok) setKeys(await res.json());
  }

  async function revoke(id: string) {
    const res = await fetch(`/api/v1/api-keys/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("API key revoked");
      setKeys((prev) => prev.filter((k) => k.id !== id));
    } else {
      toast.error("Failed to revoke key");
    }
  }

  const active = keys.filter((k) => !k.revokedAt);

  return (
    <>
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground">API Keys</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Keys used to authenticate API requests. Store them securely.
            </p>
          </div>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="size-3.5" />
            Create key
          </Button>
        </div>

        {/* Keys list */}
        <Card className="gap-0 overflow-hidden p-0 shadow-none ring-0 border border-border">
          {active.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-14">
              <div className="flex size-9 items-center justify-center rounded-lg border bg-background">
                <Key className="size-4 text-muted-foreground/40" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">No API keys yet</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Create a key to start sending emails via the API.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
                Create your first key
              </Button>
            </div>
          ) : (
            active.map((key, i) => (
              <div key={key.id}>
                {i > 0 && <Separator />}
                <div className="flex items-center gap-4 px-5 py-4">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted">
                    <Key className="size-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground truncate">{key.name}</span>
                      <Badge variant="secondary" className="font-mono text-xs">
                        {key.keyPrefix}••••••••
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Created {formatDate(key.createdAt)} · Last used {formatDate(key.lastUsedAt)}
                    </span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => revoke(key.id)}
                      >
                        <Trash2 className="size-3.5" />
                        Revoke key
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </Card>
      </div>

      <CreateKeyDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={refresh}
      />
    </>
  );
}
