import { boolean, pgTable, primaryKey, real, text, timestamp } from 'drizzle-orm/pg-core';

import { timestamps } from '@/lib/db/model/helpers';
import { chapterTable, mangaTable } from '@/lib/db/model/manga';
import { userTable } from '@/lib/db/model/user';

export const libraryTable = pgTable('library', {
  userId: text()
    .references(() => userTable.id, { onDelete: 'cascade' })
    .notNull(),
  mangaId: text()
    .references(() => mangaTable.id, { onDelete: 'cascade' })
    .notNull(),
  ...timestamps,
}, library => [
  {
    compositeKey: primaryKey({ columns: [library.userId, library.mangaId] }),
  },
]);
export type LibraryInsert = typeof libraryTable.$inferInsert;
export type Library = typeof libraryTable.$inferSelect;

export const readingTable = pgTable('reading', {
  userId: text()
    .references(() => userTable.id, { onDelete: 'cascade' })
    .notNull(),
  chapterId: text()
    .references(() => chapterTable.id, { onDelete: 'cascade' })
    .notNull(),
  percentage: real().default(0).notNull(),
  isCompleted: boolean().default(false).notNull(),
  lastReadAt: timestamp().defaultNow().notNull(),
  ...timestamps,
}, reading => [
  {
    compositeKey: primaryKey({ columns: [reading.userId, reading.chapterId] }),
  },
]);
