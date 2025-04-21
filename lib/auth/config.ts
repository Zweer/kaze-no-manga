import type { AuthConfig } from '@auth/core/types';

import process from 'node:process';

import Google from '@auth/core/providers/google';

export const authConfig = {
  debug: process.env.NODE_ENV !== 'production',
  providers: [Google],
  session: { strategy: 'jwt' },
  callbacks: {
    /**
     * Called after successful sign in, before JWT is created.
     * Use this to add custom data to the JWT payload.
     */
    async jwt({ token, user }) {
      // On the first sign-in after authentication via an OAuth provider
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

    /**
     * Optional: Control access to pages using the authorized callback.
     * This runs in the middleware (Edge).
     * If you return false or redirect, the user won't reach the page.
     */
    // authorized({ auth, request: { nextUrl } }) {
    //   const isLoggedIn = !!auth?.user;
    //   const paths = ["/library", "/lists"]; // Add protected paths here
    //   const isProtected = paths.some((path) => nextUrl.pathname.startsWith(path));

    //   if (isProtected && !isLoggedIn) {
    //     // Redirect unauthenticated users to login page for protected routes
    //     const redirectUrl = new URL("/api/auth/signin", nextUrl.origin); // Or your custom login page
    //     redirectUrl.searchParams.append("callbackUrl", nextUrl.href);
    //     return Response.redirect(redirectUrl);
    //   }
    //   return true; // Allow access otherwise
    // },
  },
} satisfies AuthConfig;
