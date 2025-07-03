// test/example.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// The pgliteClient is available globally thanks to test/setup.ts
// We need to assert its type for TypeScript.
declare global {
  var pgliteClient: import('@electric-sql/pglite').PGlite;
}

describe('Database Tests with PGlite', () => {
  it('should have the pgliteClient available globally', () => {
    expect(global.pgliteClient).toBeDefined();
  });

  it('should be able to execute a simple query', async () => {
    // Example: Querying the pg_catalog.pg_tables to list tables
    // This is a generic query that should work if migrations ran correctly
    // and the database is initialized.
    const result = await global.pgliteClient.query('SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = \'public\';');

    // Check if the result is not empty and is an array
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBeGreaterThan(0);

    // You can also check for specific tables if you know their names
    // For example, if you have a 'users' table:
    // const tableNames = result.map((row: any) => row.tablename);
    // expect(tableNames).toContain('users');

    console.log('Tables in public schema:', result.map((row: any) => row.tablename));
  });

  it('should be able to query a specific table (e.g., users) if it exists', async () => {
    // This test assumes a 'users' table exists from your migrations.
    // Adjust table and column names based on your actual schema.
    try {
      const users = await global.pgliteClient.query('SELECT * FROM users LIMIT 1;');
      expect(users).toBeInstanceOf(Array); // Even if no users, it should return an empty array
      console.log('Sample user from users table (if any):', users[0]);
    } catch (error) {
      // If the table doesn't exist, this query will throw an error.
      // This might be expected if the 'users' table isn't created by default migrations
      // or if it's part of optional seeding.
      console.warn("Could not query 'users' table. This might be okay if it's not part of initial migrations:", error);
      // Depending on your schema, you might want to expect an error or an empty result.
      // For now, we'll just log a warning.
    }
  });

  // Add more tests here, for example, to:
  // - Insert data into a table and then query it.
  // - Test specific database functions or constraints if applicable.
});

// Note: The global setup in `vitest.config.ts` (`test/setup.ts`)
// handles the creation and teardown of the pgliteClient.
// You don't need beforeAll/afterAll in every test file for client setup/teardown
// unless you need specific per-suite setup that builds on the global client.
