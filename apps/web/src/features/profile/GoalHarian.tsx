// GoalHarian: radio button daily goal selector with confirm button and toast feedback.
"use client";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "#/components/ui/card";
import { Button } from "#/components/ui/button";
import { type DailyGoal } from "@verselab/shared/schemas/profile";
import { resolveSession, type ResolvedSession } from "#/libs/session.ts";
import { relayRequest } from "#/libs/relay.ts";

const DAILY_GOALS: { value: DailyGoal; label: string; desc: string }[] = [
  { value: "casual", label: "5 menit", desc: "Santai" },
  { value: "regular", label: "10 menit", desc: "Regular" },
  { value: "serious", label: "20 menit", desc: "Serius" },
];

type Props = {
  onUpdated: (session: ResolvedSession) => void;
};

export default function GoalHarian({ onUpdated }: Props) {
  const [session, setSession] = useState<ResolvedSession | null>(null);
  const [selected, setSelected] = useState<DailyGoal>("regular");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    resolveSession()
      .then((s) => {
        if (active) {
          setSession(s);
          if (s.status === "authenticated" && s.profile?.dailyGoal) {
            setSelected(s.profile.dailyGoal);
          }
        }
      })
      .catch(() => {
        if (active) setSession({ status: "anonymous" });
      });
    return () => {
      active = false;
    };
  }, []);

  const currentGoal = session?.status === "authenticated" ? (session.profile?.dailyGoal ?? "regular") : "regular";
  const hasChanges = selected !== currentGoal;

  async function handleConfirm() {
    if (!hasChanges || saving) return;
    setSaving(true);
    try {
      const res = await relayRequest("/v1/user/me", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ dailyGoal: selected }),
      });
      if (!res.ok) {
        toast.error("Gagal menyimpan goal harian");
        return;
      }
      const updated = await resolveSession();
      setSession(updated);
      onUpdated(updated);
      toast.success("Goal harian tersimpan");
    } catch {
      toast.error("Gagal menyimpan goal harian");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="p-4">
      <CardContent className="p-0 space-y-4">
        <div className="space-y-3">
          {DAILY_GOALS.map((g) => (
            <label
              key={g.value}
              className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                selected === g.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted/30"
              }`}
            >
              <input
                type="radio"
                name="dailyGoal"
                value={g.value}
                checked={selected === g.value}
                onChange={() => setSelected(g.value)}
                className="sr-only"
              />
              <span
                className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
                  selected === g.value ? "border-primary" : "border-muted-foreground/30"
                }`}
              >
                {selected === g.value && (
                  <span className="size-2.5 rounded-full bg-primary" />
                )}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-foreground">{g.label}</p>
                <p className="text-sm text-muted">{g.desc}</p>
              </div>
            </label>
          ))}
        </div>

        {hasChanges && (
          <Button onClick={handleConfirm} disabled={saving} className="w-full">
            {saving && <Loader2 className="mr-1.5 size-4 animate-spin" />}
            Simpan
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
