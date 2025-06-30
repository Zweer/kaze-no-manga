CREATE TABLE "chapter" (
	"id" text PRIMARY KEY NOT NULL,
	"sourceName" text NOT NULL,
	"sourceId" text NOT NULL,
	"mangaId" text NOT NULL,
	"title" text,
	"index" real,
	"releasedAt" timestamp with time zone,
	"images" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "manga" (
	"id" text PRIMARY KEY NOT NULL,
	"sourceName" text NOT NULL,
	"sourceId" text NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"chaptersCount" integer NOT NULL,
	"lastCheckedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	CONSTRAINT "manga_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "chapter" ADD CONSTRAINT "chapter_mangaId_manga_id_fk" FOREIGN KEY ("mangaId") REFERENCES "public"."manga"("id") ON DELETE cascade ON UPDATE no action;