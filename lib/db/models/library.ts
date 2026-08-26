import { pgTable, text, timestamp, uniqueIndex, index } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { manga } from "./manga";

export const library = pgTable(
	"library",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		mangaId: text("manga_id")
			.notNull()
			.references(() => manga.id, { onDelete: "cascade" }),
		status: text("status").notNull().default("reading"),
		addedAt: timestamp("added_at").defaultNow().notNull(),
	},
	(table) => [
		uniqueIndex("library_user_manga_uidx").on(table.userId, table.mangaId),
		index("library_userId_idx").on(table.userId),
	],
);
