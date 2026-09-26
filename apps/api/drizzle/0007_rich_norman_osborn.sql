ALTER TABLE "content_units" ADD COLUMN "slug" text;--> statement-breakpoint
UPDATE "content_units" SET "slug" = "content_units".id WHERE "slug" IS NULL;--> statement-breakpoint
ALTER TABLE "content_units" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "content_lessons" ADD COLUMN "slug" text;--> statement-breakpoint
UPDATE "content_lessons" SET "slug" = "content_lessons".id WHERE "slug" IS NULL;--> statement-breakpoint
ALTER TABLE "content_lessons" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "content_screens" ADD COLUMN "slug" text;--> statement-breakpoint
UPDATE "content_screens" SET "slug" = "content_screens".id WHERE "slug" IS NULL;--> statement-breakpoint
ALTER TABLE "content_screens" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "content_lessons_slug_idx" ON "content_lessons" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "content_screens_slug_idx" ON "content_screens" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "content_units_slug_idx" ON "content_units" USING btree ("slug");