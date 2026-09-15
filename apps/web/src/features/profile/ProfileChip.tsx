// ProfileChip: compact identity chip (display name + starting unit) sourced from
// the stored learning profile via resolveSession().profile.
"use client";
import { useEffect, useState } from "react";
import { resolveSession, type ResolvedSession } from "#/libs/session.ts";
import { findUnit } from "#/content/index.ts";
import { cn } from "#/libs/utils.ts";

export default function ProfileChip({ className }: { className?: string }) {
  const [session, setSession] = useState<ResolvedSession | null>(null);

  useEffect(() => {
    let active = true;
    resolveSession()
      .then((result) => {
        if (active) setSession(result);
      })
      .catch(() => {
        if (active) setSession({ status: "anonymous" });
      });
    return () => {
      active = false;
    };
  }, []);

  if (session?.status !== "authenticated") return null;

  const unit = session.profile ? findUnit(session.profile.startUnitId) : undefined;
  const initial = (session.user.name ?? "?").charAt(0).toUpperCase();

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-full border-2 border-border bg-card px-3 py-2",
        className,
      )}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary to-accent text-sm font-black text-white">
        {initial}
      </span>
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-sm font-bold text-foreground">{session.user.name}</span>
        {unit && <span className="text-xs font-medium text-muted">{unit.title}</span>}
      </span>
    </div>
  );
}
