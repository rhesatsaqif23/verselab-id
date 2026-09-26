// Production-hardening assertions: cookies, CORS, and the boot-level https
// rule, so the first deployed environment can't silently break auth.
//
// ## Deploy contract (release checklist)
//
// Before any deploy, verify ALL of the following against the target env:
//
//   1. WEB_ORIGIN         == CORS origin == the `trustedOrigins` entry == the
//                          public web origin (https, no trailing slash).
//   2. BETTER_AUTH_URL    == the API's public https origin. Better Auth builds
//                          redirect/callback URLs from it, and `Secure` cookies
//                          require https (asserted at boot — this file).
//   3. The web and API share a registrable domain so `sameSite=lax` session
//      cookies still flow on top-level navigations (e.g. app.example.id and
//      api.example.id — never example.id and example.com.mx).
//   4. NODE_ENV=production is set: it flips cookies to `Secure` and enables the
//      session cookie cache (5 min). Development/test keep the cache off so an
//      expired/signed-out session fails immediately.
//   5. `/openapi/json` returns 200 through whatever proxy/CDN fronts the API
//      (the runtime spec doubles as the frontend reference — keep
//      `docs/api/openapi.json` in sync with `bun export:openapi`).
//   6. A foreign-origin CORS preflight is rejected and WEB_ORIGIN is echoed with
//      `access-control-allow-credentials: true` (asserted in contract.test.ts).
//
// These assertions must stay green for BOTH dev (NODE_ENV=development) and
// production (NODE_ENV=production) values passed to the pure config helpers.
// Run: NODE_ENV=test bun run --cwd apps/api test  (groups in this file are pure).
import { describe, expect, it } from "bun:test";
import {
  assertProductionHttps,
  authCookieAttributes,
  buildAuthOptions,
} from "../../src/auth/config.ts";
import { buildCorsOptions } from "../../src/config/http.ts";

const prodEnv = {
  NODE_ENV: "production" as const,
  BETTER_AUTH_URL: "https://api.verselab.id",
  BETTER_AUTH_SECRET: "x".repeat(32),
  DATABASE_URL: "postgresql://localhost/verselab",
  WEB_ORIGIN: "https://verselab.id",
  PORT: 3001,
};
const devEnv = {
  ...prodEnv,
  NODE_ENV: "development" as const,
  BETTER_AUTH_URL: "http://localhost:3001",
  WEB_ORIGIN: "http://localhost:3000",
  PORT: 3001,
};

describe("auth cookie attributes", () => {
  it("locks production cookies to secure + httpOnly + sameSite=lax", () => {
    expect(authCookieAttributes("production")).toEqual({
      httpOnly: true,
      sameSite: "lax",
      secure: true,
    });
  });

  it("relaxes only `secure` in development (localhost)", () => {
    expect(authCookieAttributes("development")).toEqual({
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });
  });
});

describe("production bootstrap", () => {
  it("fails fast at boot when BETTER_AUTH_URL is http in production", () => {
    expect(() => assertProductionHttps("production", "http://api.verselab.id")).toThrow(/https/);
  });

  it("accepts https in production", () => {
    expect(() => assertProductionHttps("production", "https://api.verselab.id")).not.toThrow();
  });

  it("accepts http in development", () => {
    expect(() => assertProductionHttps("development", "http://localhost:3001")).not.toThrow();
  });

  it("builds production auth options with secure cookies, trusted origin, and the cookie cache", () => {
    const opts = buildAuthOptions(prodEnv);
    expect(opts.advanced?.useSecureCookies).toBe(true);
    expect(opts.advanced?.defaultCookieAttributes?.secure).toBe(true);
    expect(opts.trustedOrigins).toEqual([prodEnv.WEB_ORIGIN]);
    expect(opts.session?.cookieCache?.enabled).toBe(true);
  });

  it("keeps the dev cookie cache off so expiry/sign-out is immediate", () => {
    const opts = buildAuthOptions(devEnv);
    expect(opts.advanced?.useSecureCookies).toBe(false);
    expect(opts.advanced?.defaultCookieAttributes?.secure).toBe(false);
    expect(opts.session?.cookieCache?.enabled).toBe(false);
  });
});

describe("CORS origin", () => {
  it("locks the CORS origin to WEB_ORIGIN with credentials", () => {
    const opts = buildCorsOptions(prodEnv.WEB_ORIGIN);
    expect(opts.origin).toBe(prodEnv.WEB_ORIGIN);
    expect(opts.credentials).toBe(true);
  });
});
