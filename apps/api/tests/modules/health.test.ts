import { describe, expect, it } from "bun:test";
import { Elysia } from "elysia";
import { logger } from "../../src/plugins/logger.ts";
import { createHealthController } from "../../src/modules/health/index.ts";

describe("health module", () => {
  it("returns the ok envelope and tags the request with x-request-id", async () => {
    const app = new Elysia().use(logger).use(createHealthController());
    const request = new Request("http://localhost/health");
    const res = await app.handle(request);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, data: { status: "ok" } });
    expect(request.headers.get("x-request-id")).toBeTruthy();
  });
});
