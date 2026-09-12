import { Elysia } from "elysia";
import { ok } from "../../libs/response.ts";
import { healthService, type HealthService } from "./service.ts";

export function createHealthController(service: HealthService = healthService) {
  return new Elysia({ prefix: "/health" }).get("/", () => ok(service.check()));
}
