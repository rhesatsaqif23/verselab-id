import { createFileRoute, Outlet } from "@tanstack/react-router"
import { useContentStore } from "#/content/contentStore.ts"

export const Route = createFileRoute("/admin")({
  beforeLoad: () => {
    useContentStore.getState().seedIfEmpty()
  },
  component: AdminLayout,
})

function AdminLayout() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Content Management</h1>
      <Outlet />
    </div>
  )
}