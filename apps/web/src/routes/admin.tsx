import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { resolveSession } from "#/libs/session.ts";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "#/components/ui/sidebar.tsx";
import { Button } from "#/components/ui/button.tsx";
import { AdminBreadcrumb } from "#/features/admin/components/AdminBreadcrumb.tsx";
import { AdminSidebar } from "#/features/admin/components/AdminSidebar.tsx";
import { useSignOut } from "#/features/auth/use-sign-out.ts";
import { LogOut } from "lucide-react";

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
  const { signOut, pending } = useSignOut();

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger className="-ml-1" />
          <AdminBreadcrumb />
          <div className="ml-auto">
            <Link to="/home">
              <Button variant="ghost" size="sm" className="text-sm font-semibold text-muted-foreground hover:text-foreground gap-2">
                Lihat Situs
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              disabled={pending}
              className="text-sm font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-2"
            >
              <LogOut className="size-4" />
              Keluar
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
