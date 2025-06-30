import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';

import * as schema from '@/lib/db/model';

declare global {
  // eslint-disable-next-line ts/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
    }
  }
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

export const db = drizzle({
  connection: process.env.DATABASE_URL,
  schema,
  logger: true,
  ws,
});
