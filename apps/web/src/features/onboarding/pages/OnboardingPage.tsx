// OnboardingPage: full-screen Duolingo-style onboarding wizard. Rendered
// outside the _home layout chrome.
"use client";
import { Link } from "@tanstack/react-router";
import { authClient } from "#/libs/auth-client.ts";
import ThemeToggle from "#/features/layout/components/ThemeToggle.tsx";
import OnboardingWizard from "../components/OnboardingWizard.tsx";

export function OnboardingPage() {
  const session = authClient.useSession();
  const defaultName = session.data?.user?.name;

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-background">
      <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between border-b border-border/80 bg-background/85 px-4 backdrop-blur-md transition-all md:px-16">
        <Link to="/" className="flex items-center no-underline">
          <img
            src="/assets/horizontal_logo_dark.svg"
            alt="Verselab"
            className="h-8 w-auto dark:hidden sm:h-9"
          />
          <img
            src="/assets/horizontal_logo_light.svg"
            alt="Verselab"
            className="hidden h-8 w-auto dark:block sm:h-9"
          />
        </Link>
        <ThemeToggle />
      </header>

      <div className="flex min-h-0 flex-1 flex-col">
        <OnboardingWizard defaultName={defaultName} />
      </div>
    </div>
  );
}
