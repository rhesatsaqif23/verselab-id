// Tests for UnitDetailPage empty state (unit without lessons).
import { describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
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

    expect(screen.getByText("Belum ada topik")).toBeInTheDocument();
    expect(screen.getByText(/sedang disiapkan/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /materi lain/i })).toHaveAttribute("href", "/material");
  });

  it("renders lesson cards when lessons exist", () => {
    render(<UnitDetailPage unit={makeUnit([{ id: "l-1", title: "Lesson 1", screens: [] }])} />);

    expect(screen.queryByText("Belum ada topik")).toBeNull();
    expect(screen.getAllByText("Lesson 1").length).toBeGreaterThan(0);
  });
});
