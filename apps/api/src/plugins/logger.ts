import { Elysia } from "elysia";
import { env } from "../config/env.ts";

const isTest = env.NODE_ENV === "test";

export const logger = new Elysia({ name: "request-logger" }).onRequest(({ request }) => {
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
});