import { relations } from 'drizzle-orm';

import { libraryTable } from '@/lib/db/model/library';
import { mangaTable } from '@/lib/db/model/manga';
import { userTable } from '@/lib/db/model/user';

export const libraryRelations = relations(libraryTable, ({ one }) => ({
  user: one(userTable, {
    fields: [libraryTable.userId],
    references: [userTable.id],
  }),
  manga: one(mangaTable, {
    fields: [libraryTable.mangaId],
    references: [mangaTable.id],
  }),
}));
