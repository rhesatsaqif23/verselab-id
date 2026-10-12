// Render tests for the mobile bottom tab bar.
import { describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import BottomNav from "#/features/layout/components/BottomNav.tsx";

const { locationMock, sessionMock } = vi.hoisted(() => ({
  locationMock: { pathname: "/home" },
  sessionMock: { role: "user" as string },
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children, ...rest }: { to: string; children: React.ReactNode }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
  useLocation: () => locationMock,
}));

vi.mock("#/libs/session.ts", () => ({
  resolveSession: async () =>
    sessionMock.role === "admin"
      ? { status: "authenticated" as const, role: "admin" }
      : { status: "anonymous" as const },
}));

function renderNav() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <BottomNav />
    </QueryClientProvider>,
  );
}

describe("BottomNav", () => {
  it("renders the three learner destinations", () => {
    renderNav();
    expect(screen.getByRole("link", { name: /beranda/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /materi/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /profil/i })).toBeInTheDocument();
  });

  it("marks the current route as the active page", () => {
    locationMock.pathname = "/material";
    renderNav();
    expect(screen.getByRole("link", { name: /materi/i })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: /beranda/i })).not.toHaveAttribute("aria-current");
    locationMock.pathname = "/home";
  });

  it("omits the admin entry for learners", async () => {
    sessionMock.role = "user";
    renderNav();
    await waitFor(() => expect(screen.queryByRole("link", { name: /admin/i })).toBeNull());
  });

  it("adds the admin entry for admins", async () => {
    sessionMock.role = "admin";
    renderNav();
    expect(await screen.findByRole("link", { name: /admin/i })).toBeInTheDocument();
    sessionMock.role = "user";
  });
});
