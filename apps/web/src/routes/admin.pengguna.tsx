import { createFileRoute } from "@tanstack/react-router";
import { UsersTable } from "#/features/admin/pages/UsersTable.tsx";

export const Route = createFileRoute("/admin/pengguna")({
  component: UsersTable,
});
