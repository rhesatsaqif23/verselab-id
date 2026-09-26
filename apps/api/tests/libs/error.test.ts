import { describe, expect, it } from "bun:test";
import { Elysia } from "elysia";
import { appError } from "../../src/libs/errors.ts";
import { errorPlugin } from "../../src/plugins/error.ts";

const app = new Elysia()
  .use(errorPlugin)
  .get("/conflict", () => {
    throw appError({ code: "PROFILE_ALREADY_EXISTS" });
  })
  .get("/boom", () => {
    throw new Error("secret db details");
  });

describe("appError", () => {
  it("resolves code, status, and default message from appErrorMeta", () => {
    const err = appError({ code: "PROFILE_ALREADY_EXISTS" });

    expect(err).toBeInstanceOf(Error);
    expect(err.code).toBe("PROFILE_ALREADY_EXISTS");
    expect(err.status).toBe(409);
    expect(err.message).toBe("Profile already exists");
  });

  it("overrides the message and carries issues", () => {
    const err = appError({
      code: "NOT_FOUND",
      message: "Lesson not found",
      issues: [{ path: "lessonId" }],
    });

    expect(err.message).toBe("Lesson not found");
    expect(err.issues).toEqual([{ path: "lessonId" }]);
  });
});

describe("error plugin", () => {
  it("maps AppError to its status and the fail envelope", async () => {
    const res = await app.handle(new Request("http://localhost/conflict"));

    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({
      ok: false,
      error: { code: "PROFILE_ALREADY_EXISTS", message: "Profile already exists" },
    });
  });

  it("maps unknown errors to a generic 500", async () => {
    const res = await app.handle(new Request("http://localhost/boom"));

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({
      ok: false,
      error: { code: "INTERNAL", message: "Internal server error" },
    });
  });

  it("leaves framework errors under 500 untouched", async () => {
    const res = await app.handle(new Request("http://localhost/missing"));

    expect(res.status).toBe(404);
    expect((await res.text()).includes("NOT_FOUND")).toBe(true);
  });
});
