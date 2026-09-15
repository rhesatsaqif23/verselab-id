import { Outlet, createFileRoute, redirect, useRouterState } from "@tanstack/react-router";
import Header from "#/features/layout/components/Header";
import Footer from "#/features/layout/components/Footer";
import { resolveSession } from "#/libs/session.ts";

export const Route = createFileRoute("/_home")({
  beforeLoad: async () => {
    const session = await resolveSession();
    if (session.status === "anonymous") {
      throw redirect({ to: "/login" });
    }
    if (!session.onboarded) {
      throw redirect({ to: "/onboarding" });
    }
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
