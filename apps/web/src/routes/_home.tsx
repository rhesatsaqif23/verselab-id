import { Outlet, createFileRoute, redirect, useRouterState } from "@tanstack/react-router";
import Header from "#/features/layout/components/Header";
import Footer from "#/features/layout/components/Footer";
import { resolveSession } from "#/libs/session.ts";
import { loadProgress } from "#/engine/progress/sync.ts";
import { useProgressStore } from "#/engine/progress/progressStore.ts";
import { migrateLegacyProgress } from "#/engine/progress/migrate.ts";
import { getAllUnits } from "#/libs/content-fns.ts";

export const Route = createFileRoute("/_home")({
  beforeLoad: async () => {
    const session = await resolveSession();
    if (session.status === "anonymous") {
      throw redirect({ to: "/login" });
    }
    if (!session.onboarded) {
      throw redirect({ to: "/onboarding" });
    }

    const [progress, units] = await Promise.all([loadProgress(), getAllUnits()]);
    if (progress) {
      useProgressStore.getState().hydrateFromServer(progress);
    }
    await migrateLegacyProgress();
    return { units };
  },
  component: HomeLayout,
});

function HomeLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isUnitMap = pathname.startsWith("/units/");

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <Outlet />
      {!isUnitMap && <Footer />}
    </div>
  );
}
