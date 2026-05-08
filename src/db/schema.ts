import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const sources = ["yahoo_auctions", "jmty"] as const;
export type Source = (typeof sources)[number];

export const savedSearches = pgTable(
  "saved_searches",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    source: text("source").notNull().$type<Source>(),
    keyword: text("keyword").notNull(),
    minPrice: integer("min_price"),
    maxPrice: integer("max_price"),
    area: text("area"),
    extraParams: text("extra_params"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    lastPolledAt: timestamp("last_polled_at", { withTimezone: true }),
    lastError: text("last_error"),
  },
  (t) => ({
    activeIdx: index("saved_searches_active_idx").on(t.active),
  }),
);

export const listings = pgTable(
  "listings",
  {
    id: serial("id").primaryKey(),
    searchId: integer("search_id")
      .notNull()
      .references(() => savedSearches.id, { onDelete: "cascade" }),
    source: text("source").notNull().$type<Source>(),
    externalId: text("external_id").notNull(),
    title: text("title").notNull(),
    price: integer("price"),
    url: text("url").notNull(),
    thumbnailUrl: text("thumbnail_url"),
    location: text("location"),
    postedAt: timestamp("posted_at", { withTimezone: true }),
    firstSeenAt: timestamp("first_seen_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    seen: boolean("seen").notNull().default(false),
  },
  (t) => ({
    uniq: uniqueIndex("listings_search_external_uniq").on(
      t.searchId,
      t.source,
      t.externalId,
    ),
    searchIdx: index("listings_search_idx").on(t.searchId),
    seenIdx: index("listings_seen_idx").on(t.seen),
    firstSeenIdx: index("listings_first_seen_idx").on(t.firstSeenAt),
  }),
);

export type SavedSearch = typeof savedSearches.$inferSelect;
export type NewSavedSearch = typeof savedSearches.$inferInsert;
export type Listing = typeof listings.$inferSelect;
export type NewListing = typeof listings.$inferInsert;
