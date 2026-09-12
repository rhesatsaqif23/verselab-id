// Global onError: maps AppError to a fail() envelope with its HTTP status and
// unknown internal errors to a generic 500. Never leaks stacks or SQL details.
import { Elysia } from "elysia";
import { env } from "../config/env.ts";
import { AppError } from "../libs/errors.ts";
import { fail } from "../libs/response.ts";

const isTest = env.NODE_ENV === "test";

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export const errorPlugin = new Elysia({ name: "error-handler" })
  .onError(({ error, set, request }) => {
    const requestId = request.headers.get("x-request-id") ?? "";

    if (error instanceof AppError) {
      if (!isTest) console.error(`[err] ${error.code} ${request.method} ${request.url} ${requestId}`);
      set.status = error.status;
      return fail({ code: error.code, message: error.message, issues: error.issues });
    }

    if (typeof set.status === "number" && set.status < 500) return;

    if (!isTest) {
      console.error(`[err] INTERNAL ${request.method} ${request.url} ${requestId}`);
      console.error(describeError(error));
    }
    set.status = 500;
    return fail({ code: "INTERNAL", message: "Internal server error" });
  })
  .as("global");