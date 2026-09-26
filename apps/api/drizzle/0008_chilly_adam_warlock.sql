DROP INDEX "content_lessons_slug_idx";--> statement-breakpoint
DROP INDEX "content_screens_slug_idx";--> statement-breakpoint
DROP INDEX "content_units_slug_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "content_lessons_slug_idx" ON "content_lessons" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "content_screens_slug_idx" ON "content_screens" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "content_units_slug_idx" ON "content_units" USING btree ("slug");