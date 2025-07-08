import { relations } from 'drizzle-orm';

import { chapterTable, mangaTable } from '@/lib/db/model/manga';

export const mangaRelations = relations(mangaTable, ({ many }) => ({
  chapters: many(chapterTable),
}));

export const chapterRelations = relations(chapterTable, ({ one }) => ({
  manga: one(mangaTable, {
    fields: [chapterTable.mangaId],
    references: [mangaTable.id],
  }),
}));
