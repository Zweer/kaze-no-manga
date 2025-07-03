import { PGlite } from '@electric-sql/pglite';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

// Enhance the global scope to include 'pgliteClient'
declare global {
  var pgliteClient: PGlite;
}

const MIGRATIONS_DIR = path.join(__dirname, '../db');

async function runMigrations(db: PGlite) {
  console.log('Applying migrations...');
  try {
    const migrationFiles = (await fs.readdir(MIGRATIONS_DIR))
      .filter(file => file.endsWith('.sql'))
      .sort(); // Ensures migrations are run in order

    if (migrationFiles.length === 0) {
      console.log('No migration files found in db/');
      return;
    }

    for (const file of migrationFiles) {
      const filePath = path.join(MIGRATIONS_DIR, file);
      const sql = await fs.readFile(filePath, 'utf-8');
      console.log(`Executing migration: ${file}`);
      // PGlite can execute multi-statement SQL strings directly
      await db.exec(sql);
    }
    console.log('Migrations applied successfully.');
  } catch (error) {
    console.error('Error applying migrations:', error);
    // Optionally, rethrow or handle more gracefully depending on test requirements
    throw error;
  }
}

async function setup() {
  console.log('Setting up in-memory PGlite database for tests...');
  const pglite = new PGlite('memory'); // In-memory database

  try {
    await pglite.waitReady; // Ensure the database is ready
    console.log('PGlite database is ready.');

    // Make the client available globally for tests
    // Vitest's `globals: true` will make this accessible in test files
    global.pgliteClient = pglite;

    await runMigrations(pglite);

    console.log('Test setup complete. PGlite client is available on global.pgliteClient');
  } catch (error) {
    console.error('Failed to initialize PGlite or run migrations:', error);
    process.exit(1); // Exit if setup fails, as tests would be unreliable
  }
}

async function teardown() {
  console.log('Tearing down PGlite database...');
  if (global.pgliteClient) {
    try {
      await global.pgliteClient.close();
      console.log('PGlite database closed.');
    } catch (error) {
      console.error('Error closing PGlite database:', error);
    }
  }
}

// Vitest global setup executes the default export or a function named 'setup'
// It also supports returning a teardown function.
export default async () => {
  await setup();
  // Return the teardown function to be called after all tests
  return async () => {
    await teardown();
  };
};
