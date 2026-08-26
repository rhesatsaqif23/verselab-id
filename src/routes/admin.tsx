import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useContentStore } from "#/content/contentStore.ts";
import Header from "#/features/layout/components/Header.tsx";
import Footer from "#/features/layout/components/Footer.tsx";

export const Route = createFileRoute("/admin")({
  beforeLoad: () => {
    useContentStore.getState().seedIfEmpty();
  },
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="container mx-auto flex-1 p-4">
        <h1 className="mb-6 text-2xl font-black">Manajemen Konten</h1>
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
