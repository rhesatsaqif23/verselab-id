import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { auth } from "./auth/index.ts";
import { authContext } from "./middleware/auth.ts";
import { logger } from "./plugins/logger.ts";
import { errorPlugin } from "./plugins/error.ts";
import { createHealthController } from "./modules/health/index.ts";
import { createUserController } from "./modules/user/index.ts";
import { createOnboardingController } from "./modules/onboarding/index.ts";
import { env } from "./config/env.ts";

export const app = new Elysia()
  .use(logger)
  .use(errorPlugin)
  .use(cors({ origin: env.WEB_ORIGIN, credentials: true }))
  .use(
    swagger({
      path: "/openapi",
      documentation: {
        info: {
          title: "Verselab API",
          version: "1.0.0",
          description: "Elysia + Better Auth API for verselab.id",
        },
        tags: [
          { name: "health", description: "Liveness checks" },
          { name: "user", description: "Current user and learning profile" },
          { name: "onboarding", description: "Learning profile setup" },
        ],
      },
    }),
  )
  .onRequest(({ request }) => {
    void request.headers.get("cookie"); // Elysia .mount() cookie fix
  })
  .mount(auth.handler) // Better Auth at /api/auth/*
  .use(authContext)
  .group("/v1", (v1) =>
    v1.use(createHealthController()).use(createUserController()).use(createOnboardingController()),
  )
  .listen(env.PORT);

export type App = typeof app;
