// ProfileHeader: avatar, name, join date, and edit button.
"use client";
import { Loader2, LogOut, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import { Button } from "#/components/ui/button";
import { resolveSession, type ResolvedSession } from "#/libs/session.ts";
import { useSignOut } from "#/features/auth/use-sign-out.ts";
import EditProfileDialog from "./EditProfileDialog";

export default function ProfileHeader() {
  const [session, setSession] = useState<ResolvedSession | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const { signOut, pending } = useSignOut();

  useEffect(() => {
    let active = true;
    resolveSession()
      .then((s) => {
        if (active) setSession(s);
      })
      .catch(() => {
        if (active) setSession({ status: "anonymous" });
      });
    return () => {
      active = false;
    };
  }, []);

  if (session?.status !== "authenticated") return null;

  const { user, profile } = session;
  const initial = (user.name ?? "?").charAt(0).toUpperCase();
  const joinDate = profile?.onboardedAt
    ? new Date(profile.onboardedAt).toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <>
      <div className="flex items-center gap-4">
        <Avatar className="size-16 border-2 border-border">
          <AvatarImage src={profile?.avatarUrl ?? undefined} alt={user.name} />
          <AvatarFallback className="bg-linear-to-br from-primary to-accent text-xl font-black text-white">
            {initial}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-black text-foreground truncate">{user.name}</h1>
          <p className="text-base text-muted truncate">{user.email}</p>
          {joinDate && <p className="text-sm text-muted mt-0.5">Bergabung {joinDate}</p>}
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} className="shrink-0">
          <Pencil className="mr-1.5 size-4" />
          Edit
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={signOut}
          disabled={pending}
          className="shrink-0 hover:bg-destructive/10"
        >
          {pending ? (
            <Loader2 className="mr-1.5 size-4 animate-spin" />
          ) : (
            <LogOut className="mr-1.5 size-4" />
          )}
          Keluar
        </Button>
      </div>

      <EditProfileDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        session={session}
        onUpdated={(s) => setSession(s)}
      />
    </>
  );
}
