import { auth } from "@/lib/auth";
import { db } from "@/db";
import { apiKey } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });

  const { id } = await params;

  const [updated] = await db
    .update(apiKey)
    .set({ revokedAt: new Date() })
    .where(and(eq(apiKey.id, id), eq(apiKey.userId, session.user.id)))
    .returning({ id: apiKey.id });

  if (!updated) return Response.json({ error: { code: "NOT_FOUND", message: "API key not found" } }, { status: 404 });

  return new Response(null, { status: 204 });
}
