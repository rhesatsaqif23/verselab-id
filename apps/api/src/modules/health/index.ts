import { Elysia } from "elysia";
import { ok } from "../../libs/response.ts";

export const health = new Elysia({ prefix: "/health" }).get("/", () =>
  ok({ status: "ok" as const }),
);