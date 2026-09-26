import type { CORSConfig } from "@elysiajs/cors";

/** Never guess the origin: CORS must match the public web origin exactly. */
export function buildCorsOptions(webOrigin: string): CORSConfig {
  return { origin: webOrigin, credentials: true };
}
