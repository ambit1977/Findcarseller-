import * as cheerio from "cheerio";
import type { AdapterQuery, RawListing, SourceAdapter } from "./types";
import { USER_AGENT } from "./types";

// Jimoty (ジモティー) used-car category. The "all" prefix means nationwide;
// users can override via the `area` field on a saved search (e.g. "tokyo", "osaka").
function buildSearchUrl(query: AdapterQuery): string {
  const area = (query.area ?? "all").toLowerCase();
  const params = new URLSearchParams();
  params.set("keyword", query.keyword);
  params.set("sort", "update");
  if (query.minPrice != null) params.set("min_price", String(query.minPrice));
  if (query.maxPrice != null) params.set("max_price", String(query.maxPrice));
  if (query.extraParams) {
    for (const [k, v] of new URLSearchParams(query.extraParams)) {
      params.set(k, v);
    }
  }
  return `https://jmty.jp/${encodeURIComponent(area)}/sale-car?${params.toString()}`;
}

function parsePrice(text: string): number | null {
  const cleaned = text.replace(/[,，\s]/g, "");
  const m = cleaned.match(/(\d+)/);
  return m ? Number(m[1]) : null;
}

function extractArticleId(href: string): string | null {
  const m = href.match(/article-(\d+)/);
  return m ? m[1] : null;
}

function absoluteUrl(href: string): string {
  if (href.startsWith("http")) return href;
  if (href.startsWith("//")) return `https:${href}`;
  return `https://jmty.jp${href}`;
}

export const jmtyAdapter: SourceAdapter = {
  source: "jmty",

  buildBrowseUrl(query) {
    return buildSearchUrl(query);
  },

  async search(query) {
    const url = buildSearchUrl(query);
    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
      },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Jmty HTTP ${res.status} for ${url}`);
    }
    const html = await res.text();
    const $ = cheerio.load(html);

    const listings: RawListing[] = [];
    // Selector path is intentionally permissive; Jimoty markup occasionally shifts.
    const cards = $(
      'li.p-articles-list-item, [data-testid="article-list-item"], li.js-article-list-item',
    );

    cards.each((_, el) => {
      const $el = $(el);
      const link =
        $el.find("a.p-item-most-important[href]").attr("href") ??
        $el.find("a[href*='/article-']").first().attr("href");
      if (!link) return;
      const id = extractArticleId(link);
      if (!id) return;

      const title =
        $el.find(".p-item-title, .p-articles-list-item-title").first().text().trim() ||
        $el.find("a[href*='/article-']").first().text().trim();

      const priceText = $el
        .find(".p-item-most-important-icon, .p-articles-list-item-price, .p-item-price")
        .first()
        .text()
        .trim();
      const price = parsePrice(priceText);

      const thumb =
        $el.find("img").first().attr("data-original") ??
        $el.find("img").first().attr("data-src") ??
        $el.find("img").first().attr("src") ??
        null;

      const location = $el
        .find(".p-item-supplement, .p-articles-list-item-location")
        .first()
        .text()
        .trim() || null;

      const postedText = $el
        .find(".p-item-supplement-update, time")
        .first()
        .attr("datetime");
      const postedAt = postedText ? new Date(postedText) : null;

      listings.push({
        source: "jmty",
        externalId: id,
        title,
        price,
        url: absoluteUrl(link),
        thumbnailUrl: thumb ? absoluteUrl(thumb) : null,
        location,
        postedAt,
      });
    });

    return listings;
  },
};
