-- Rename pre-existing duplicate lesson titles within a unit so the unique
-- index below can be created (keeps the earliest, suffixes the rest).
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY unit_id, lower(trim(title)) ORDER BY sort_order, created_at
  ) AS rn
  FROM content_lessons
)
UPDATE content_lessons l SET title = l.title || ' (' || r.rn || ')'
FROM ranked r WHERE l.id = r.id AND r.rn > 1;
--> statement-breakpoint
CREATE UNIQUE INDEX "content_lessons_unit_title_idx" ON "content_lessons" (unit_id, lower(trim(title)));
