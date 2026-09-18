// OnboardingWelcome: celebratory post-onboarding screen showing the user's
// chosen name and starting unit with a call to action to begin learning.
"use client";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { Button } from "#/components/ui/button";
import { getUnit } from "#/libs/content-fns.ts";
import type { OnboardingState } from "../types.ts";

export function OnboardingWelcome({ state }: { state: OnboardingState }) {
  const [unitTitle, setUnitTitle] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getUnit({ data: state.startUnitId }).then((unit) => {
      if (active) setUnitTitle(unit?.title ?? null);
    });
    return () => {
      active = false;
    };
  }, [state.startUnitId]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="flex max-w-md w-full flex-col items-center gap-8 text-center">
        <img
          src="/lesson-complete-star.png"
          alt="Selamat datang"
          className="animate-bounce-in h-28 w-28 object-contain"
        />
        <div>
          <h1 className="text-4xl font-black text-foreground">
            Selamat datang, {state.displayName}!
          </h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            Kamu siap memulai petualangan belajarmu di{" "}
            <span className="font-bold text-primary">{unitTitle ?? "unit pilihan"}</span>.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 pt-2">
          <Button asChild size="lg" className="w-full font-bold">
            <Link to="/units/$unitId" params={{ unitId: state.startUnitId }}>
              <Sparkles className="size-4" />
              Mulai Belajar
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link to="/home">Nanti saja</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
