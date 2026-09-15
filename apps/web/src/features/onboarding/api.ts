// Onboarding API: server function that POSTs the learning profile to the API
// with the browser's cookies relayed from the request headers.
import { createServerFn } from "@tanstack/react-start";
import type { DailyGoal, OnboardingInput } from "@verselab/shared/schemas/profile";
import { relayRequest } from "#/libs/relay.ts";

export const PROFILE_ALREADY_EXISTS = "PROFILE_ALREADY_EXISTS";
export const ONBOARDING_FAILED = "ONBOARDING_FAILED";

export class OnboardingError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status = 500) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export const submitOnboarding = createServerFn({ method: "POST" })
  .validator((input: OnboardingInput) => input)
  .handler(async ({ data }) => {
    const res = await relayRequest("/v1/onboarding", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });

    const text = await res.text();
    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      throw new OnboardingError(
        ONBOARDING_FAILED,
        `API returned non-JSON (${res.status}): ${text.slice(0, 200)}`,
        res.status,
      );
    }

    if (!res.ok) {
      const errBody = body as { ok?: boolean; error?: { code?: string; message?: string } } | null;
      const code = errBody?.error?.code ?? ONBOARDING_FAILED;
      const message = errBody?.error?.message ?? `API error ${res.status}`;
      throw new OnboardingError(code, message, res.status);
    }

    const okBody = body as {
      ok: boolean;
      data?: { profile: { userId: string; dailyGoal: DailyGoal } };
    };
    if (!okBody?.ok || !okBody?.data) {
      throw new OnboardingError(ONBOARDING_FAILED, "Unexpected API response shape", res.status);
    }

    return okBody.data;
  });
