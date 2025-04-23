ALTER TABLE "chapters" RENAME COLUMN "chapter_number_float" TO "chapter_number";--> statement-breakpoint
ALTER TABLE "manga" DROP COLUMN "last_chapter_checked";--> statement-breakpoint
ALTER TABLE "user_library" DROP COLUMN "last_chapter_read";