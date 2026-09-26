CREATE TYPE "public"."screen_type" AS ENUM('concept', 'choice', 'numeric', 'allocation');--> statement-breakpoint
CREATE TABLE "content_lessons" (
	"id" text PRIMARY KEY NOT NULL,
	"unit_id" text NOT NULL,
	"title" text NOT NULL,
	"icon" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_screens" (
	"id" text PRIMARY KEY NOT NULL,
	"lesson_id" text NOT NULL,
	"type" "screen_type" NOT NULL,
	"prompt" text NOT NULL,
	"explain" text NOT NULL,
	"options" jsonb,
	"correct_id" text,
	"numeric_unit" text,
	"accept_range_min" integer,
	"accept_range_max" integer,
	"categories" text[],
	"rule" jsonb,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_units" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"image_url" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "content_lessons" ADD CONSTRAINT "content_lessons_unit_id_content_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."content_units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_screens" ADD CONSTRAINT "content_screens_lesson_id_content_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."content_lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "content_lessons_unit_idx" ON "content_lessons" USING btree ("unit_id");--> statement-breakpoint
CREATE INDEX "content_lessons_sort_idx" ON "content_lessons" USING btree ("unit_id","sort_order");--> statement-breakpoint
CREATE INDEX "content_screens_lesson_idx" ON "content_screens" USING btree ("lesson_id");--> statement-breakpoint
CREATE INDEX "content_screens_sort_idx" ON "content_screens" USING btree ("lesson_id","sort_order");--> statement-breakpoint
CREATE INDEX "content_units_sort_idx" ON "content_units" USING btree ("sort_order");