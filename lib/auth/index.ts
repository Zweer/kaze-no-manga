import { DrizzleAdapter } from '@auth/drizzle-adapter';
import NextAuth from 'next-auth';
import logger from '@/lib/logger';
import { authConfig } from '@/lib/auth/config';
import { db } from '@/lib/db';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  ...authConfig,
  events: {
    async signIn(message) {
      logger.info({ user: message.user, account: message.account, isNewUser: message.isNewUser }, 'User signIn event');
    },
    async signOut(message) {
      logger.info({ session: message.session, token: message.token }, 'User signOut event');
    },
    async createUser(message) {
      logger.info({ user: message.user }, 'User createUser event');
    },
    async updateUser(message) {
      logger.info({ user: message.user }, 'User updateUser event');
    },
    async linkAccount(message) {
      logger.info({ account: message.account, user: message.user }, 'User linkAccount event');
    },
    async session(message) {
      // This event fires when a session is created or updated.
      // The session callback above is probably more useful for session data.
      logger.debug({ session: message.session, token: message.token }, 'Session event');
    },
  },
});
