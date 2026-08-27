CREATE TABLE "reading_progress" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"manga_id" text NOT NULL,
	"chapter_slug" text NOT NULL,
	"chapter_number" text NOT NULL,
	"read_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "library" ALTER COLUMN "status" SET DEFAULT 'plan_to_read';--> statement-breakpoint
CREATE UNIQUE INDEX "progress_user_manga_chapter_uidx" ON "reading_progress" ("user_id","manga_id","chapter_slug");--> statement-breakpoint
CREATE INDEX "progress_userId_mangaId_idx" ON "reading_progress" ("user_id","manga_id");--> statement-breakpoint
ALTER TABLE "reading_progress" ADD CONSTRAINT "reading_progress_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "reading_progress" ADD CONSTRAINT "reading_progress_manga_id_manga_id_fkey" FOREIGN KEY ("manga_id") REFERENCES "manga"("id") ON DELETE CASCADE;