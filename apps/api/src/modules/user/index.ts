import { Elysia } from "elysia";
import { authContext } from "../../middleware/auth.ts";
import { ok } from "../../libs/response.ts";
import { userService, type UserService } from "./service.ts";
import { updateProfileSchema } from "@verselab/shared/schemas/profile";

export function createUserController(service: UserService = userService) {
  return new Elysia({ prefix: "/user" })
    .use(authContext)
    .get("/me", async ({ user }) => ok(await service.getMe(user)), {
      auth: true,
      tags: ["user"],
      detail: {
        summary: "Get current user and learning profile",
        description:
          "Returns the authenticated user and their learning profile (null until onboarded).",
      },
    })
    .patch(
      "/me",
      async ({ user, body }) => {
        const profile = await service.updateProfile(user.id, body);
        return ok(profile);
      },
      {
        body: updateProfileSchema,
        auth: true,
        tags: ["user"],
        detail: {
          summary: "Update profile",
          description: "Updates displayName, dailyGoal, or avatarUrl for the authenticated user.",
        },
      },
    )
    .post(
      "/me/avatar",
      async ({ user, body }) => {
        const file = (body as { file: File }).file;
        const result = await service.uploadAvatar(user.id, file);
        return ok(result);
      },
      {
        auth: true,
        tags: ["user"],
        detail: {
          summary: "Upload avatar",
          description: "Uploads an avatar image (JPEG/PNG, max 2MB) for the authenticated user.",
        },
      },
    );
}
