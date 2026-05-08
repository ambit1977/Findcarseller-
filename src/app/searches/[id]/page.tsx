import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { listings, savedSearches } from "@/db/schema";
import { getAdapter, sourceLabels } from "@/lib/adapters";
import { ListingCard } from "@/components/ListingCard";
import { PollButton } from "@/components/PollButton";
import { MarkSeenButton } from "@/components/MarkSeenButton";
import { DeleteSearchButton } from "@/components/DeleteSearchButton";

export const dynamic = "force-dynamic";

export default async function SearchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) notFound();

  const [search] = await db
    .select()
    .from(savedSearches)
    .where(eq(savedSearches.id, id));
  if (!search) notFound();

  const items = await db
    .select()
    .from(listings)
    .where(eq(listings.searchId, id))
    .orderBy(desc(listings.firstSeenAt))
    .limit(100);

  const adapter = getAdapter(search.source);
  const browseUrl = adapter.buildBrowseUrl({
    keyword: search.keyword,
    minPrice: search.minPrice,
    maxPrice: search.maxPrice,
    area: search.area,
    extraParams: search.extraParams,
  });

  return (
    <div className="space-y-6">
      <div>
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          ← ダッシュボードに戻る
        </Link>
      </div>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{search.name}</h1>
          <p className="text-sm text-neutral-500">
            {sourceLabels[search.source]} ·「{search.keyword}」
            {search.minPrice != null || search.maxPrice != null
              ? ` · ${search.minPrice ?? ""}〜${search.maxPrice ?? ""}円`
              : ""}
            {search.area ? ` · ${search.area}` : ""}
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            最終巡回:{" "}
            {search.lastPolledAt
              ? new Date(search.lastPolledAt).toLocaleString("ja-JP")
              : "未実行"}
          </p>
          {search.lastError && (
            <p className="mt-1 text-xs text-red-600">
              直近エラー: {search.lastError}
            </p>
          )}
          <p className="mt-1 text-xs">
            <a
              href={browseUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="text-blue-600 hover:underline"
            >
              ブラウザで開く ↗
            </a>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <PollButton searchId={search.id} />
          <MarkSeenButton searchId={search.id} />
          <DeleteSearchButton searchId={search.id} />
        </div>
      </header>

      <section>
        <h2 className="mb-3 text-lg font-semibold">出品 ({items.length} 件)</h2>
        {items.length === 0 ? (
          <p className="text-sm text-neutral-500">
            まだ出品がありません。「今すぐ巡回」を押してください。
          </p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {items.map((l) => (
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
