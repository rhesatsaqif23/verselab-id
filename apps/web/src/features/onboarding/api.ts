// Onboarding API: server function that POSTs the learning profile to the API
// with the browser's cookies relayed from the request headers.
import { createServerFn } from "@tanstack/react-start";
import type { DailyGoal, OnboardingInput } from "@verselab/shared/schemas/profile";
import { relayRequest } from "#/libs/relay.ts";

export const submitOnboarding = createServerFn({ method: "POST" })
  .validator((input: OnboardingInput) => input)
  .handler(async ({ data }) => {
    const res = await relayRequest("/v1/onboarding", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });

    const body = (await res.json().catch(() => null)) as
      | { ok: true; data: { profile: { userId: string; dailyGoal: DailyGoal } } }
      | { ok: false; error: { code: string; message: string } }
      | null;

    if (!res.ok || !body || !body.ok) {
      const code = body && !body.ok ? body.error.code : undefined;
      throw new Error(code ?? "ONBOARDING_FAILED");
    }

    return body.data;
  });
