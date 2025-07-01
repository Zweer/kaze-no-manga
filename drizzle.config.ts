import type { Config } from 'drizzle-kit';

import 'dotenv/config';

declare global {
  // eslint-disable-next-line ts/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL_UNPOOLED: string;
    }
  }
}

if (!process.env.DATABASE_URL_UNPOOLED) {
  throw new Error('DATABASE_URL_UNPOOLED environment variable is required');
}

export default {
  schema: './lib/db/model',
  out: './db',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED,
  },
  verbose: true,
  strict: true,
} satisfies Config;
