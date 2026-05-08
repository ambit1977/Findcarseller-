import type { Source } from "@/db/schema";

export type RawListing = {
  source: Source;
  externalId: string;
  title: string;
  price: number | null;
  url: string;
  thumbnailUrl: string | null;
  location: string | null;
  postedAt: Date | null;
};

export type AdapterQuery = {
  keyword: string;
  minPrice?: number | null;
  maxPrice?: number | null;
  area?: string | null;
  extraParams?: string | null;
};

export interface SourceAdapter {
  source: Source;
  search(query: AdapterQuery): Promise<RawListing[]>;
  buildBrowseUrl(query: AdapterQuery): string;
}

export const USER_AGENT =
  process.env.USER_AGENT ??
  "Mozilla/5.0 (compatible; FindcarsellerBot/0.1; +https://example.com)";
