import { NextResponse } from "next/server";
import { z } from "zod";
import { desc } from "drizzle-orm";
import { db } from "@/db/client";
import { savedSearches, sources } from "@/db/schema";

export const runtime = "nodejs";

const createSchema = z.object({
  name: z.string().min(1).max(120),
  source: z.enum(sources),
  keyword: z.string().min(1).max(200),
  minPrice: z.number().int().nonnegative().nullable().optional(),
  maxPrice: z.number().int().nonnegative().nullable().optional(),
  area: z.string().max(50).nullable().optional(),
  extraParams: z.string().max(500).nullable().optional(),
  active: z.boolean().optional(),
});

export async function GET() {
  const rows = await db
    .select()
    .from(savedSearches)
    .orderBy(desc(savedSearches.createdAt));
  return NextResponse.json({ searches: rows });
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const [created] = await db
    .insert(savedSearches)
    .values({
      name: parsed.data.name,
      source: parsed.data.source,
      keyword: parsed.data.keyword,
      minPrice: parsed.data.minPrice ?? null,
      maxPrice: parsed.data.maxPrice ?? null,
      area: parsed.data.area ?? null,
      extraParams: parsed.data.extraParams ?? null,
      active: parsed.data.active ?? true,
    })
    .returning();
  return NextResponse.json({ search: created }, { status: 201 });
}
