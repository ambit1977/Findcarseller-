import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { savedSearches, sources } from "@/db/schema";

export const runtime = "nodejs";

const updateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  source: z.enum(sources).optional(),
  keyword: z.string().min(1).max(200).optional(),
  minPrice: z.number().int().nonnegative().nullable().optional(),
  maxPrice: z.number().int().nonnegative().nullable().optional(),
  area: z.string().max(50).nullable().optional(),
  extraParams: z.string().max(500).nullable().optional(),
  active: z.boolean().optional(),
});

function parseId(idStr: string): number | null {
  const n = Number(idStr);
  return Number.isFinite(n) ? n : null;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: idStr } = await params;
  const id = parseId(idStr);
  if (id == null)
    return NextResponse.json({ error: "invalid id" }, { status: 400 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const [updated] = await db
    .update(savedSearches)
    .set(parsed.data)
    .where(eq(savedSearches.id, id))
    .returning();
  if (!updated)
    return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ search: updated });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: idStr } = await params;
  const id = parseId(idStr);
  if (id == null)
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  await db.delete(savedSearches).where(eq(savedSearches.id, id));
  return NextResponse.json({ ok: true });
}
