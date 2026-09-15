// OnboardingPage: full-screen Duolingo-style onboarding wizard. Rendered
// outside the _home layout chrome.
"use client";
import { Link } from "@tanstack/react-router";
import { authClient } from "#/libs/auth-client.ts";
import ThemeToggle from "#/features/layout/components/ThemeToggle.tsx";
import OnboardingWizard from "./components/OnboardingWizard.tsx";

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

      <OnboardingWizard defaultName={defaultName} />
    </div>
  );
}
