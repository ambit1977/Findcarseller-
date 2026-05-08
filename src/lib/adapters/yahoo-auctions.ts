import { XMLParser } from "fast-xml-parser";
import type { AdapterQuery, RawListing, SourceAdapter } from "./types";
import { USER_AGENT } from "./types";

// Category 26318 = 自動車本体 (vehicle body) on Yahoo Auctions.
// Override via extraParams (querystring fragment) if a different category is desired.
const DEFAULT_CATEGORY = "26318";
const RSS_BASE = "https://auctions.yahoo.co.jp/rss/search";

function buildParams(query: AdapterQuery): URLSearchParams {
  const params = new URLSearchParams();
  params.set("p", query.keyword);
  params.set("auccat", DEFAULT_CATEGORY);
  params.set("n", "50");
  if (query.minPrice != null) params.set("aucminprice", String(query.minPrice));
  if (query.maxPrice != null) params.set("aucmaxprice", String(query.maxPrice));
  if (query.extraParams) {
    for (const [k, v] of new URLSearchParams(query.extraParams)) {
      params.set(k, v);
    }
  }
  return params;
}

function parsePrice(input: unknown): number | null {
  if (typeof input !== "string") return null;
  const m = input.replace(/,/g, "").match(/(\d+)\s*円/);
  return m ? Number(m[1]) : null;
}

function extractAuctionId(link: string): string | null {
  const m = link.match(/\/auction\/([a-z0-9]+)/i);
  return m ? m[1] : null;
}

function extractThumbnail(description: string): string | null {
  const m = description.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : null;
}

export const yahooAuctionsAdapter: SourceAdapter = {
  source: "yahoo_auctions",

  buildBrowseUrl(query) {
    const params = buildParams(query);
    return `https://auctions.yahoo.co.jp/search/search?${params.toString()}`;
  },

  async search(query) {
    const params = buildParams(query);
    const url = `${RSS_BASE}?${params.toString()}`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/rss+xml, application/xml, text/xml; q=0.9, */*; q=0.8",
      },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Yahoo RSS HTTP ${res.status} for ${url}`);
    }
    const xml = await res.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
    });
    const data = parser.parse(xml);
    const items = data?.rss?.channel?.item ?? [];
    const list = Array.isArray(items) ? items : [items];

    const listings: RawListing[] = [];
    for (const it of list) {
      if (!it) continue;
      const link: string = it.link ?? "";
      const id = extractAuctionId(link);
      if (!id) continue;
      const title: string = (it.title ?? "").toString().trim();
      const description: string = (it.description ?? "").toString();
      const pubDate: string | undefined = it.pubDate;
      const price = parsePrice(description) ?? parsePrice(title);
      listings.push({
        source: "yahoo_auctions",
        externalId: id,
        title,
        price,
        url: link,
        thumbnailUrl: extractThumbnail(description),
        location: null,
        postedAt: pubDate ? new Date(pubDate) : null,
      });
    }
    return listings;
  },
};
