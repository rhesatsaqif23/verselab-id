import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/$unitSlug")({
  component: AdminUnitLayout,
});

function AdminUnitLayout() {
  return <Outlet />;
}
