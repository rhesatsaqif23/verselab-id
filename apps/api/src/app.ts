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
import { createProgressController } from "./modules/progress/index.ts";
import { buildCorsOptions } from "./config/http.ts";
import { env } from "./config/env.ts";

// App construction is separate from `.listen()` so tests can drive the HTTP
// surface through `createApp().handle(request)` without opening a port.
export function createApp() {
  return (
    new Elysia()
      .use(logger)
      .use(errorPlugin)
      // The CORS origin is fixed to the public web origin (deploy contract §Phase 4).
      .use(cors(buildCorsOptions(env.WEB_ORIGIN)))
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
              { name: "progress", description: "Game progress sync" },
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
        v1
          .use(createHealthController())
          .use(createUserController())
          .use(createOnboardingController())
          .use(createProgressController()),
      )
  );
}

export type App = ReturnType<typeof createApp>;
