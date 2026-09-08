// Tests for the profile page stats and mastery progress.
import { beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProfilePage from "#/features/profile/index.tsx";
import { resetProgress } from "../home/test-utils.tsx";
import { useProgressStore } from "#/engine/progress/progressStore.ts";
import { todayString } from "#/libs/date.ts";

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }));

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigateMock,
  Link: ({
    to,
    params,
    children,
  }: {
    to: string;
    params?: Record<string, string>;
    children: React.ReactNode;
  }) => (
    <a
      href={params ? `${to}/${params.lessonId}` : to}
      onClick={(e) => {
        e.preventDefault();
        if (params) navigateMock({ to, params });
        else navigateMock({ to });
      }}
    >
      {children}
    </a>
  ),
}));

beforeEach(() => {
  resetProgress();
  navigateMock.mockReset();
});

describe("ProfilePage", () => {
  it("shows total XP", () => {
    useProgressStore.setState({ xp: 250 });
    render(<ProfilePage />);
    expect(screen.getByText("250")).toBeInTheDocument();
    expect(screen.getByText("XP")).toBeInTheDocument();
  });

  it("shows streak and freeze count", () => {
    useProgressStore.setState({ streak: 7, streakFreeze: 1 });
    render(<ProfilePage />);
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText(/Streak \(1\)/)).toBeInTheDocument();
  });

  it("shows zero for a fresh user", () => {
    render(<ProfilePage />);
    expect(screen.getAllByText("0")).toHaveLength(2);
    expect(screen.getByText("XP")).toBeInTheDocument();
  });

  it("renders per-unit mastery bars with decayed values", () => {
    useProgressStore.setState({
      mastery: { keuangan: 60 },
      masteryUpdatedAt: { keuangan: todayString() },
    });
    render(<ProfilePage />);
    expect(screen.getByText("Keuangan")).toBeInTheDocument();
    expect(screen.getByText("60%")).toBeInTheDocument();
  });

  it("shows 0% for untouched units", () => {
    render(<ProfilePage />);
    expect(screen.getAllByText("0%").length).toBeGreaterThanOrEqual(4);
  });

  it("navigates to the unit lesson when clicked", async () => {
    render(<ProfilePage />);
    const user = userEvent.setup();
    await user.click(screen.getByText("Keuangan"));
    expect(navigateMock).toHaveBeenCalledWith({
      to: "/lesson/$lessonId",
      params: { lessonId: "nabung-awal" },
    });
  });
});
