import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { listings, savedSearches, type SavedSearch } from "@/db/schema";
import { getAdapter } from "@/lib/adapters";

export type PollResult = {
  searchId: number;
  fetched: number;
  inserted: number;
  error: string | null;
};

export async function pollOne(search: SavedSearch): Promise<PollResult> {
  const adapter = getAdapter(search.source);
  try {
    const raw = await adapter.search({
      keyword: search.keyword,
      minPrice: search.minPrice,
      maxPrice: search.maxPrice,
      area: search.area,
      extraParams: search.extraParams,
    });

    let inserted = 0;
    if (raw.length > 0) {
      const rows = raw.map((r) => ({
        searchId: search.id,
        source: r.source,
        externalId: r.externalId,
        title: r.title,
        price: r.price ?? null,
        url: r.url,
        thumbnailUrl: r.thumbnailUrl,
        location: r.location,
        postedAt: r.postedAt,
      }));
      const result = await db
        .insert(listings)
        .values(rows)
        .onConflictDoNothing({
          target: [listings.searchId, listings.source, listings.externalId],
        })
        .returning({ id: listings.id });
      inserted = result.length;
    }

    await db
      .update(savedSearches)
      .set({ lastPolledAt: new Date(), lastError: null })
      .where(eq(savedSearches.id, search.id));

    return { searchId: search.id, fetched: raw.length, inserted, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await db
      .update(savedSearches)
      .set({ lastPolledAt: new Date(), lastError: message })
      .where(eq(savedSearches.id, search.id));
    return { searchId: search.id, fetched: 0, inserted: 0, error: message };
  }
}

export async function pollAll(): Promise<PollResult[]> {
  const active = await db
    .select()
    .from(savedSearches)
    .where(eq(savedSearches.active, true));

  const results: PollResult[] = [];
  // Sequential to be polite to upstream sites.
  for (const s of active) {
    results.push(await pollOne(s));
  }
  return results;
}

export async function unseenCount(searchId?: number): Promise<number> {
  const where = searchId
    ? and(eq(listings.searchId, searchId), eq(listings.seen, false))
    : eq(listings.seen, false);
  const [{ count }] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(listings)
    .where(where);
  return count ?? 0;
}
