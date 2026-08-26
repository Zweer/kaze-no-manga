import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const manga = pgTable(
	"manga",
	{
		id: text("id").primaryKey(),
		source: text("source").notNull(),
		slug: text("slug").notNull(),
		title: text("title").notNull(),
		cover: text("cover").notNull().default(""),
		description: text("description").notNull().default(""),
		status: text("status").notNull().default("unknown"),
		genres: text("genres").notNull().default("[]"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [uniqueIndex("manga_source_slug_uidx").on(table.source, table.slug)],
);
