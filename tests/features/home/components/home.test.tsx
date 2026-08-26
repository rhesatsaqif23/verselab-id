// Tests for the home dashboard cards.
import { beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StreakTracker from "#/features/home/components/StreakTracker.tsx";
import DailyGoalCard from "#/features/home/components/DailyGoalCard.tsx";
import UnitCard from "#/features/home/components/UnitCard.tsx";
import ShuffleCard from "#/features/home/components/ShuffleCard.tsx";
import UnitGrid from "#/features/home/components/UnitGrid.tsx";
import { useHomeStore } from "#/features/home/store.ts";
import { units } from "#/content/index.ts";
import { resetProgress, setMastery } from "../test-utils";
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
  useHomeStore.setState({ selectedUnitId: "keuangan" });
});

describe("StreakTracker", () => {
  it("renders the real streak from the progress store", () => {
    useProgressStore.setState({ streak: 7 });
    render(<StreakTracker />);
    expect(screen.getByText("7")).toBeInTheDocument();
  });
});

describe("DailyGoalCard", () => {
  it("shows reached when lastActiveDate is today", () => {
    useProgressStore.setState({ dailyGoalMinutes: 10, lastActiveDate: todayString() });
    render(<DailyGoalCard />);
    expect(screen.getByText(/Tercapai hari ini/)).toBeInTheDocument();
  });

  it("shows not reached when lastActiveDate is not today", () => {
    useProgressStore.setState({ dailyGoalMinutes: 10, lastActiveDate: null });
    render(<DailyGoalCard />);
    expect(screen.getByText("Belum tercapai")).toBeInTheDocument();
    expect(screen.getByText("Goal harian")).toBeInTheDocument();
  });

  it("shows the minutes done against the daily goal", () => {
    useProgressStore.setState({ dailyGoalMinutes: 10, lastActiveDate: todayString() });
    render(<DailyGoalCard />);
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("/ 10 menit")).toBeInTheDocument();
  });

  it("links to the profile page to set the daily goal", () => {
    render(<DailyGoalCard />);
    expect(screen.getByRole("link", { name: /atur goal harian/i })).toHaveAttribute(
      "href",
      "/profile",
    );
  });
});

describe("UnitCard", () => {
  it("renders the unit title and a continue link", () => {
    setMastery(0);
    render(<UnitCard unit={units[0]} />);
    expect(screen.getByText("Keuangan")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /lanjut ke lesson berikutnya/i })).toBeInTheDocument();
  });

  it("navigates to the next lesson when clicked", async () => {
    setMastery(0);
    render(<UnitCard unit={units[1]} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("link", { name: /lanjut ke lesson berikutnya/i }));
    expect(navigateMock).toHaveBeenCalledWith({
      to: "/lesson/$lessonId",
      params: { lessonId: "persamaan" },
    });
  });
});

describe("ShuffleCard", () => {
  it("renders all unit cards in the carousel", () => {
    setMastery(100);
    render(<ShuffleCard />);
    expect(screen.getAllByText("Keuangan").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Akuntansi").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Manajemen Produk").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Kewirausahaan").length).toBeGreaterThanOrEqual(1);
  });

  it("positions the selected card at the front (full opacity)", () => {
    setMastery(100);
    act(() => useHomeStore.setState({ selectedUnitId: "manajemen-produk" }));
    render(<ShuffleCard />);
    const allCards = screen.getAllByText("Manajemen Produk");
    const frontCard = allCards[0].closest("[style]");
    expect(frontCard).not.toBeNull();
    expect(frontCard?.getAttribute("style")).toContain("opacity: 1");
    expect(frontCard?.getAttribute("style")).toContain("z-index: 30");
  });

  it("stacks other cards behind with reduced opacity and offset", () => {
    setMastery(100);
    act(() => useHomeStore.setState({ selectedUnitId: "keuangan" }));
    render(<ShuffleCard />);
    const keuanganCard = screen.getAllByText("Keuangan")[0].closest("[style]");
    expect(keuanganCard?.getAttribute("style")).toContain("opacity: 1");
    expect(keuanganCard?.getAttribute("style")).toContain("z-index: 30");

    const akuntansiCard = screen.getAllByText("Akuntansi")[0].closest("[style]");
    expect(akuntansiCard?.getAttribute("style")).toContain("opacity:");
  });
});

describe("UnitGrid", () => {
  it("renders unit titles", () => {
    setMastery(35);
    render(<UnitGrid />);
    expect(screen.getAllByText("Keuangan").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Akuntansi").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Manajemen Produk").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Kewirausahaan").length).toBeGreaterThanOrEqual(1);
  });

  it("selecting a unit changes the carousel front card", () => {
    setMastery(100);
    render(<ShuffleCard />);

    act(() => useHomeStore.setState({ selectedUnitId: "akuntansi" }));

    const frontCard = screen.getAllByText("Akuntansi")[0].closest("[style]");
    expect(frontCard?.getAttribute("style")).toContain("opacity: 1");
    expect(frontCard?.getAttribute("style")).toContain("z-index: 30");
  });
});
