// Auth configuration as pure, testable functions. The runtime instance lives in
// `auth/index.ts`; splitting this out lets config.test.ts assert the production
// cookie/CORS/https rules without spinning up Better Auth or a database.
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import type { BetterAuthOptions } from "better-auth";
import type { AppEnv } from "../config/env.ts";
import { getDb } from "../database/index.ts";
import * as authSchema from "../database/auth-schema.ts";
import * as schema from "../database/schema.ts";

const fullSchema = { ...authSchema, ...schema };

/** Cookie attributes for every auth cookie: httpOnly + sameSite lax always, `secure` only in production. */
export function authCookieAttributes(nodeEnv: AppEnv["NODE_ENV"]) {
  return { httpOnly: true as const, sameSite: "lax" as const, secure: nodeEnv === "production" };
}

/**
 * Fail fast at boot when production would run Better Auth over plain http:
 * `Secure` cookies and redirect/callback URLs silently break otherwise.
 */
export function assertProductionHttps(nodeEnv: AppEnv["NODE_ENV"], baseURL: string): void {
  if (nodeEnv === "production" && !baseURL.startsWith("https://")) {
    throw new Error(`BETTER_AUTH_URL must be https:// in production, got "${baseURL}"`);
  }
}

export function buildAuthOptions(env: AppEnv): BetterAuthOptions {
  assertProductionHttps(env.NODE_ENV, env.BETTER_AUTH_URL);
  return {
    database: drizzleAdapter(getDb(), { provider: "pg", schema: fullSchema }),
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      // Dev-only email transport: log the reset link instead of sending mail.
      // Production SMTP/Resend is explicitly out of scope (see the integration doc).
      ...(env.EMAIL_TRANSPORT === "console"
        ? {
            sendResetPassword: async ({ url }) => {
              console.log(`[email] Reset password link: ${url}`);
            },
          }
        : {}),
    },
    trustedOrigins: [env.WEB_ORIGIN],
    advanced: {
      useSecureCookies: env.NODE_ENV === "production",
      defaultCookieAttributes: authCookieAttributes(env.NODE_ENV),
    },
    session: {
      // Cache the session lookup only in production. In dev/test a server-side
      // expiry or sign-out must fail on the very next request, not up to 5
      // minutes later.
      cookieCache: { enabled: env.NODE_ENV === "production", maxAge: 5 * 60 },
    },
  };
}
