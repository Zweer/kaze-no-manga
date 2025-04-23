import { relations, sql } from 'drizzle-orm';
import { boolean, doublePrecision, index, integer, jsonb, pgTable, primaryKey, serial, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';

import { users } from '@/lib/db/schema/auth';

// Table to store manga metadata fetched from external sources
export const manga = pgTable(
  'manga',
  {
    id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(), // UUID PK
    slug: varchar('slug', { length: 255 }).notNull(), // Unique, URL-friendly slug (from first/best import)
    title: varchar('title', { length: 255 }).notNull(),
    author: varchar('author', { length: 255 }),
    artist: varchar('artist', { length: 255 }), // If available separately
    description: text('description'),
    coverUrl: text('cover_url'), // URL to the cover image
    status: varchar('status', { length: 50 }), // e.g., 'Ongoing', 'Completed', 'Hiatus'
    genres: jsonb('genres').$type<string[]>(), // Store genres as a JSON array of strings
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).$onUpdate(() => new Date()), // Auto-update timestamp
  },
  table => [
    {
      slugIndex: uniqueIndex('manga_slug_idx').on(table.slug), // Ensure slug is unique
      titleIndex: index('manga_title_idx').on(table.title),
    },
  ],
);

// Manga Sources Table (NEW) - Links canonical manga to its sources
export const mangaSources = pgTable(
  'manga_sources',
  {
    id: serial('id').primaryKey(), // Simple PK for this table
    mangaId: uuid('manga_id') // Link to the canonical manga entry
      .notNull()
      .references(() => manga.id, { onDelete: 'cascade' }),
    sourceName: varchar('source_name', { length: 100 }).notNull(), // e.g., "ScanSiteX"
    sourceMangaId: text('source_manga_id').notNull(), // ID of the manga on that specific source
    sourceUrl: text('source_url'), // URL to the manga page on that source
    lastChapterChecked: varchar('last_chapter_checked', { length: 50 }), // Last chapter found on THIS source
    lastCheckedAt: timestamp('last_checked_at', { mode: 'date' }), // When THIS source was last checked
    isPreferredSource: boolean('is_preferred_source').default(false), // Maybe mark one source as default for reading?
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  table => [
    {
      // Ensure a manga doesn't have the same source listed twice
      sourceUniqueIndex: uniqueIndex('manga_sources_unique_idx').on(table.mangaId, table.sourceName),
      // Optional: More constrained uniqueness if sourceMangaId is reliable
      // sourceIdUniqueIndex: uniqueIndex('manga_sources_id_unique_idx').on(table.sourceName, table.sourceMangaId),
      // Index for finding sources for a specific manga
      mangaIdIndex: index('manga_sources_manga_id_idx').on(table.mangaId),
    },
  ],
);

// Table to store individual chapters for each manga (NEW)
export const chapters = pgTable(
  'chapters',
  {
    id: serial('id').primaryKey(), // Simple auto-incrementing ID for each chapter entry
    mangaId: uuid('manga_id') // Changed from mangaSlug
      .notNull()
      .references(() => manga.id, { onDelete: 'cascade' }), // Reference manga.id
    chapterNumber: doublePrecision('chapter_number').notNull(), // Optional: Store numeric part for sorting
    title: varchar('title', { length: 255 }), // Optional chapter title
    pages: jsonb('pages').$type<string[]>(), // Optional: Store array of page image URLs if hosted internally (Phase 2)
    publishedAt: timestamp('published_at', { mode: 'date' }), // Optional: When the chapter was published
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  table => [
    {
      // Index for faster lookup of chapters for a specific manga
      mangaIdIndex: index('chapters_manga_id_idx').on(table.mangaId), // Index on mangaId
      // Ensure a manga doesn't have duplicate chapter numbers
      mangaChapterUnique: uniqueIndex('chapters_manga_chapter_unique_idx').on(table.mangaId, table.chapterNumber), // Use mangaId here
      // Optional index for sorting by number if using chapterNumberFloat
      chapterNumFloatIndex: index('chapters_num_float_idx').on(table.chapterNumber),
    },
  ],
);

// Junction table linking users to the manga in their library
export const userLibrary = pgTable(
  'user_library',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    mangaId: uuid('manga_id') // Changed from mangaSlug
      .notNull()
      .references(() => manga.id, { onDelete: 'cascade' }), // Reference manga.id
    lastChapterRead: doublePrecision('last_chapter_read').default(0), // Chapter number/name last read
    addedAt: timestamp('added_at', { mode: 'date' }).defaultNow().notNull(),
    status: varchar('reading_status', { length: 50 }).default('Reading'), // Optional: e.g., Reading, Completed, Paused, Dropped
    rating: integer('rating'), // Optional: User's rating (1-5 or 1-10)
    notes: text('notes'), // Optional: User's private notes
    notificationsEnabled: boolean('notifications_enabled').default(true), // Optional: Toggle notifications per manga
  },
  table => [
    {
      pk: primaryKey({ columns: [table.userId, table.mangaId] }), // Use mangaId here
      statusIndex: index('user_library_status_idx').on(table.status),
    },
  ],
);

// User can have many library entries
export const usersRelations = relations(users, ({ many }) => ({
  libraryEntries: many(userLibrary),
  // accounts: many(accounts), // Add if needed
  // sessions: many(sessions), // Add if needed
}));

// Updated Manga Relations - Now includes mangaSources
export const mangaRelations = relations(manga, ({ many }) => ({
  libraryEntries: many(userLibrary),
  chapters: many(chapters),
  sources: many(mangaSources), // A manga can have multiple sources listed
}));

// NEW MangaSources Relations
export const mangaSourcesRelations = relations(mangaSources, ({ one }) => ({
  manga: one(manga, { // A source entry belongs to one canonical manga
    fields: [mangaSources.mangaId],
    references: [manga.id],
  }),
}));

export const chaptersRelations = relations(chapters, ({ one }) => ({
  manga: one(manga, {
    fields: [chapters.mangaId], // Reference mangaId
    references: [manga.id], // Reference manga.id
  }),
}));

// Each library entry belongs to one user and one manga
export const userLibraryRelations = relations(userLibrary, ({ one }) => ({
  user: one(users, {
    fields: [userLibrary.userId],
    references: [users.id],
  }),
  manga: one(manga, {
    fields: [userLibrary.mangaId], // Reference mangaId
    references: [manga.id], // Reference manga.id
  }),
}));

// --- User Lists Tables (Add later if needed) ---
// export const userLists = pgTable(...)
// export const mangaInList = pgTable(...)
