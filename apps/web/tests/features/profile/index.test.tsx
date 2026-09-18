// Tests for the profile page stats and unit progress cards.
import { beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { act, render, screen } from "@testing-library/react";
import { ProfilePage } from "#/features/profile";
import { resetProgress } from "../home/test-utils.tsx";
import { useProgressStore } from "#/engine/progress/progressStore.ts";

const { resolveSessionMock } = vi.hoisted(() => ({
  resolveSessionMock: vi.fn(),
}));

vi.mock("#/libs/session.ts", () => ({
  resolveSession: resolveSessionMock,
}));

vi.mock("@tanstack/react-router", () => ({
  useLoaderData: () => ({
    units: [
      { id: "keuangan", title: "Keuangan", description: "Menabung, anggaran, cicilan, dan nilai waktu uang.", imageUrl: "/unit/keuangan.webp", lessons: [
        { id: "nabung-awal", title: "Nabung Awal", screens: [] },
        { id: "nilai-waktu-uang", title: "Nilai Waktu Uang", screens: [] },
        { id: "anggaran-bulanan", title: "Anggaran Bulanan", screens: [] },
        { id: "hutang-cicilan", title: "Hutang & Cicilan", screens: [] },
      ] },
      { id: "akuntansi", title: "Akuntansi", description: "Persamaan dasar, pencatatan transaksi, laba rugi, dan arus kas.", imageUrl: "/unit/akuntansi.webp", lessons: [
        { id: "persamaan", title: "Persamaan", screens: [] },
        { id: "transaksi", title: "Transaksi", screens: [] },
        { id: "laba-rugi", title: "Laba Rugi", screens: [] },
        { id: "arus-kas", title: "Arus Kas", screens: [] },
      ] },
      { id: "manajemen-produk", title: "Manajemen Produk", description: "Temukan masalah, prioritaskan fitur, ukur metrik, validasi MVP.", imageUrl: "/unit/manajemen-produk.webp", lessons: [
        { id: "menemukan-masalah", title: "Menemukan Masalah", screens: [] },
        { id: "prioritas-fitur", title: "Prioritas Fitur", screens: [] },
        { id: "metrik-produk", title: "Metrik Produk", screens: [] },
        { id: "mvp-validasi", title: "MVP Validasi", screens: [] },
      ] },
      { id: "kewirausahaan", title: "Kewirausahaan", description: "Unit ekonomi, titik impas, harga, dan validasi ide.", imageUrl: "/unit/kewirausahaan.webp", lessons: [
        { id: "unit-ekonomi", title: "Unit Ekonomi", screens: [] },
        { id: "titik-impas", title: "Titik Impas", screens: [] },
        { id: "menentukan-harga", title: "Menentukan Harga", screens: [] },
        { id: "validasi-ide", title: "Validasi Ide", screens: [] },
      ] },
    ],
  }),
  useNavigate: () => vi.fn(),
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
    expect(
      screen.getByText("Menabung, anggaran, cicilan, dan nilai waktu uang."),
    ).toBeInTheDocument();
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
