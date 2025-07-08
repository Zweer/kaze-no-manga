import { describe, expect, it } from 'vitest';

import { db } from '@/lib/db';
import { userTable } from '@/lib/db/model';

describe('database Tests with PGlite', () => {
  it('should have the pgliteClient available globally', () => {
    expect(db).toBeDefined();
  });

  it('should be able to execute a simple query', async () => {
    const result = await db.execute('SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = \'public\';');

    expect(result).toHaveProperty('rows');
    expect(result.rows).toHaveLength(9);
  });

  it('should be able to query a specific table (e.g., users) after adding a record', async () => {
    await db.insert(userTable).values({});

    const users = await db.query.userTable.findMany();

    expect(users).toHaveLength(1);
  });
});
