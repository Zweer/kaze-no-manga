import { boolean, integer, pgEnum, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core';

// ─── Better Auth Core Tables ───

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  idToken: text('id_token'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ─── Passkey Plugin Table ───

export const passkey = pgTable('passkey', {
  id: text('id').primaryKey(),
  name: text('name'),
  publicKey: text('public_key').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  credentialId: text('credential_id').notNull().unique(),
  counter: text('counter').notNull().default('0'),
  deviceType: text('device_type'),
  backedUp: boolean('backed_up').default(false),
  transports: text('transports'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ─── Application Tables ───

export const manga = pgTable(
  'manga',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    cover: text('cover'),
    source: text('source').notNull(),
    sourceId: text('source_id').notNull(),
    sourceUrl: text('source_url').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [unique('manga_source_source_id_unique').on(t.source, t.sourceId)],
);

export const chapter = pgTable(
  'chapter',
  {
    id: text('id').primaryKey(),
    mangaId: text('manga_id')
      .notNull()
      .references(() => manga.id, { onDelete: 'cascade' }),
    number: integer('number').notNull(),
    title: text('title'),
    sourceUrl: text('source_url').notNull(),
    imagesOnR2: boolean('images_on_r2').notNull().default(false),
    pageCount: integer('page_count'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [unique('chapter_manga_id_number_unique').on(t.mangaId, t.number)],
);

export const libraryStatusEnum = pgEnum('library_status', [
  'reading',
  'completed',
  'plan_to_read',
  'dropped',
  'on_hold',
]);

export const library = pgTable(
  'library',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    mangaId: text('manga_id')
      .notNull()
      .references(() => manga.id, { onDelete: 'cascade' }),
    status: libraryStatusEnum('status').notNull().default('reading'),
    addedAt: timestamp('added_at').notNull().defaultNow(),
  },
  (t) => [unique('library_user_id_manga_id_unique').on(t.userId, t.mangaId)],
);

export const readingProgress = pgTable(
  'reading_progress',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    mangaId: text('manga_id')
      .notNull()
      .references(() => manga.id, { onDelete: 'cascade' }),
    chapterId: text('chapter_id')
      .notNull()
      .references(() => chapter.id, { onDelete: 'cascade' }),
    readAt: timestamp('read_at').notNull().defaultNow(),
  },
  (t) => [unique('reading_progress_user_chapter_unique').on(t.userId, t.chapterId)],
);
