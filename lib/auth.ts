import { PrismaAdapter } from '@auth/prisma-adapter';
import { User as UserModel } from '@prisma/client';
import NextAuth, { type DefaultSession } from 'next-auth';
import Google from 'next-auth/providers/google';
import Passkey from 'next-auth/providers/passkey';

import { prisma } from '@/lib/db';

export enum Role {
  User = 0,
  Member = 1,
  Admin = 10,
}

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: UserModel;
  }

  interface User {
    role?: Role;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google, Passkey],
  experimental: {
    enableWebAuthn: true,
  },
});
