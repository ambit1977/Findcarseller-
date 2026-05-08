import { NextResponse } from "next/server";
import { pollAll } from "@/lib/poll";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const results = await pollAll();
  return NextResponse.json({
    ok: true,
    polled: results.length,
    results,
  });
}
