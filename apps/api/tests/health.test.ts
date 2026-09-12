import { describe, expect, it } from "bun:test";
import { health } from "../src/modules/health/index.ts";

describe("health module", () => {
  it("returns the ok envelope", async () => {
    const res = await health.handle(new Request("http://localhost/health"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; data: { status: string } };
    expect(body).toEqual({ ok: true, data: { status: "ok" } });
  });
});