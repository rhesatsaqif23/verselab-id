import { Elysia } from "elysia";
import { env } from "../config/env.ts";

const isTest = env.NODE_ENV === "test";

export const logger = new Elysia({ name: "request-logger" })
  .onRequest(({ request }) => {
    const requestId = crypto.randomUUID();
    request.headers.set("x-request-id", requestId);
    if (isTest) return;
    if (env.NODE_ENV === "development") {
      console.log(`[req] ${request.method} ${request.url}`);
    } else {
      console.log(
        JSON.stringify({ type: "request", method: request.method, url: request.url, requestId }),
      );
    }
  })
  // Echo the request id so clients can correlate failures back to `[err]` logs.
  .mapResponse(({ set, request }) => {
    set.headers["x-request-id"] = request.headers.get("x-request-id") ?? "";
  });
