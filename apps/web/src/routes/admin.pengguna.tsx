import { createFileRoute } from "@tanstack/react-router";
import { UsersTable } from "#/features/admin/components/UsersTable.tsx";

export const Route = createFileRoute("/admin/pengguna")({
  component: UsersTable,
});
