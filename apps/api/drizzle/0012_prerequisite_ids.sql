ALTER TABLE "content_lessons" RENAME COLUMN "prerequisite" TO "prerequisite_ids";--> statement-breakpoint
ALTER TABLE "content_lessons" ALTER COLUMN "prerequisite_ids" SET DATA TYPE text[] USING CASE WHEN "prerequisite_ids" IS NOT NULL THEN ARRAY["prerequisite_ids"] ELSE NULL END;
