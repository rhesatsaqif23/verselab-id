// ProfilePage: avatar, stats, goal harian, and per-unit progress.
"use client";
import { useEffect, useState } from "react";
import { useLoaderData } from "@tanstack/react-router";
import { resolveSession, type ResolvedSession } from "#/libs/session.ts";
import type { Unit } from "#/engine/types.ts";
import ProfileHeader from "../components/ProfileHeader";
import StatsSection from "../components/StatsSection";
import GoalHarian from "../components/GoalHarian";
import UnitProgressCard from "../components/UnitProgressCard";

export default function ProfilePage() {
  const routeData = useLoaderData({ strict: false }) as { units: Unit[] } | undefined;
  const units = routeData?.units ?? [];
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
                title={unit.title}
                description={unit.description ?? undefined}
                imageUrl={unit.imageUrl ?? "/unit/placeholder.webp"}
                lessons={unit.lessons}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
