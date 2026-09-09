import { Elysia } from "elysia";
import { env } from "../config/env.ts";

const isTest = env.NODE_ENV === "test";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export const logger = new Elysia({ name: "request-logger" })
  .onRequest(({ request }) => {
    if (isTest) return;
    const requestId = crypto.randomUUID();
    request.headers.set("x-request-id", requestId);
    if (env.NODE_ENV === "development") {
      console.log(`[req] ${request.method} ${request.url}`);
    } else {
      console.log(
        JSON.stringify({ type: "request", method: request.method, url: request.url, requestId }),
      );
    }
  })
  .onError(({ error, set, request, code }) => {
    if (isTest) return;
    const requestId = request.headers.get("x-request-id") ?? "";
    if (env.NODE_ENV === "development") {
      console.error(`[err] ${code} ${request.method} ${request.url} - ${errorMessage(error)}`);
    } else {
      console.error(
        JSON.stringify({ type: "error", code, message: errorMessage(error), requestId }),
      );
    }
    if (typeof set.status === "number" && set.status < 500) return;
    set.status = 500;
    return { ok: false, error: { code: "INTERNAL", message: "Internal server error" } };
  });
