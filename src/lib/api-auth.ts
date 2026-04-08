import { createHash } from "crypto";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { apiKey } from "@/db/schema";
import { eq } from "drizzle-orm";

export function generateApiKey() {
  const suffix = nanoid(32);
  const rawKey = `arg_live_${suffix}`;
  const keyHash = createHash("sha256").update(rawKey).digest("hex");
  const keyPrefix = rawKey.slice(0, 16);
  return { rawKey, keyHash, keyPrefix };
}

export async function validateApiKey(req: Request) {
  const raw = req.headers.get("Authorization")?.replace("Bearer ", "").trim();
  if (!raw?.startsWith("arg_live_")) return null;
  const hash = createHash("sha256").update(raw).digest("hex");
  const key = await db.query.apiKey.findFirst({
    where: (k, { eq, isNull, and, gt, or }) =>
      and(
        eq(k.keyHash, hash),
        isNull(k.revokedAt),
        or(isNull(k.expiresAt), gt(k.expiresAt, new Date())),
      ),
  });
  if (!key) return null;
  // fire-and-forget
  db.update(apiKey).set({ lastUsedAt: new Date() }).where(eq(apiKey.id, key.id));
  return { userId: key.userId, keyId: key.id };
}
