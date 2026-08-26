CREATE TABLE "manga" (
	"id" text PRIMARY KEY,
	"source" text NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"cover" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'unknown' NOT NULL,
	"genres" text DEFAULT '[]' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "library" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"manga_id" text NOT NULL,
	"status" text DEFAULT 'reading' NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "manga_source_slug_uidx" ON "manga" ("source","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "library_user_manga_uidx" ON "library" ("user_id","manga_id");--> statement-breakpoint
CREATE INDEX "library_userId_idx" ON "library" ("user_id");--> statement-breakpoint
ALTER TABLE "library" ADD CONSTRAINT "library_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "library" ADD CONSTRAINT "library_manga_id_manga_id_fkey" FOREIGN KEY ("manga_id") REFERENCES "manga"("id") ON DELETE CASCADE;