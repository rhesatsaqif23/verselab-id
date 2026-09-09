// OnboardingPage: full-screen learning-profile setup (display name, starting
// unit, daily goal). Rendered outside the _home layout chrome.
"use client";
import { Link } from "@tanstack/react-router";
import { authClient } from "#/libs/auth-client.ts";
import ThemeToggle from "#/features/layout/components/ThemeToggle.tsx";
import { OnboardingForm } from "./components/OnboardingForm.tsx";

export function OnboardingPage() {
  const session = authClient.useSession();
  const defaultName = session.data?.user?.name;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 flex h-20 items-center justify-between border-b border-border/80 bg-background/85 px-4 backdrop-blur-md transition-all md:px-16">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <div className="flex size-9 items-center justify-center rounded-lg bg-linear-to-br from-primary to-accent font-black text-white shadow-xs">
            V
          </div>
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Verselab
          </span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 flex-col items-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <p className="island-kicker">Ayo mulai</p>
            <h1 className="display-title mt-2 text-3xl font-black tracking-tight text-foreground">
              Siapkan profil belajarmu
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-base leading-7 text-muted-foreground">
              Pilih nama panggilan, unit awal, dan target harianmu. Kamu bisa
              mengubahnya kapan saja.
            </p>
          </div>
          <OnboardingForm defaultName={defaultName} />
        </div>
      </main>
    </div>
  );
}
