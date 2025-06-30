import type { AdapterAccountType } from 'next-auth/adapters';

import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const userTable = pgTable('user', {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text(),
  email: text().unique(),
  emailVerified: timestamp({ mode: 'date' }),
  image: text(),
}, user => [
  {
    emailIndex: uniqueIndex('email_index').on(user.email),
  },
]);
export type UserInsert = typeof userTable.$inferInsert;
export type User = typeof userTable.$inferSelect;

export const accountTable = pgTable('account', {
  userId: text()
    .notNull()
    .references(() => userTable.id, { onDelete: 'cascade' }),
  type: text().$type<AdapterAccountType>().notNull(),
  provider: text().notNull(),
  providerAccountId: text().notNull(),
  refresh_token: text(),
  access_token: text(),
  expires_at: integer(),
  token_type: text(),
  scope: text(),
  id_token: text(),
  session_state: text(),
}, account => [
  {
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  },
]);
export type AccountInsert = typeof accountTable.$inferInsert;
export type Account = typeof accountTable.$inferSelect;

export const sessionTable = pgTable('session', {
  sessionToken: text().primaryKey(),
  userId: text()
    .notNull()
    .references(() => userTable.id, { onDelete: 'cascade' }),
  expires: timestamp({ mode: 'date' }).notNull(),
});
export type SessionInsert = typeof sessionTable.$inferInsert;
export type Session = typeof sessionTable.$inferSelect;

export const verificationTokenTable = pgTable('verificationToken', {
  identifier: text().notNull(),
  token: text().notNull(),
  expires: timestamp({ mode: 'date' }).notNull(),
}, verificationToken => [
  {
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  },
]);
export type VerificationTokenInsert = typeof verificationTokenTable.$inferInsert;
export type VerificationToken = typeof verificationTokenTable.$inferSelect;

export const authenticatorTable = pgTable('authenticator', {
  credentialID: text().notNull().unique(),
  userId: text()
    .notNull()
    .references(() => userTable.id, { onDelete: 'cascade' }),
  providerAccountId: text().notNull(),
  credentialPublicKey: text().notNull(),
  counter: integer().notNull(),
  credentialDeviceType: text().notNull(),
  credentialBackedUp: boolean().notNull(),
  transports: text(),
}, authenticator => [
  {
    compositePK: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  },
]);
export type AuthenticatorInsert = typeof authenticatorTable.$inferInsert;
export type Authenticator = typeof authenticatorTable.$inferSelect;
