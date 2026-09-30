// Tests for UnitDetailPage empty state (unit without lessons).
import { describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import UnitDetailPage from "#/features/unit-detail/pages/UnitDetailPage.tsx";
import type { Unit } from "#/engine/types.ts";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to}>{children}</a>
  ),
}));

function makeUnit(lessons: Unit["lessons"]): Unit {
  return { id: "u-1", slug: "unit-1", title: "Unit 1", lessons };
}

describe("UnitDetailPage", () => {
  it("shows an empty state when the unit has no lessons", () => {
    render(<UnitDetailPage unit={makeUnit([])} />);

    // Canvas empty state + sidebar Daftar Topik empty state.
    expect(screen.getAllByText("Belum ada topik")).toHaveLength(2);
    expect(screen.getAllByText(/sedang disiapkan/).length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /materi lain/i })).toHaveAttribute("href", "/material");
  });

  it("starts with the sidebar closed on a phone viewport", async () => {
    const originalWidth = window.innerWidth;
    window.innerWidth = 360;
    try {
      render(<UnitDetailPage unit={makeUnit([{ id: "l-1", title: "Lesson 1", screens: [] }])} />);
      expect((await screen.findAllByText("Lesson 1")).length).toBeGreaterThan(0);
      await waitFor(() =>
        expect(screen.getByRole("button", { name: /buka sidebar/i })).toBeInTheDocument(),
      );
    } finally {
      window.innerWidth = originalWidth;
    }
  });

  it("renders lesson cards when lessons exist", () => {
    render(<UnitDetailPage unit={makeUnit([{ id: "l-1", title: "Lesson 1", screens: [] }])} />);

    expect(screen.queryByText("Belum ada topik")).toBeNull();
    expect(screen.getAllByText("Lesson 1").length).toBeGreaterThan(0);
  });
});
