import { Elysia } from "elysia";
import { ok } from "../../libs/response.ts";
import { healthService, type HealthService } from "./service.ts";

export function createHealthController(service: HealthService = healthService) {
  return new Elysia({ prefix: "/health" }).get("/", () => ok(service.check()), {
    tags: ["health"],
    detail: {
      summary: "Liveness check",
      description: "Returns 200 with the ok envelope when the API is up.",
    },
  });
}
