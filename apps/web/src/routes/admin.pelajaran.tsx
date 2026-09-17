import { createFileRoute } from "@tanstack/react-router";
import { AllLessonsTable } from "#/features/admin/pages/AllLessonsTable.tsx";

export const Route = createFileRoute("/admin/pelajaran")({
  component: AllLessonsTable,
});
