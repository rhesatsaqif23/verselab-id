import { Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import Header from "#/features/layout/components/Header";
import Footer from "#/features/layout/components/Footer";

export const Route = createFileRoute("/_home")({
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
