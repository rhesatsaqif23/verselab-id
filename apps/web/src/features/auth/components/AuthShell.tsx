// AuthShell: shared centered layout for all auth screens (login, register,
// forgot/reset password). Provides the branded header and card chrome so each
// page only supplies its heading + form body + footer links.
import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "#/components/ui/card";
import ThemeToggle from "#/features/layout/components/ThemeToggle.tsx";

export function AuthShell({
  title,
  description,
  icon: Icon,
  children,
  footer,
}: {
  title: string;
  description: string;
  icon?: LucideIcon;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-50 flex h-20 items-center justify-between border-b border-border/80 bg-background/85 px-4 backdrop-blur-md transition-all md:px-16">
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

      <main className="flex flex-1 items-start justify-center px-4 py-8 sm:items-center sm:py-12">
        <Card className="island-shell w-full max-w-md">
          <CardContent className="flex flex-col gap-6 px-6 pt-8 pb-6 sm:px-8">
            {Icon && (
              <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-linear-to-br from-primary to-accent text-white shadow-xs">
                <Icon className="size-6" />
              </div>
            )}
            <div className="text-center">
              <h1 className="display-title text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                {title}
              </h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
                {description}
              </p>
            </div>
            {children}
            {footer && <div className="border-t border-border pt-5">{footer}</div>}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
