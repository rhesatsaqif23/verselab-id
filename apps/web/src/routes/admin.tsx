import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { resolveSession } from "#/libs/session.ts";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "#/components/ui/sidebar.tsx";
import { Separator } from "#/components/ui/separator.tsx";
import { AdminSidebar } from "#/features/admin/components/AdminSidebar.tsx";
import { AdminBreadcrumb } from "#/features/admin/components/AdminBreadcrumb.tsx";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    const session = await resolveSession();
    if (session.status === "anonymous" || session.role !== "admin") {
      throw redirect({ to: "/home" });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <AdminBreadcrumb />
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
