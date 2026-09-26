// Image URL resolution for API-stored uploads.
//
// The local storage driver returns relative paths (/uploads/...). Those must
// resolve against the API origin — the browser would otherwise request them
// from the web server, which doesn't serve them. S3 URLs are absolute and all
// other paths (web-public assets, data:/blob: previews) pass through untouched.
import { env } from "./env.ts";

export function resolveImageUrl(
  url: string | null | undefined,
  origin: string | undefined = env.apiOrigin,
): string | undefined {
  if (!url || url.trim() === "") return undefined;
  if (!url.startsWith("/uploads/")) return url;
  const base = (origin ?? "").replace(/\/$/, "");
  return `${base}${url}`;
}
