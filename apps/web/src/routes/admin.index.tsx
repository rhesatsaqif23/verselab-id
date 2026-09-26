import { createFileRoute } from "@tanstack/react-router";
import { UnitList } from "#/features/admin/pages/UnitList.tsx";

export const Route = createFileRoute("/admin/")({
  component: UnitList,
});
