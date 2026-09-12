import { Elysia } from "elysia";
import { authContext } from "../../middleware/auth.ts";
import { ok } from "../../libs/response.ts";
import { onboardingService, type OnboardingService } from "./service.ts";
import { onboardingSchema } from "@verselab/shared/schemas/profile";

export function createOnboardingController(service: OnboardingService = onboardingService) {
  return new Elysia({ prefix: "/onboarding" }).use(authContext).post(
    "/",
    async ({ user, body }) => {
      const profile = await service.createOnboardingProfile(user.id, body);
      return ok({ user, profile });
    },
    {
      body: onboardingSchema,
      auth: true,
    },
  );
}
