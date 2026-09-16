// EditProfileDialog: edit displayName and avatar.
"use client";
import { Camera, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "#/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import { resolveSession, type ResolvedSession } from "#/libs/session.ts";
import { relayRequest } from "#/libs/relay.ts";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: ResolvedSession;
  onUpdated: (session: ResolvedSession) => void;
};

export default function EditProfileDialog({ open, onOpenChange, session, onUpdated }: Props) {
  const profile = session.status === "authenticated" ? session.profile : null;
  const [name, setName] = useState(session.status === "authenticated" ? session.user.name : "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatarUrl ?? null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    setSaving(true);
    try {
      let avatarUrl = profile?.avatarUrl ?? null;

      if (avatarFile) {
        const form = new FormData();
        form.append("file", avatarFile);
        const res = await relayRequest("/v1/user/me/avatar", {
          method: "POST",
          body: form,
        });
        if (res.ok) {
          const body = (await res.json()) as { data: { avatarUrl: string } };
          avatarUrl = body.data.avatarUrl;
        }
      }

      await relayRequest("/v1/user/me", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ displayName: name, avatarUrl }),
      });

      const updated = await resolveSession();
      onUpdated(updated);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Edit Profil</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="group relative"
            >
              <Avatar className="size-20 border-2 border-border">
                <AvatarImage src={avatarPreview ?? undefined} />
                <AvatarFallback className="bg-linear-to-br from-primary to-accent text-2xl font-black text-white">
                  {(name ?? "?").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera className="size-5 text-white" />
              </span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm">Nama</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="text-base" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSave} disabled={saving || !name.trim()}>
            {saving && <Loader2 className="mr-1.5 size-4 animate-spin" />}
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
