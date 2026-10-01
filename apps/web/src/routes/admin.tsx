import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { resolveSession } from "#/libs/session.ts";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "#/components/ui/sidebar.tsx";
import { Button } from "#/components/ui/button.tsx";
import { AdminBreadcrumb } from "#/features/admin/components/AdminBreadcrumb.tsx";
import { AdminSidebar } from "#/features/admin/components/AdminSidebar.tsx";
import { useSignOut } from "#/features/auth/hooks/useSignOut.ts";
import { LogOut } from "lucide-react";
import BottomNav from "#/features/layout/components/BottomNav.tsx";

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
        <header className="flex min-h-16 shrink-0 flex-wrap items-center gap-2 border-b border-border bg-card px-4 py-2 sm:gap-3">
          <SidebarTrigger className="-ml-1" />
          <div className="hidden min-w-0 flex-1 overflow-hidden sm:block">
            <AdminBreadcrumb />
          </div>
          <div className="ml-auto flex items-center gap-1">
            <Link to="/home">
              <Button
                variant="ghost"
                size="sm"
                className="text-[15px] font-semibold text-foreground hover:text-primary gap-2"
              >
                Kembali
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              disabled={pending}
              className="text-[15px] font-semibold text-foreground hover:text-destructive hover:bg-destructive/10 gap-2"
            >
              <LogOut className="size-4" />
              Keluar
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 pb-16 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
      <BottomNav />
    </SidebarProvider>
  );
}
