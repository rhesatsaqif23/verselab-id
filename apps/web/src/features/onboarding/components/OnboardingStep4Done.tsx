// Step 4: Completion — celebration text. CTA is handled by the wizard.
import { useEffect, useState } from "react";
import { getUnit } from "#/libs/content-fns.ts";

export default function OnboardingStep4Done({
  displayName,
  startUnitId,
}: {
  displayName: string;
  startUnitId: string;
}) {
  const [unitTitle, setUnitTitle] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getUnit({ data: startUnitId }).then((unit) => {
      if (active) setUnitTitle(unit?.title ?? null);
    });
    return () => {
      active = false;
    };
  }, [startUnitId]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center animate-slide-up-enter">
      <h1 className="text-3xl font-black tracking-tight text-foreground">
        Kamu siap, {displayName}!
      </h1>
      <p className="text-base leading-7 text-muted-foreground">
        Ayo mulai petualangan belajarmu di{" "}
        <span className="font-bold text-primary">{unitTitle ?? "unit pilihan"}</span>.
      </p>
    </div>
  );
}
