import { describe, expect, it, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ScreenEditor } from "#/features/admin/pages/ScreenEditor.tsx";
import type { AdminScreen } from "#/libs/admin-content-fns.ts";

const mockScreens: AdminScreen[] = [];
const reorderMock = vi.fn(async (input: { data: { ids: string[] } }) => {
  console.log("REORDER MUTATION CALLED:", JSON.stringify(input.data.ids));
  return null;
});

vi.mock("#/libs/admin-content-fns.ts", () => ({
  adminGetScreens: async () => mockScreens.map((s) => ({ ...s })),
  adminCreateScreen: vi.fn(),
  adminUpdateScreen: vi.fn(),
  adminDeleteScreen: vi.fn(),
  adminReorderScreens: reorderMock,
  translateAdminError: (_e: unknown, f: string) => f,
}));
vi.mock("@tanstack/react-router", () => ({
  useNavigate: vi.fn(),
  useBlocker: () => ({ status: "idle", proceed: vi.fn(), reset: vi.fn() }),
}));
vi.mock("sonner", () => ({ Toaster: () => null, toast: { success: vi.fn(), error: vi.fn() } }));

function mk(id: string, prompt: string): AdminScreen {
  return { id, lessonId: "l-1", type: "concept", slug: id, prompt, explain: "E", options: null, correctId: null, numericUnit: null, acceptRangeMin: null, acceptRangeMax: null, categories: null, rule: null, sortOrder: 0, createdAt: "", updatedAt: "" };
}

describe("debug", () => {
  it("traces editor reorder", async () => {
    mockScreens.splice(0, mockScreens.length, mk("s-1", "Prompt satu"), mk("s-2", "Prompt dua"));
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const setSpy = vi.spyOn(client, "setQueryData");
    render(<QueryClientProvider client={client}><ScreenEditor lessonId="l-1" /></QueryClientProvider>);
    await screen.findByText("Daftar Screen (2)");
    const rows = screen.getAllByTestId("screen-row");
    console.log("rows found:", rows.length);
    rows[0].getBoundingClientRect = () => ({ top: 0, height: 60 }) as DOMRect;
    rows[1].getBoundingClientRect = () => ({ top: 60, height: 60 }) as DOMRect;
    const grips = screen.getAllByRole("button", { name: /seret/i });
    console.log("grips found:", grips.length);
    fireEvent.pointerDown(grips[0], { clientX: 10, clientY: 10, button: 0, pointerType: "mouse" });
    fireEvent.pointerMove(grips[0], { clientX: 10, clientY: 100, pointerType: "mouse" });
    console.log("setQueryData calls:", setSpy.mock.calls.length);
    const panel = screen.getByText(/Daftar Screen/).parentElement as HTMLElement;
    const prompts = within(panel).getAllByText(/.+/).map((el) => el.textContent ?? "").filter((t) => t.startsWith("Prompt"));
    console.log("prompts:", JSON.stringify(prompts));
    expect(true).toBe(true);
  });
});
