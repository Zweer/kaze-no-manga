import type { AuthConfig } from '@auth/core/types';

import Google from '@auth/core/providers/google';

export const authConfig = {
  providers: [Google],
  session: { strategy: 'jwt' },
  callbacks: {
    /**
     * Called after successful sign in, before JWT is created.
     * Use this to add custom data to the JWT payload.
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // You could potentially add user roles or other static info here
        // token.role = user.role; // Assuming user object has a role property from adapter
      }

      return token;
    },

    /**
     * Called whenever a session is checked (client-side or server-side).
     * Use this to expose data from the JWT to the client-side session object.
     */
    async session({ session, token }) {
      // Add the user ID (from the JWT's `id` property) to the session's user object
      // This makes the user ID available in useSession() hook and server-side auth()
      if (token?.id && session.user) {
        session.user.id = token.id as string;
        // Add other properties from the token if needed
        // session.user.role = token.role;
      }

      return session;
    },
  },
  pages: { // Required if you want a custom login page
    signIn: '/login',
    // error: '/auth/error', // Optional custom error page
  },
} satisfies AuthConfig;
