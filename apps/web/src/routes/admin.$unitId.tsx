import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/$unitId")({
  component: AdminUnitLayout,
});

function AdminUnitLayout() {
  return <Outlet />;
}
