import { createFileRoute } from "@tanstack/react-router";
import { UnitList } from "#/features/admin/components/UnitList.tsx";

export const Route = createFileRoute("/admin/")({
  component: UnitList,
});
