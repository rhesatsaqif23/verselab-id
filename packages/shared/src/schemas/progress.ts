import { z } from "zod";

/** Partial patch sent from client to server after lesson completion. */
export const progressPatchSchema = z.object({
  xp: z.number().int().min(0).optional(),
  streak: z.number().int().min(0).optional(),
  streakFreeze: z.number().int().min(0).optional(),
  lastActiveDate: z.string().nullable().optional(),
  completedLessons: z.array(z.string()).optional(),
  units: z
    .array(
      z.object({
        unitId: z.string(),
        mastery: z.number().int().min(0).max(100),
        masteryUpdatedAt: z.string(),
      }),
    )
    .optional(),
  activityDate: z.string().optional(),
  dailyGoalMinutes: z.number().int().min(3).max(20).optional(),
});

export type ProgressPatch = z.infer<typeof progressPatchSchema>;

/** Full progress state returned by GET /v1/progress. */
export const serverProgressSchema = z.object({
  xp: z.number(),
  streak: z.number(),
  streakFreeze: z.number(),
  lastActiveDate: z.string().nullable(),
  completedLessons: z.array(z.string()),
  units: z.array(
    z.object({
      unitId: z.string(),
      mastery: z.number(),
      masteryUpdatedAt: z.string(),
    }),
  ),
  recentActivity: z.array(z.string()),
  dailyGoalMinutes: z.number(),
});

export type ServerProgress = z.infer<typeof serverProgressSchema>;
