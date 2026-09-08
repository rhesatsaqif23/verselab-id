// Render tests for the header navigation.
import { beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { useProgressStore } from "#/engine/progress/progressStore.ts";
import Header from "#/features/layout/components/Header.tsx";

beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
});

const { locationMock } = vi.hoisted(() => ({ locationMock: { pathname: "/" } }));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to}>{children}</a>
  ),
  useLocation: () => locationMock,
}));

beforeEach(() => {
  localStorage.clear();
  useProgressStore.setState({
    xp: 0,
    dailyGoalMinutes: 10,
    streak: 0,
    streakFreeze: 0,
    lastActiveDate: null,
    mastery: {},
    masteryUpdatedAt: {},
  });
});

describe("Header", () => {
  it("renders real streak from the progress store", () => {
    useProgressStore.setState({ streak: 7 });
    render(<Header />);
    expect(screen.getByText("7")).toBeInTheDocument();
  });

  it("renders real XP from the progress store", () => {
    useProgressStore.setState({ xp: 120 });
    render(<Header />);
    expect(screen.getByText("120")).toBeInTheDocument();
  });

  it("shows zero streak and XP for a fresh user", () => {
    render(<Header />);
    expect(screen.getAllByText("0")).toHaveLength(2);
  });
});
