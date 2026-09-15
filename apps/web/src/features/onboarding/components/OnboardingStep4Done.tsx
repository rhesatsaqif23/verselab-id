// Step 4: Completion — celebration screen with the CTA to start learning.
import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { Button } from "#/components/ui/button";
import { findUnit } from "#/content/index.ts";
import MascotBubble from "./MascotBubble";

export default function OnboardingStep4Done({
  displayName,
  startUnitId,
}: {
  displayName: string;
  startUnitId: string;
}) {
  const unit = findUnit(startUnitId);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center animate-slide-up-enter">
      <MascotBubble />
      <div>
        <h1 className="text-3xl font-black tracking-tight text-foreground">
          Kamu siap, {displayName}!
        </h1>
        <p className="mt-3 text-base leading-7 text-muted-foreground">
          Ayo mulai petualangan belajarmu di{" "}
          <span className="font-bold text-primary">{unit?.title ?? "unit pilihan"}</span>.
        </p>
      </div>
      <div className="flex w-full max-w-sm flex-col gap-3 pt-2">
        <Button asChild size="lg" className="w-full font-bold">
          <Link to="/units/$unitId" params={{ unitId: startUnitId }}>
            <Sparkles className="size-4" />
            Mulai Belajar
          </Link>
        </Button>
        <Button asChild variant="ghost" className="w-full">
          <Link to="/">Nanti saja</Link>
        </Button>
      </div>
    </div>
  );
}
