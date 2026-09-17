// ProfilePage: avatar, stats, goal harian, and per-unit progress.
"use client";
import { useEffect, useState } from "react";
import { units } from "#/content/index.ts";
import { resolveSession, type ResolvedSession } from "#/libs/session.ts";
import ProfileHeader from "./ProfileHeader";
import StatsSection from "./StatsSection";
import GoalHarian from "./GoalHarian";
import UnitProgressCard from "./UnitProgressCard";

export default function ProfilePage() {
  const [session, setSession] = useState<ResolvedSession | null>(null);

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

  const profile = session?.status === "authenticated" ? session.profile : null;

  function handleProfileUpdated(updated: ResolvedSession) {
    setSession(updated);
  }

  return (
    <main className="page-wrap px-4 pb-16 pt-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <ProfileHeader />

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Statistik</h2>
          <StatsSection dailyGoal={profile?.dailyGoal ?? "regular"} />
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Goal harian</h2>
          <GoalHarian onUpdated={handleProfileUpdated} />
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-foreground">Progress materi</h2>
          </div>
          <div className="space-y-3">
            {units.map((unit) => (
              <UnitProgressCard
                key={unit.id}
                unitId={unit.id}
                title={unit.title}
                description={unit.description}
                imageUrl={unit.imageUrl}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
