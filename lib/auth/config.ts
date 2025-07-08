import type { AuthConfig } from '@auth/core/types';
import Google from '@auth/core/providers/google';
import logger from '@/lib/logger';

export const authConfig = {
  providers: [Google],
  session: { strategy: 'jwt' },
  callbacks: {
    /**
     * Called after successful sign in, before JWT is created.
     * Use this to add custom data to the JWT payload.
     */
    async jwt({ token, user, account, profile, isNewUser }) {
      logger.debug({ tokenId: token?.jti, userId: user?.id, accountProvider: account?.provider }, 'JWT callback invoked.');
      if (user) {
        token.id = user.id;
        logger.info({ userId: user.id, isNewUser }, 'User data present in JWT callback, mapping user ID to token.');
        // You could potentially add user roles or other static info here
        // token.role = user.role; // Assuming user object has a role property from adapter
        // logger.debug({ userId: user.id, role: user.role }, 'User role added to token.');
      }
      if (account) {
        logger.debug({ userId: token.id, provider: account.provider, accountId: account.providerAccountId }, 'Account details available in JWT callback.');
      }
      if (isNewUser) {
        logger.info({ userId: user?.id, provider: account?.provider }, 'New user detected during JWT callback.');
      }

      return token;
    },

    /**
     * Called whenever a session is checked (client-side or server-side).
     * Use this to expose data from the JWT to the client-side session object.
     */
    async session({ session, token }) {
      logger.debug({ userId: token?.id, sessionExpires: session.expires }, 'Session callback invoked.');
      // Add the user ID (from the JWT's `id` property) to the session's user object
      // This makes the user ID available in useSession() hook and server-side auth()
      if (token?.id && session.user) {
        session.user.id = token.id as string;
        logger.info({ userId: session.user.id, sessionExpires: session.expires }, 'User ID mapped to session object.');
        // Add other properties from the token if needed
        // session.user.role = token.role;
        // logger.debug({ userId: session.user.id, role: session.user.role }, 'User role mapped to session object.');
      } else {
        if (!token?.id) logger.warn('Token ID not found in session callback.');
        if (!session.user) logger.warn('Session user object not found in session callback.');
      }

      return session;
    },
  },
  pages: { // Required if you want a custom login page
    signIn: '/login',
    // error: '/auth/error', // Optional custom error page
  },
} satisfies AuthConfig;
