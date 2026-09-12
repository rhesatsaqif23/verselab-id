import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { auth } from "./auth/index.ts";
import { authContext } from "./middleware/auth.ts";
import { logger } from "./plugins/logger.ts";
import { errorPlugin } from "./plugins/error.ts";
import { health } from "./modules/health/index.ts";
import { user } from "./modules/user/index.ts";
import { onboarding } from "./modules/onboarding/index.ts";
import { env } from "./config/env.ts";

export const app = new Elysia()
  .use(logger)
  .use(errorPlugin)
  .use(cors({ origin: env.WEB_ORIGIN, credentials: true }))
  .onRequest(({ request }) => {
    void request.headers.get("cookie"); // Elysia .mount() cookie fix
  })
  .mount(auth.handler) // Better Auth at /api/auth/*
  .use(authContext)
  .group("/v1", (v1) => v1.use(health).use(user).use(onboarding))
  .listen(env.PORT);

export type App = typeof app;
