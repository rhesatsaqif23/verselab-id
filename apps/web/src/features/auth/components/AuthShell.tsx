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

      <main className="flex flex-1 items-center justify-center px-4 py-12">
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
