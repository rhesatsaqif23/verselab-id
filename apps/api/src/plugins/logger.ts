import type { Elysia } from "elysia";
import { env } from "../config/env.ts";

const isTest = env.NODE_ENV === "test";
const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// Function-form plugin: instance-form `trace` does not propagate through
// `.use()`, so the whole logger is a function to keep every hook on the host.
export function logger(app: Elysia) {
  return app
    .onRequest(({ request }) => {
      const requestId = crypto.randomUUID();
      request.headers.set("x-request-id", requestId);
      request.headers.set("x-start-time", String(Date.now()));
      if (isTest) return;
      if (env.NODE_ENV === "development") {
        console.log(`[req] ${request.method} ${request.url}`);
      } else {
        console.log(
          JSON.stringify({ type: "request", method: request.method, url: request.url, requestId }),
        );
      }
    })
    .trace(({ context, set, onAfterResponse }) => {
      onAfterResponse(() => {
        if (isTest || !MUTATING.has(context.request.method)) return;
        const ms = Date.now() - Number(context.request.headers.get("x-start-time") ?? Date.now());
        const requestId = context.request.headers.get("x-request-id") ?? "";
        const status = set.status ?? 200;
        const path = new URL(context.request.url).pathname;
        if (env.NODE_ENV === "development") {
          console.log(`[mut] ${context.request.method} ${path} → ${status} (${ms}ms)`);
        } else {
          console.log(
            JSON.stringify({
              type: "mutation",
              method: context.request.method,
              path,
              status,
              ms,
              requestId,
            }),
          );
        }
      });
    })
    .mapResponse(({ set, request }) => {
      set.headers["x-request-id"] = request.headers.get("x-request-id") ?? "";
    });
}
