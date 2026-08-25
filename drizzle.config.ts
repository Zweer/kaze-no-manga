import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./lib/db/models/index.ts",
	out: "./db",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL_UNPOOLED!,
	},
});
