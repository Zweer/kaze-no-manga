CREATE TABLE "chapter" (
	"id" text PRIMARY KEY,
	"manga_id" text NOT NULL,
	"slug" text NOT NULL,
	"number" real NOT NULL,
	"title" text NOT NULL,
	"released_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "chapter_manga_slug_uidx" ON "chapter" ("manga_id","slug");--> statement-breakpoint
CREATE INDEX "chapter_mangaId_idx" ON "chapter" ("manga_id");--> statement-breakpoint
ALTER TABLE "chapter" ADD CONSTRAINT "chapter_manga_id_manga_id_fkey" FOREIGN KEY ("manga_id") REFERENCES "manga"("id") ON DELETE CASCADE;