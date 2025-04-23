CREATE TABLE "manga_sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"manga_id" uuid NOT NULL,
	"source_name" varchar(100) NOT NULL,
	"source_manga_id" text NOT NULL,
	"source_url" text,
	"last_chapter_checked" varchar(50),
	"last_checked_at" timestamp,
	"is_preferred_source" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "manga_sources" ADD CONSTRAINT "manga_sources_manga_id_manga_id_fk" FOREIGN KEY ("manga_id") REFERENCES "public"."manga"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chapters" DROP COLUMN "source_url";--> statement-breakpoint
ALTER TABLE "manga" DROP COLUMN "source_name";--> statement-breakpoint
ALTER TABLE "manga" DROP COLUMN "source_manga_id";--> statement-breakpoint
ALTER TABLE "manga" DROP COLUMN "source_url";--> statement-breakpoint
ALTER TABLE "manga" DROP COLUMN "last_chapter_checked";--> statement-breakpoint
ALTER TABLE "manga" DROP COLUMN "last_checked_at";