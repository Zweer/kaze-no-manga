ALTER TABLE "manga" ADD COLUMN "last_chapter_checked" double precision;--> statement-breakpoint
ALTER TABLE "user_library" ADD COLUMN "last_chapter_read" double precision DEFAULT 0;