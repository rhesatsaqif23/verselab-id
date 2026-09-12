import { describe, expect, it, mock } from "bun:test";
import { Elysia } from "elysia";
import type { Profile } from "@verselab/shared/schemas/profile";
import type { User } from "better-auth/types";

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
  displayName: "Tester",
  startUnitId: "keuangan",
  dailyGoal: "regular",
  onboardedAt: "2026-09-12T00:00:00.000Z",
};

async function controller() {
  const { createUserController } = await import("../../src/modules/user/index.ts");
  return createUserController;
}

describe("user module", () => {
  it("GET /me returns { user, profile } and passes the user to the service", async () => {
    const create = await controller();
    let calledWith: User | undefined;

    const app = new Elysia().use(
      create({
        getMe: async (user) => {
          calledWith = user;
          return { user, profile };
        },
      }),
    );

    const res = await app.handle(
      new Request("http://localhost/user/me", { headers: { cookie: "session_token=abc" } }),
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, data: { user: fakeUser, profile } });
    expect(calledWith).toMatchObject(fakeUser);
  });

  it("returns profile null when the user is not onboarded", async () => {
    const create = await controller();
    const app = new Elysia().use(create({ getMe: async (user) => ({ user, profile: null }) }));

    const res = await app.handle(
      new Request("http://localhost/user/me", { headers: { cookie: "session_token=abc" } }),
    );

    const body = (await res.json()) as { data: { profile: unknown } };
    expect(res.status).toBe(200);
    expect(body.data.profile).toBeNull();
  });

  it("rejects unauthenticated requests", async () => {
    const create = await controller();
    const app = new Elysia().use(create({ getMe: async (user) => ({ user, profile: null }) }));

    const res = await app.handle(new Request("http://localhost/user/me"));

    expect(res.status).toBe(401);
  });
});
