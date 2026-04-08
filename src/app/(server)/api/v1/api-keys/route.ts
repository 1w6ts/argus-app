import { auth } from "@/lib/auth";
import { db } from "@/db";
import { apiKey } from "@/db/schema";
import { generateApiKey } from "@/lib/api-auth";
import { eq, isNull, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { nanoid } from "nanoid";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });

  const keys = await db
    .select({
      id: apiKey.id,
      name: apiKey.name,
      keyPrefix: apiKey.keyPrefix,
      lastUsedAt: apiKey.lastUsedAt,
      expiresAt: apiKey.expiresAt,
      createdAt: apiKey.createdAt,
      revokedAt: apiKey.revokedAt,
    })
    .from(apiKey)
    .where(eq(apiKey.userId, session.user.id))
    .orderBy(desc(apiKey.createdAt));

  return Response.json(keys);
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" && body.name.trim() ? body.name.trim() : "Default";

  const { rawKey, keyHash, keyPrefix } = generateApiKey();
  const id = nanoid(16);

  await db.insert(apiKey).values({
    id,
    userId: session.user.id,
    name,
    keyHash,
    keyPrefix,
  });

  return Response.json({ id, name, key: rawKey, keyPrefix }, { status: 201 });
}
