// OnboardingWizard: multi-step Duolingo-style onboarding wizard that collects
// display name, purpose, topic, and daily goal. Manages step transitions,
// back/next navigation, and submits the full profile on completion.
"use client";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "#/components/ui/button";
import { Wrench } from "lucide-react";
import { useOnboarding } from "../hook/use-onboarding.ts";
import { STEP_BUBBLES } from "../constants.ts";
import MascotBubble from "./MascotBubble";
import OnboardingProgressBar from "./OnboardingProgressBar.tsx";
import OnboardingStep0Welcome from "./OnboardingStep0Welcome.tsx";
import OnboardingStep1Purpose from "./OnboardingStep1Purpose.tsx";
import OnboardingStep2Topic from "./OnboardingStep2Topic.tsx";
import OnboardingStep3Goal from "./OnboardingStep3Goal.tsx";
import OnboardingStep4Done from "./OnboardingStep4Done.tsx";
import type { OnboardingInput } from "@verselab/shared/schemas/profile";

const TOTAL_STEPS = 4;

export default function OnboardingWizard({ defaultName }: { defaultName?: string }) {
  const { submit, submitting, error } = useOnboarding();
  const [step, setStep] = useState(0);
  const [displayName] = useState(defaultName ?? "");
  const [purpose, setPurpose] = useState<string | undefined>();
  const [startUnitId, setStartUnitId] = useState<string | undefined>();
  const [dailyGoal, setDailyGoal] = useState<string | undefined>();

  const canAdvance =
    step === 0 ||
    (step === 1 && purpose != null) ||
    (step === 2 && startUnitId != null) ||
    (step === 3 && dailyGoal != null);

  function handleNext() {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    }
  }

  function handleBack() {
    if (step > 0) setStep(step - 1);
  }

  function handleComplete() {
    if (!startUnitId || !dailyGoal) return;
    const input: OnboardingInput = {
      displayName: displayName || "Siswa",
      startUnitId: startUnitId as OnboardingInput["startUnitId"],
      dailyGoal: dailyGoal as OnboardingInput["dailyGoal"],
      purpose: purpose as OnboardingInput["purpose"],
    };
    submit(input);
  }

  const bubbleText = STEP_BUBBLES[step]?.(displayName);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top bar: back + progress */}
      <div className="flex items-center gap-4 px-4 py-4 md:px-16">
        {step > 0 && step < TOTAL_STEPS ? (
          <button
            type="button"
            onClick={handleBack}
            aria-label="Kembali"
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-foreground/70 transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-6 stroke-2" />
          </button>
        ) : (
          <div className="size-10 shrink-0" />
        )}
        <div className="flex-1">
          <OnboardingProgressBar current={step} total={TOTAL_STEPS} />
        </div>
        <div className="size-10 shrink-0" />
      </div>

      {/* Content area */}
      <main className="flex flex-1 flex-col px-4 py-4">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
          {/* Mascot + bubble */}
          <div className="mb-6">
            <MascotBubble message={bubbleText} />
          </div>

          {/* Step content */}
          <div className="flex flex-1 flex-col">
            {step === 0 && <OnboardingStep0Welcome name={displayName} />}
            {step === 1 && <OnboardingStep1Purpose value={purpose} onSelect={setPurpose} />}
            {step === 2 && <OnboardingStep2Topic value={startUnitId} onSelect={setStartUnitId} />}
            {step === 3 && <OnboardingStep3Goal value={dailyGoal} onSelect={setDailyGoal} />}
            {step === 4 && (
              <OnboardingStep4Done displayName={displayName} startUnitId={startUnitId!} />
            )}
          </div>
        </div>
      </main>

      {/* Bottom action */}
      {step < TOTAL_STEPS && (
        <div className="flex justify-end px-4 py-4 md:px-16">
          <Button
            size="lg"
            className="min-w-[140px] font-bold"
            disabled={!canAdvance || submitting}
            onClick={step === TOTAL_STEPS - 1 ? handleComplete : handleNext}
          >
            {submitting ? <Wrench className="size-4 animate-spin" /> : "Lanjutkan"}
          </Button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="px-4 pb-4 text-center">
          <p className="text-sm font-medium text-destructive">{error}</p>
        </div>
      )}
    </div>
  );
}
