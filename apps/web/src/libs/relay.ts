// Cookie relay between the web app (port 3000) and the API (port 3001).
// The browser's cookies are forwarded to the API inside server functions, and
// Better Auth `Set-Cookie` headers from API responses are copied back onto the
// web response so the browser holds a session for its own origin.
import { getRequestHeaders, getResponse } from "@tanstack/react-start/server";
import { env } from "#/libs/env.ts";

const AUTH_COOKIE_RE = /session_token|better-auth\.session_token/i;

/** Better Auth `Set-Cookie` values from an API response (non-auth cookies ignored). */
export function authCookies(res: Response): string[] {
  return (res.headers.getSetCookie?.() ?? []).filter((cookie) => AUTH_COOKIE_RE.test(cookie));
}

export type RelayContext = {
  requestHeaders: () => Headers;
  responseHeaders: () => Headers;
};

const serverContext: RelayContext = {
  requestHeaders: () => getRequestHeaders(),
  responseHeaders: () => getResponse().headers,
};

/**
 * Copy Better Auth `Set-Cookie` headers from an API response onto the web
 * response (injected context makes it unit-testable without the SSR runtime).
 */
export function relayAuthCookies(res: Response, ctx: RelayContext = serverContext): void {
  for (const cookie of authCookies(res)) {
    ctx.responseHeaders().append("set-cookie", cookie);
  }
}

/**
 * Call the API with the browser's cookies forwarded, then relay any Better Auth
 * session cookies back onto the web response.
 */
export async function relayRequest(
  path: string,
  init?: RequestInit,
  ctx: RelayContext = serverContext,
): Promise<Response> {
  const headers = new Headers(ctx.requestHeaders());
  if (init?.headers) {
    for (const [key, value] of new Headers(init.headers)) headers.set(key, value);
  }
  headers.set("accept", "application/json");

  const res = await fetch(`${env.apiOrigin}${path}`, { ...init, headers });
  relayAuthCookies(res, ctx);
  return res;
}
