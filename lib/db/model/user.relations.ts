import { relations } from 'drizzle-orm';

import { libraryTable } from '@/lib/db/model/library';
import { userTable } from '@/lib/db/model/user';

export const userRelations = relations(userTable, ({ many }) => ({
  libraries: many(libraryTable),
}));
