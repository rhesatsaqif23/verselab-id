import { describe, expect, it, mock } from "bun:test";
import { Elysia } from "elysia";
import type { Profile } from "@verselab/shared/schemas/profile";
import { appError } from "../../src/libs/errors.ts";
import { errorPlugin } from "../../src/plugins/error.ts";

const fakeUser = { id: "u-1", name: "Tester", email: "t@test.dev" };

mock.module("../../src/middleware/auth.ts", () => ({
  authContext: new Elysia({ name: "auth-context-test" }).macro({
    auth: {
      resolve({ status, request }) {
        if (!request.headers.get("cookie")) return status(401);
        return { user: fakeUser, session: { createdAt: new Date() } };
      },
    },
  }),
}));

const profile: Profile = {
  userId: fakeUser.id,
  displayName: "Ada",
  startUnitId: "keuangan",
  dailyGoal: "regular",
  onboardedAt: null,
};

const validInput = { displayName: "Ada", startUnitId: "keuangan", dailyGoal: "regular" };

async function controller() {
  const { createOnboardingController } = await import("../../src/modules/onboarding/index.ts");
  return createOnboardingController;
}

describe("onboarding module", () => {
  it("POST /onboarding creates a profile and returns { user, profile }", async () => {
    const create = await controller();
    let args: [string, typeof validInput] | undefined;

    const app = new Elysia().use(errorPlugin).use(
      create({
        createOnboardingProfile: async (userId, body) => {
          args = [userId, body];
          return profile;
        },
      }),
    );

    const res = await app.handle(
      new Request("http://localhost/onboarding", {
        method: "POST",
        headers: { "content-type": "application/json", cookie: "session_token=abc" },
        body: JSON.stringify(validInput),
      }),
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, data: { user: fakeUser, profile } });
    expect(args).toEqual(["u-1", validInput]);
  });

  it("returns a non-empty validation error array for an invalid body", async () => {
    const create = await controller();
    const app = new Elysia()
      .use(errorPlugin)
      .use(create({ createOnboardingProfile: async () => profile }));

    const res = await app.handle(
      new Request("http://localhost/onboarding", {
        method: "POST",
        headers: { "content-type": "application/json", cookie: "session_token=abc" },
        body: JSON.stringify({ displayName: "", startUnitId: "bogus", dailyGoal: "x" }),
      }),
    );

    const body = (await res.json()) as { errors: Array<{ path: unknown[] }> };
    expect(res.status).toBe(422);
    expect(Array.isArray(body.errors)).toBe(true);
    expect(body.errors.length).toBeGreaterThan(0);
    expect(Array.isArray(body.errors[0]?.path)).toBe(true);
  });

  it("maps a profile-already-exists failure to 409", async () => {
    const create = await controller();
    const app = new Elysia().use(errorPlugin).use(
      create({
        createOnboardingProfile: async () => {
          throw appError({ code: "PROFILE_ALREADY_EXISTS" });
        },
      }),
    );

    const res = await app.handle(
      new Request("http://localhost/onboarding", {
        method: "POST",
        headers: { "content-type": "application/json", cookie: "session_token=abc" },
        body: JSON.stringify(validInput),
      }),
    );

    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({
      ok: false,
      error: { code: "PROFILE_ALREADY_EXISTS", message: "Profile already exists" },
    });
  });

  it("rejects unauthenticated requests", async () => {
    const create = await controller();
    const app = new Elysia().use(create({ createOnboardingProfile: async () => profile }));

    const res = await app.handle(
      new Request("http://localhost/onboarding", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(validInput),
      }),
    );

    expect(res.status).toBe(401);
  });
});
