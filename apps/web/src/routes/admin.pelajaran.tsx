import { createFileRoute } from "@tanstack/react-router";
import { AllLessonsTable } from "#/features/admin/components/AllLessonsTable.tsx";

export const Route = createFileRoute("/admin/pelajaran")({
  component: AllLessonsTable,
});
