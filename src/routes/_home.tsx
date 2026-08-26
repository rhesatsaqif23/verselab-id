// Home layout route: wraps child pages with the app header and footer.
import { Outlet, createFileRoute } from "@tanstack/react-router";
import Header from "#/features/layout/components/Header";
import Footer from "#/features/layout/components/Footer";

export const Route = createFileRoute("/_home")({
  component: HomeLayout,
});

function HomeLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}
