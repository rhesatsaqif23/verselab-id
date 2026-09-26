import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { authCookies, relayAuthCookies, relayRequest } from "#/libs/relay.ts";
import type { RelayContext } from "#/libs/relay.ts";

function fakeContext(): RelayContext & { webHeaders: Headers } {
  const webHeaders = new Headers();
  return {
    webHeaders,
    requestHeaders: () => new Headers({ cookie: "session_token=abc; Path=/; HttpOnly" }),
    responseHeaders: () => webHeaders,
  };
}

function cookieResponse(setCookies: string[]): Response {
  const headers = new Headers();
  headers.set("content-type", "application/json");
  for (const cookie of setCookies) headers.append("set-cookie", cookie);
  return new Response(JSON.stringify({ ok: true, data: { profile: null } }), {
    status: 200,
    headers,
  });
}

describe("relay", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      (fetchMock = vi.fn(async () =>
        cookieResponse(["better-auth.session_token=xyz; Path=/; HttpOnly", "theme=dark; Path=/"]),
      )),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("forwards the browser cookies to the API", async () => {
    const ctx = fakeContext();
    await relayRequest("/v1/user/me", undefined, ctx);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe(
      `${import.meta.env.VITE_API_ORIGIN.replace(/localhost/, "127.0.0.1")}/v1/user/me`,
    );
    const sent = new Headers(init.headers);
    expect(sent.get("cookie")).toBe("session_token=abc; Path=/; HttpOnly");
    expect(sent.get("accept")).toBe("application/json");
  });

  it("relays Better Auth Set-Cookie back onto the web response", async () => {
    const ctx = fakeContext();
    await relayRequest("/v1/user/me", undefined, ctx);

    const relayed = ctx.webHeaders.getSetCookie();
    expect(relayed).toContain("better-auth.session_token=xyz; Path=/; HttpOnly");
    expect(relayed).not.toContain("theme=dark; Path=/");
  });

  it("accumulates relayed cookies across calls within one request", async () => {
    const ctx = fakeContext();
    await relayRequest("/v1/user/me", undefined, ctx);
    await relayRequest("/v1/onboarding", { method: "POST" }, ctx);

    expect(ctx.webHeaders.getSetCookie().filter((c) => c.includes("session_token"))).toHaveLength(
      2,
    );
  });

  it("authCookies ignores non-auth cookies", () => {
    const res = cookieResponse(["foo=1; Path=/", "theme=dark"]);
    expect(authCookies(res)).toEqual([]);
  });

  it("relayAuthCookies appends only auth cookies", () => {
    const ctx = fakeContext();
    const res = cookieResponse([
      "better-auth.session_token=abc; Path=/; HttpOnly",
      "theme=dark; Path=/",
    ]);
    relayAuthCookies(res, ctx);

    expect(ctx.webHeaders.getSetCookie()).toEqual([
      "better-auth.session_token=abc; Path=/; HttpOnly",
    ]);
  });
});
