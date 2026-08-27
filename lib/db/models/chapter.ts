import { pgTable, text, timestamp, real, uniqueIndex, index } from "drizzle-orm/pg-core";
import { manga } from "./manga";

export const chapter = pgTable(
	"chapter",
	{
		id: text("id").primaryKey(),
		mangaId: text("manga_id")
			.notNull()
			.references(() => manga.id, { onDelete: "cascade" }),
		slug: text("slug").notNull(),
		number: real("number").notNull(),
		title: text("title").notNull(),
		releasedAt: timestamp("released_at").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		uniqueIndex("chapter_manga_slug_uidx").on(table.mangaId, table.slug),
		index("chapter_mangaId_idx").on(table.mangaId),
	],
);
