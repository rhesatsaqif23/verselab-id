import { z } from "zod";

// ── Slug helper ──────────────────────────────────────────────────────────────

const slugSchema = z.string().trim().min(1).max(200);

// ── Unit ────────────────────────────────────────────────────────────────────

export const createUnitSchema = z.object({
  id: z.string().trim().min(1).max(100).optional(),
  title: z.string().trim().min(1).max(200),
  slug: slugSchema.optional(),
  description: z.string().trim().max(500).optional(),
  imageUrl: z.string().url().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateUnitSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  slug: slugSchema.optional(),
  description: z.string().trim().max(500).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
});

// ── Lesson ──────────────────────────────────────────────────────────────────

export const createLessonSchema = z.object({
  id: z.string().trim().min(1).max(100).optional(),
  unitId: z.string().trim().min(1).max(100),
  title: z.string().trim().min(1).max(200),
  slug: slugSchema.optional(),
  description: z.string().trim().max(500).optional(),
  icon: z.string().trim().max(50).optional(),
  prerequisite: z.string().trim().max(200).optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateLessonSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  slug: slugSchema.optional(),
  description: z.string().trim().max(500).optional().nullable(),
  icon: z.string().trim().max(50).optional().nullable(),
  prerequisite: z.string().trim().max(200).optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
});

// ── Screen ──────────────────────────────────────────────────────────────────

const screenTypeSchema = z.enum(["concept", "choice", "numeric", "allocation"]);

const choiceOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
});

const allocationRuleSchema = z.object({
  type: z.literal("min"),
  categoryId: z.string(),
  min: z.number().optional(),
  max: z.number().optional(),
});

export const createScreenSchema = z.object({
  id: z.string().trim().min(1).max(100).optional(),
  lessonId: z.string().trim().min(1).max(100),
  type: screenTypeSchema,
  slug: slugSchema.optional(),
  prompt: z.string().trim().min(1),
  explain: z.string().trim().min(1),
  // choice
  options: z.array(choiceOptionSchema).optional(),
  correctId: z.string().optional(),
  // numeric
  numericUnit: z.string().trim().max(50).optional(),
  acceptRangeMin: z.number().optional(),
  acceptRangeMax: z.number().optional(),
  // allocation
  categories: z.array(z.string()).optional(),
  rule: allocationRuleSchema.optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateScreenSchema = z.object({
  type: screenTypeSchema.optional(),
  slug: slugSchema.optional(),
  prompt: z.string().trim().min(1).optional(),
  explain: z.string().trim().min(1).optional(),
  // choice
  options: z.array(choiceOptionSchema).optional().nullable(),
  correctId: z.string().optional().nullable(),
  // numeric
  numericUnit: z.string().trim().max(50).optional().nullable(),
  acceptRangeMin: z.number().optional().nullable(),
  acceptRangeMax: z.number().optional().nullable(),
  // allocation
  categories: z.array(z.string()).optional().nullable(),
  rule: allocationRuleSchema.optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
});

// ── Reorder (shared by units, lessons, screens) ─────────────────────────────

export const reorderSchema = z.object({
  ids: z.array(z.string().trim().min(1)).min(1),
});

// ── Inferred types ──────────────────────────────────────────────────────────

export type CreateUnitInput = z.infer<typeof createUnitSchema>;
export type UpdateUnitInput = z.infer<typeof updateUnitSchema>;
export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
export type CreateScreenInput = z.infer<typeof createScreenSchema>;
export type UpdateScreenInput = z.infer<typeof updateScreenSchema>;
export type ReorderInput = z.infer<typeof reorderSchema>;
