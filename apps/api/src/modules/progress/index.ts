import { Elysia } from "elysia";
import { authContext } from "../../middleware/auth.ts";
import { ok } from "../../libs/response.ts";
import { progressService, type ProgressService } from "./service.ts";
import { progressPatchSchema } from "@verselab/shared/schemas/progress";

const updateDailyGoalSchema = progressPatchSchema.pick({ dailyGoalMinutes: true });

export function createProgressController(service: ProgressService = progressService) {
  return new Elysia({ prefix: "/progress" })
    .use(authContext)
    .get(
      "/",
      async ({ user }) => {
        const data = await service.getProgress(user.id);
        return ok(data);
      },
      {
        auth: true,
        tags: ["progress"],
        detail: {
          summary: "Load progress",
          description: "Returns full progress state for the authenticated user.",
        },
      },
    )
    .put(
      "/",
      async ({ user, body }) => {
        const data = await service.putProgress(user.id, body);
        return ok(data);
      },
      {
        body: progressPatchSchema,
        auth: true,
        tags: ["progress"],
        detail: {
          summary: "Sync progress",
          description:
            "Merges a partial progress patch from the client. XP and mastery use max(local, server). Completed lessons are unioned.",
        },
      },
    )
    .patch(
      "/daily-goal",
      async ({ user, body }) => {
        const data = await service.updateDailyGoal(user.id, body.dailyGoalMinutes!);
        return ok(data);
      },
      {
        body: updateDailyGoalSchema,
        auth: true,
        tags: ["progress"],
        detail: {
          summary: "Update daily goal",
          description: "Updates the daily learning goal in minutes.",
        },
      },
    );
}
