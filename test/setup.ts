import { resolve } from 'node:path';

import { PgTable } from 'drizzle-orm/pg-core';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { afterAll, afterEach, beforeEach, vi } from 'vitest';

import * as schema from '@/lib/db/model';

vi.mock('@/lib/db', async () => {
  const { PGlite } = await import('@electric-sql/pglite');
  const pgliteInstance = new PGlite(undefined, { debug: 0 });
  const testDbInstance = drizzle(pgliteInstance, { schema, logger: false });

  const migrationsFolder = resolve(__dirname, '..', 'db');
  await migrate(testDbInstance, { migrationsFolder });

  return {
    db: testDbInstance,
  };
});

export async function resetDatabase() {
  const { db } = await import('@/lib/db');

  await Object.values(schema)
    .filter(table => table instanceof PgTable)
    .reduce(async (promise, table) => {
      await promise;
      await db.delete(table);
    }, Promise.resolve());
}

beforeEach(async () => {
  await resetDatabase();
});

afterEach(() => {
  vi.clearAllMocks();
});

afterAll(() => {
  vi.restoreAllMocks();
});
