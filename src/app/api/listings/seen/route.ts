import { NextResponse } from "next/server";
import { z } from "zod";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { listings } from "@/db/schema";

export const runtime = "nodejs";

const schema = z.object({
  ids: z.array(z.number().int()).min(1).optional(),
  searchId: z.number().int().optional(),
  all: z.boolean().optional(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const { ids, searchId, all } = parsed.data;

  if (ids && ids.length) {
    await db
      .update(listings)
      .set({ seen: true })
      .where(inArray(listings.id, ids));
  } else if (searchId) {
    await db
      .update(listings)
      .set({ seen: true })
      .where(eq(listings.searchId, searchId));
  } else if (all) {
    await db.update(listings).set({ seen: true });
  } else {
    return NextResponse.json({ error: "no target" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
