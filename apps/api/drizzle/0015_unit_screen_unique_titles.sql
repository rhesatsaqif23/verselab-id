-- Rename pre-existing duplicate unit titles (keeps the earliest).
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY lower(trim(title)) ORDER BY sort_order, created_at
  ) AS rn
  FROM content_units
)
UPDATE content_units u SET title = u.title || ' (' || r.rn || ')'
FROM ranked r WHERE u.id = r.id AND r.rn > 1;
--> statement-breakpoint
-- Rename pre-existing duplicate non-empty screen prompts within a lesson.
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY lesson_id, lower(trim(prompt)) ORDER BY sort_order, id
  ) AS rn
  FROM content_screens WHERE trim(prompt) <> ''
)
UPDATE content_screens s SET prompt = s.prompt || ' (' || r.rn || ')'
FROM ranked r WHERE s.id = r.id AND r.rn > 1;
--> statement-breakpoint
CREATE UNIQUE INDEX "content_units_title_idx" ON "content_units" (lower(trim(title)));
--> statement-breakpoint
CREATE UNIQUE INDEX "content_screens_lesson_prompt_idx" ON "content_screens" (lesson_id, lower(trim(prompt))) WHERE trim(prompt) <> '';
