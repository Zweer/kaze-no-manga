import {
  index,
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

import { timestamps } from '@/lib/db/model/helpers';

export const mangaTable = pgTable('manga', {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  sourceName: text().notNull(),
  sourceId: text().notNull(),
  title: text().notNull(),
  excerpt: text(),
  author: text(),
  slug: text().notNull().unique(),
  image: text().notNull(),
  status: text().notNull(),
  chaptersCount: integer().notNull(),
  lastCheckedAt: timestamp({ mode: 'date' }),
  ...timestamps,
}, manga => [
  {
    sourceUniqueIndex: uniqueIndex('source_unique_index').on(manga.sourceName, manga.sourceId),
    slugIndex: uniqueIndex('slug_index').on(manga.slug),
    lastCheckedAtIndex: index('last_checked_at_index').on(manga.lastCheckedAt.nullsFirst()),
  },
]);
export type MangaInsert = typeof mangaTable.$inferInsert;
export type Manga = typeof mangaTable.$inferSelect;

export const chapterTable = pgTable('chapter', {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  sourceName: text().notNull(),
  sourceId: text().notNull(),
  mangaId: text()
    .references(() => mangaTable.id, { onDelete: 'cascade' })
    .notNull(),
  title: text(),
  index: real().notNull(),
  releasedAt: timestamp({ withTimezone: true }),
  images: jsonb().$type<string[]>().notNull(),
  ...timestamps,
}, chapter => [
  {
    sourceUniqueIndex: uniqueIndex('source_unique_index').on(chapter.sourceName, chapter.sourceId),
    mangaIdIndex: index('manga_id_index').on(chapter.mangaId),
    indexIndex: uniqueIndex('index_unique_index').on(chapter.mangaId, chapter.index),
  },
]);
export type ChapterInsert = typeof chapterTable.$inferInsert;
export type Chapter = typeof chapterTable.$inferSelect;
