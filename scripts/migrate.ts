import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';

import 'dotenv/config';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

async function runMigrate() {
  const db = drizzle({ connection: process.env.DATABASE_URL! });

  console.log('⏳ Running migrations using Neon driver...');

  await migrate(db, { migrationsFolder: './drizzle' });
}

const start = Date.now();
runMigrate()
  .then(() => {
    console.log(`✅ Migrations completed in ${Date.now() - start}ms`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(`❌ Migration failed after ${Date.now() - start}ms:`, error);
    process.exit(1);
  });
