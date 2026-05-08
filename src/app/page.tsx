import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { listings, savedSearches } from "@/db/schema";
import { sourceLabels } from "@/lib/adapters";
import { ListingCard } from "@/components/ListingCard";
import { PollButton } from "@/components/PollButton";
import { MarkSeenButton } from "@/components/MarkSeenButton";

export const dynamic = "force-dynamic";

export default async function Home() {
  const searches = await db
    .select()
    .from(savedSearches)
    .orderBy(desc(savedSearches.createdAt));

  const recent = await db
    .select()
    .from(listings)
    .orderBy(desc(listings.firstSeenAt))
    .limit(50);

  const unseenRows = await db
    .select({
      searchId: listings.searchId,
      count: sql<number>`cast(count(*) as int)`,
    })
    .from(listings)
    .where(eq(listings.seen, false))
    .groupBy(listings.searchId);
  const unseenBySearch = new Map(unseenRows.map((r) => [r.searchId, r.count]));
  const totalUnseen = unseenRows.reduce((n, r) => n + (r.count ?? 0), 0);

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">ダッシュボード</h1>
          <p className="text-sm text-neutral-500">
            未読 {totalUnseen} 件 / 検索条件 {searches.length} 件
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PollButton />
          <MarkSeenButton all />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">保存した検索条件</h2>
        {searches.length === 0 ? (
          <p className="text-sm text-neutral-500">
            まだ検索条件がありません。{" "}
            <Link href="/searches/new" className="text-blue-600 underline">
              追加する
            </Link>
          </p>
        ) : (
          <ul className="grid gap-2 md:grid-cols-2">
            {searches.map((s) => (
              <li
                key={s.id}
                className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-medium">
                      <Link
                        href={`/searches/${s.id}`}
                        className="hover:underline"
                      >
                        {s.name}
                      </Link>
                      {(unseenBySearch.get(s.id) ?? 0) > 0 && (
                        <span className="ml-2 rounded bg-blue-600 px-1.5 py-0.5 text-xs text-white">
                          {unseenBySearch.get(s.id)} 新着
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {sourceLabels[s.source]} · {s.keyword}
                      {s.minPrice != null || s.maxPrice != null
                        ? ` · ${s.minPrice ?? ""}〜${s.maxPrice ?? ""}円`
                        : ""}
                    </div>
                    {s.lastError && (
                      <div className="mt-1 text-xs text-red-600">
                        直近エラー: {s.lastError}
                      </div>
                    )}
                  </div>
                  <span
                    className={`rounded px-1.5 py-0.5 text-xs ${
                      s.active
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                        : "bg-neutral-200 text-neutral-600 dark:bg-neutral-800"
                    }`}
                  >
                    {s.active ? "有効" : "停止"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">最新の出品 (上位50件)</h2>
        {recent.length === 0 ? (
          <p className="text-sm text-neutral-500">
            まだ取得した出品がありません。検索条件を追加して「今すぐ巡回」を押してください。
          </p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {recent.map((l) => (
              <li key={l.id}>
                <ListingCard listing={l} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
