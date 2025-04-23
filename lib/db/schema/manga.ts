import { relations } from 'drizzle-orm';
import { boolean, doublePrecision, index, integer, jsonb, pgTable, primaryKey, serial, text, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core';

import { users } from '@/lib/db/schema/auth';

// Table to store manga metadata fetched from external sources
export const manga = pgTable(
  'manga',
  {
    // Using a URL-friendly slug as the primary key
    slug: varchar('slug', { length: 255 }).primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    author: varchar('author', { length: 255 }),
    artist: varchar('artist', { length: 255 }), // If available separately
    description: text('description'),
    coverUrl: text('cover_url'), // URL to the cover image
    status: varchar('status', { length: 50 }), // e.g., 'Ongoing', 'Completed', 'Hiatus'
    genres: jsonb('genres').$type<string[]>(), // Store genres as a JSON array of strings
    sourceUrl: text('source_url'), // Original source URL where manga was found
    lastChapterChecked: doublePrecision('last_chapter_checked'), // Store last chapter number found by scraper
    lastCheckedAt: timestamp('last_checked_at', { mode: 'date' }), // When scraper last checked
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).$onUpdate(() => new Date()), // Auto-update timestamp
  },
  table => [
    {
      titleIndex: uniqueIndex('manga_title_idx').on(table.title),
    },
  ],
);

// Table to store individual chapters for each manga (NEW)
export const chapters = pgTable(
  'chapters',
  {
    id: serial('id').primaryKey(), // Simple auto-incrementing ID for each chapter entry
    mangaSlug: varchar('manga_slug', { length: 255 })
      .notNull()
      .references(() => manga.slug, { onDelete: 'cascade' }), // Link to the manga
    chapterNumber: doublePrecision('chapter_number'), // Optional: Store numeric part for sorting
    title: varchar('title', { length: 255 }), // Optional chapter title
    sourceUrl: text('source_url'), // URL to read this specific chapter (initially external)
    pages: jsonb('pages').$type<string[]>(), // Optional: Store array of page image URLs if hosted internally (Phase 2)
    publishedAt: timestamp('published_at', { mode: 'date' }), // Optional: When the chapter was published
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  table => [
    {
      // Index for faster lookup of chapters for a specific manga
      mangaSlugIndex: index('chapters_manga_slug_idx').on(table.mangaSlug),
      // Ensure a manga doesn't have duplicate chapter numbers
      // mangaChapterUnique: uniqueIndex('chapters_manga_chapter_unique_idx').on(table.mangaSlug, table.chapterNumber),
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
    mangaSlug: varchar('manga_slug', { length: 255 })
      .notNull()
      .references(() => manga.slug, { onDelete: 'cascade' }), // Link to manga metadata
    lastChapterRead: doublePrecision('last_chapter_read').default(0), // Chapter number/name last read
    addedAt: timestamp('added_at', { mode: 'date' }).defaultNow().notNull(),
    status: varchar('reading_status', { length: 50 }).default('Reading'), // Optional: e.g., Reading, Completed, Paused, Dropped
    rating: integer('rating'), // Optional: User's rating (1-5 or 1-10)
    notes: text('notes'), // Optional: User's private notes
    notificationsEnabled: boolean('notifications_enabled').default(true), // Optional: Toggle notifications per manga
  },
  table => [
    {
      pk: primaryKey({ columns: [table.userId, table.mangaSlug] }),
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

// Manga can be in many user libraries
export const mangaMetadataRelations = relations(manga, ({ many }) => ({
  libraryEntries: many(userLibrary),
}));

// Each library entry belongs to one user and one manga
export const userLibraryRelations = relations(userLibrary, ({ one }) => ({
  user: one(users, {
    fields: [userLibrary.userId],
    references: [users.id],
  }),
  manga: one(manga, {
    fields: [userLibrary.mangaSlug],
    references: [manga.slug],
  }),
}));

// --- User Lists Tables (Add later if needed) ---
// export const userLists = pgTable(...)
// export const mangaInList = pgTable(...)
