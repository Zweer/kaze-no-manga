import { pgTable, text, timestamp, uniqueIndex, index } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { manga } from "./manga";

export const readingProgress = pgTable(
	"reading_progress",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		mangaId: text("manga_id")
			.notNull()
			.references(() => manga.id, { onDelete: "cascade" }),
		chapterSlug: text("chapter_slug").notNull(),
		chapterNumber: text("chapter_number").notNull(),
		readAt: timestamp("read_at").defaultNow().notNull(),
	},
	(table) => [
		uniqueIndex("progress_user_manga_chapter_uidx").on(
			table.userId,
			table.mangaId,
			table.chapterSlug,
		),
		index("progress_userId_mangaId_idx").on(table.userId, table.mangaId),
	],
);
