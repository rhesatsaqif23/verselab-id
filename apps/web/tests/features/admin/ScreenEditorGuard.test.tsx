// Tests for the ScreenEditor unsaved-changes guard: switching screens with
// unsaved input must ask Simpan & pindah / Buang / Batal before navigating.
import { describe, expect, it, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ScreenEditor } from "#/features/admin/pages/ScreenEditor.tsx";

const { navigateMock, updateMock, mockScreens } = vi.hoisted(() => {
  const mk = (id: string, prompt: string) => ({
    id,
    lessonId: "l-1",
    type: "concept",
    slug: id,
    prompt,
    explain: "Explain",
    options: null,
    correctId: null,
    numericUnit: null,
    acceptRangeMin: null,
    acceptRangeMax: null,
    categories: null,
    rule: null,
    sortOrder: 0,
    createdAt: "2026-09-24T00:00:00.000Z",
    updatedAt: "2026-09-24T00:00:00.000Z",
  });
  return {
    navigateMock: vi.fn(),
    updateMock: vi.fn(),
    mockScreens: [mk("s-1", "Prompt satu"), mk("s-2", "Prompt dua")],
  };
});

vi.mock("#/libs/admin-content-fns.ts", () => ({
  adminGetScreens: vi.fn().mockResolvedValue(mockScreens),
  adminCreateScreen: vi.fn(),
  adminDeleteScreen: vi.fn(),
  adminReorderScreens: vi.fn(),
  adminUpdateScreen: updateMock,
  translateAdminError: (_err: unknown, fallback: string) => fallback,
}));

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigateMock,
}));

updateMock.mockImplementation(async ({ data }: { data: { id: string } }) => ({
  ...mockScreens.find((s) => s.id === data.id)!,
}));

function renderEditor() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <ScreenEditor lessonId="l-1" />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  updateMock.mockClear();
});

describe("ScreenEditor unsaved guard", () => {
  it("switches freely when nothing was edited", async () => {
    renderEditor();
    await screen.findByDisplayValue("Prompt satu");

    fireEvent.click(screen.getByText("Prompt dua"));

    expect(screen.queryByText("Simpan perubahan?")).toBeNull();
    await screen.findByDisplayValue("Prompt dua");
  });

  it("asks before switching with unsaved input, saves and switches on confirm", async () => {
    renderEditor();
    const prompt = await screen.findByDisplayValue("Prompt satu");

    fireEvent.change(prompt, { target: { value: "Prompt satu edited" } });
    fireEvent.click(screen.getByText("Prompt dua"));

    // Guard dialog appears BEFORE navigation: still editing screen one.
    await screen.findByText("Simpan perubahan?");
    expect(screen.getByDisplayValue("Prompt satu edited")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /simpan & pindah/i }));

    await waitFor(() => expect(updateMock).toHaveBeenCalledTimes(1));
    await screen.findByDisplayValue("Prompt dua");
  });

  it("discards changes without saving on Buang", async () => {
    renderEditor();
    const prompt = await screen.findByDisplayValue("Prompt satu");

    fireEvent.change(prompt, { target: { value: "Prompt satu edited" } });
    fireEvent.click(screen.getByText("Prompt dua"));
    await screen.findByText("Simpan perubahan?");

    fireEvent.click(screen.getByRole("button", { name: /^buang$/i }));

    expect(updateMock).not.toHaveBeenCalled();
    await screen.findByDisplayValue("Prompt dua");
  });
});
