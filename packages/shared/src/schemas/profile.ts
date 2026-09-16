import { z } from "zod";

export const unitIdSchema = z.enum(["keuangan", "akuntansi", "manajemen-produk", "kewirausahaan"]);

export const dailyGoalSchema = z.enum(["casual", "regular", "serious"]);

export const purposeSchema = z.enum([
  "karier",
  "pendidikan",
  "investasi",
  "wirausaha",
  "pengembangan-diri",
  "lainnya",
]);

export const onboardingSchema = z.object({
  displayName: z.string().trim().min(1).max(50),
  startUnitId: unitIdSchema,
  dailyGoal: dailyGoalSchema,
  purpose: purposeSchema.optional(),
});

export const profileSchema = onboardingSchema.extend({
  userId: z.string(),
  avatarUrl: z.string().nullable().optional(),
  onboardedAt: z.string().nullable(),
});

export const updateProfileSchema = z.object({
  displayName: z.string().trim().min(1).max(50).optional(),
  dailyGoal: dailyGoalSchema.optional(),
  avatarUrl: z.string().url().nullable().optional(),
});

export type Purpose = z.infer<typeof purposeSchema>;
export type DailyGoal = z.infer<typeof dailyGoalSchema>;

export const dailyGoalToMinutes: Record<DailyGoal, number> = {
  casual: 5,
  regular: 10,
  serious: 20,
};

export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
