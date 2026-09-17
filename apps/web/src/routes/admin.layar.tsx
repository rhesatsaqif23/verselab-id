import { createFileRoute } from "@tanstack/react-router";
import { AllScreensTable } from "#/features/admin/components/AllScreensTable.tsx";

export const Route = createFileRoute("/admin/layar")({
  component: AllScreensTable,
});
