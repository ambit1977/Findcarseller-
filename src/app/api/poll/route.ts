import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { savedSearches } from "@/db/schema";
import { pollAll, pollOne } from "@/lib/poll";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  const url = new URL(req.url);
  const idParam = url.searchParams.get("id");

  if (idParam) {
    const id = Number(idParam);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: "invalid id" }, { status: 400 });
    }
    const [search] = await db
      .select()
      .from(savedSearches)
      .where(eq(savedSearches.id, id));
    if (!search) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const result = await pollOne(search);
    return NextResponse.json({ ok: true, result });
  }

  const results = await pollAll();
  return NextResponse.json({ ok: true, polled: results.length, results });
}
