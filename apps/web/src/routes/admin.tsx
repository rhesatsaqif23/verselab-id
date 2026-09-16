import { createFileRoute, Outlet } from "@tanstack/react-router";
import Header from "#/features/layout/components/Header.tsx";
import Footer from "#/features/layout/components/Footer.tsx";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="container mx-auto flex-1 px-4 py-8 md:py-12">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
