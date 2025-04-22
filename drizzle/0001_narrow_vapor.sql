CREATE TABLE "chapters" (
	"id" serial PRIMARY KEY NOT NULL,
	"manga_slug" varchar(255) NOT NULL,
	"chapter_number_float" double precision,
	"title" varchar(255),
	"source_url" text,
	"pages" jsonb,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "manga" (
	"slug" varchar(255) PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"author" varchar(255),
	"artist" varchar(255),
	"description" text,
	"cover_url" text,
	"status" varchar(50),
	"genres" jsonb,
	"source_url" text,
	"last_chapter_checked" varchar(50),
	"last_checked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_library" (
	"user_id" text NOT NULL,
	"manga_slug" varchar(255) NOT NULL,
	"last_chapter_read" varchar(50) DEFAULT '0',
	"added_at" timestamp DEFAULT now() NOT NULL,
	"reading_status" varchar(50) DEFAULT 'Reading',
	"rating" integer,
	"notes" text,
	"notifications_enabled" boolean DEFAULT true
);
--> statement-breakpoint
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_manga_slug_manga_slug_fk" FOREIGN KEY ("manga_slug") REFERENCES "public"."manga"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_library" ADD CONSTRAINT "user_library_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_library" ADD CONSTRAINT "user_library_manga_slug_manga_slug_fk" FOREIGN KEY ("manga_slug") REFERENCES "public"."manga"("slug") ON DELETE cascade ON UPDATE no action;