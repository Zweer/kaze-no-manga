ALTER TABLE "chapters" DROP CONSTRAINT "chapters_manga_slug_manga_slug_fk";
--> statement-breakpoint
ALTER TABLE "user_library" DROP CONSTRAINT "user_library_manga_slug_manga_slug_fk";
--> statement-breakpoint
/*
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'manga'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually

    Hope to release this update as soon as possible
*/

ALTER TABLE "manga" DROP CONSTRAINT "manga_pkey";--> statement-breakpoint
ALTER TABLE "chapters" ADD COLUMN "manga_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "manga" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "manga" ADD COLUMN "source_name" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "manga" ADD COLUMN "source_manga_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "user_library" ADD COLUMN "manga_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_manga_id_manga_id_fk" FOREIGN KEY ("manga_id") REFERENCES "public"."manga"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_library" ADD CONSTRAINT "user_library_manga_id_manga_id_fk" FOREIGN KEY ("manga_id") REFERENCES "public"."manga"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chapters" DROP COLUMN "manga_slug";--> statement-breakpoint
ALTER TABLE "user_library" DROP COLUMN "manga_slug";
