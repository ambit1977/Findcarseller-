import { sourceLabels } from "@/lib/adapters";
import type { Listing } from "@/db/schema";

function formatPrice(price: number | null): string {
  if (price == null) return "価格未掲載";
  return `${price.toLocaleString("ja-JP")} 円`;
}

function timeAgo(date: Date | null): string {
  if (!date) return "";
  const diff = Date.now() - date.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 60) return `${min}分前`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}時間前`;
  const d = Math.floor(hr / 24);
  return `${d}日前`;
}

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <a
      href={listing.url}
      target="_blank"
      rel="noreferrer noopener"
      className={`block rounded-lg border p-3 transition hover:border-blue-400 ${
        listing.seen
          ? "border-neutral-200 dark:border-neutral-800"
          : "border-blue-300 bg-blue-50/50 dark:border-blue-700 dark:bg-blue-950/30"
      }`}
    >
      <div className="flex gap-3">
        {listing.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.thumbnailUrl}
            alt=""
            className="h-20 w-20 flex-shrink-0 rounded object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-20 w-20 flex-shrink-0 rounded bg-neutral-200 dark:bg-neutral-800" />
        )}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2 text-xs text-neutral-500">
            <span className="rounded bg-neutral-200 px-1.5 py-0.5 dark:bg-neutral-800">
              {sourceLabels[listing.source]}
            </span>
            {!listing.seen && (
              <span className="rounded bg-blue-600 px-1.5 py-0.5 text-white">
                NEW
              </span>
            )}
            <span>{timeAgo(listing.firstSeenAt)}</span>
          </div>
          <div className="line-clamp-2 text-sm font-medium">
            {listing.title}
          </div>
          <div className="mt-1 text-base font-semibold text-blue-700 dark:text-blue-400">
            {formatPrice(listing.price)}
          </div>
          {listing.location && (
            <div className="text-xs text-neutral-500">{listing.location}</div>
          )}
        </div>
      </div>
    </a>
  );
}
