// Tests for the profile page stats and unit progress cards.
import { beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { act, render, screen } from "@testing-library/react";
import ProfilePage from "#/features/profile/index.tsx";
import { resetProgress } from "../home/test-utils.tsx";
import { useProgressStore } from "#/engine/progress/progressStore.ts";

const { resolveSessionMock } = vi.hoisted(() => ({
  resolveSessionMock: vi.fn(),
}));

vi.mock("#/libs/session.ts", () => ({
  resolveSession: resolveSessionMock,
}));

beforeEach(() => {
  resetProgress();
  resolveSessionMock.mockReset();
  resolveSessionMock.mockResolvedValue({ status: "anonymous" });
});

async function renderPage() {
  await act(async () => {
    render(<ProfilePage />);
    await new Promise((r) => setTimeout(r, 0));
  });
}

describe("ProfilePage", () => {
  it("shows section titles outside cards", async () => {
    await renderPage();
    expect(screen.getByText("Statistik")).toBeInTheDocument();
    expect(screen.getAllByText("Goal harian").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Progress materi")).toBeInTheDocument();
  });

  it("shows streak in stats", async () => {
    useProgressStore.setState({ streak: 7 });
    await renderPage();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("Runtunan hari")).toBeInTheDocument();
  });

  it("shows total XP in stats", async () => {
    useProgressStore.setState({ xp: 250 });
    await renderPage();
    expect(screen.getByText("250")).toBeInTheDocument();
    expect(screen.getByText("Total XP")).toBeInTheDocument();
  });

  it("shows 4 stat cards", async () => {
    await renderPage();
    expect(screen.getByText("Runtunan hari")).toBeInTheDocument();
    expect(screen.getByText("Total XP")).toBeInTheDocument();
    expect(screen.getByText("Lesson selesai")).toBeInTheDocument();
    expect(screen.getAllByText("Goal harian").length).toBeGreaterThanOrEqual(1);
  });

  it("renders per-unit progress cards with descriptions", async () => {
    await renderPage();
    expect(screen.getByText("Keuangan")).toBeInTheDocument();
    expect(screen.getByText("Menabung, anggaran, cicilan, dan nilai waktu uang.")).toBeInTheDocument();
    expect(screen.getByText("Akuntansi")).toBeInTheDocument();
    expect(screen.getByText("Manajemen Produk")).toBeInTheDocument();
    expect(screen.getByText("Kewirausahaan")).toBeInTheDocument();
  });

  it("shows lesson counts for each unit", async () => {
    await renderPage();
    expect(screen.getAllByText("0/4")).toHaveLength(4);
  });

  it("shows completed lesson count when lessons are done", async () => {
    useProgressStore.setState({ completedLessons: ["nabung-awal", "nilai-waktu-uang"] });
    await renderPage();
    expect(screen.getByText("2/4")).toBeInTheDocument();
  });
});
