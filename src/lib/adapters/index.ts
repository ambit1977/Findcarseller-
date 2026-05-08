import type { Source } from "@/db/schema";
import type { SourceAdapter } from "./types";
import { yahooAuctionsAdapter } from "./yahoo-auctions";
import { jmtyAdapter } from "./jmty";

const adapters: Record<Source, SourceAdapter> = {
  yahoo_auctions: yahooAuctionsAdapter,
  jmty: jmtyAdapter,
};

export function getAdapter(source: Source): SourceAdapter {
  const a = adapters[source];
  if (!a) throw new Error(`Unknown source: ${source}`);
  return a;
}

export const sourceLabels: Record<Source, string> = {
  yahoo_auctions: "ヤフオク",
  jmty: "ジモティー",
};

export type { SourceAdapter, RawListing, AdapterQuery } from "./types";
