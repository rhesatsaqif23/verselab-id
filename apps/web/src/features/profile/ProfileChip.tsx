// ProfileChip: compact identity chip (display name + starting unit) sourced from
// the stored learning profile via resolveSession().profile.
"use client";
import { Loader2, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "#/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "#/components/ui/alert-dialog";
import { findUnit } from "#/content/index.ts";
import { useSignOut } from "#/features/auth/use-sign-out.ts";
import { resolveSession, type ResolvedSession } from "#/libs/session.ts";
import { cn } from "#/libs/utils.ts";

export default function ProfileChip({ className }: { className?: string }) {
  const [session, setSession] = useState<ResolvedSession | null>(null);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const { signOut, pending } = useSignOut();

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
    <>
      <div
        className={cn(
          "flex items-center gap-2.5 rounded-full border-2 border-border bg-card px-3.5 py-2 shadow-xs",
          className,
        )}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary to-accent text-sm font-black text-white">
          {initial}
        </span>
        <span className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="truncate text-sm font-bold text-foreground">{session.user.name}</span>
          {unit && <span className="text-xs font-medium text-muted">{unit.title}</span>}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setLogoutOpen(true)}
          disabled={pending}
          className="ml-2 hover:bg-destructive/10 hover:text-destructive"
          title="Keluar"
          aria-label="Keluar"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
        </Button>
      </div>

      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Keluar dari akun?</AlertDialogTitle>
            <AlertDialogDescription>
              Kamu perlu masuk kembali untuk melanjutkan belajar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={signOut}
              disabled={pending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {pending && <Loader2 className="mr-1.5 size-4 animate-spin" />}
              Keluar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
