import { Elysia } from "elysia";
import { authContext } from "../../middleware/auth.ts";
import { ok } from "../../libs/response.ts";
import { userService, type UserService } from "./service.ts";

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
    });
}
