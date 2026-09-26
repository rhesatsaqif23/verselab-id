// Tests for the ScreenEditor unsaved-changes guard: switching screens with
// unsaved input must ask Simpan & pindah / Buang / Batal before navigating.
import { describe, expect, it, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ScreenEditor } from "#/features/admin/pages/ScreenEditor.tsx";

const {
  navigateMock,
  updateMock,
  createMock,
  mockScreens,
  resetScreens,
  blockerStore,
  capturedBlocker,
} = vi.hoisted(() => {
  const mk = (id: string, prompt: string) => ({
    id,
    lessonId: "l-1",
    type: "concept",
    slug: id,
    prompt,
    explain: prompt ? "Explain" : "",
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
  // Server-shaped state: a create must stick, so the invalidation refetch
  // after onSuccess sees the new row instead of reverting the list.
  const seed = () => [mk("s-1", "Prompt satu"), mk("s-2", "Prompt dua")];
  const mockScreens = seed();
  const createMock = vi.fn(
    async (input: { data: { id?: string; prompt?: string; type?: string; lessonId?: string } }) => {
      const id = input.data.id ?? `s-new-${mockScreens.length}`;
      const row = {
        ...mk(id, input.data.prompt ?? ""),
        type: input.data.type ?? "concept",
        lessonId: input.data.lessonId ?? "l-1",
      };
      mockScreens.push(row);
      return row;
    },
  );
  return {
    navigateMock: vi.fn(),
    updateMock: vi.fn(),
    createMock,
    mockScreens,
    resetScreens: () => mockScreens.splice(0, mockScreens.length, ...seed()),
    blockerStore: { status: "idle" as string, proceed: vi.fn(), reset: vi.fn() },
    capturedBlocker: {} as { shouldBlockFn?: () => boolean },
  };
});

// Like the real blocker, reset() returns the status to idle so the guarded
// component re-renders and closes its dialog.
blockerStore.reset.mockImplementation(() => {
  blockerStore.status = "idle";
});

vi.mock("#/libs/admin-content-fns.ts", () => ({
  adminGetScreens: vi.fn(async () => mockScreens.map((r) => ({ ...r }))),
  adminCreateScreen: createMock,
  adminDeleteScreen: vi.fn(),
  adminReorderScreens: vi.fn(),
  adminUpdateScreen: updateMock,
  translateAdminError: (_err: unknown, fallback: string) => fallback,
}));

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigateMock,
  useBlocker: (opts: { shouldBlockFn: () => boolean }) => {
    capturedBlocker.shouldBlockFn = opts.shouldBlockFn;
    return {
      status: blockerStore.status,
      proceed: blockerStore.proceed,
      reset: blockerStore.reset,
    };
  },
}));

updateMock.mockImplementation(async ({ data }: { data: { id: string } }) => ({
  ...mockScreens.find((s) => s.id === data.id)!,
}));

function renderEditor() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const element = () => (
    <QueryClientProvider client={client}>
      <ScreenEditor lessonId="l-1" />
    </QueryClientProvider>
  );
  const view = render(element());
  return { ...view, rerenderEditor: () => view.rerender(element()) };
}

beforeEach(() => {
  updateMock.mockClear();
  createMock.mockClear();
  resetScreens();
  blockerStore.proceed.mockClear();
  blockerStore.reset.mockClear();
  blockerStore.status = "idle";
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

  it("offers only Simpan and Buang in the guard dialog", async () => {
    renderEditor();
    fireEvent.change(await screen.findByDisplayValue("Prompt satu"), {
      target: { value: "Prompt satu edited" },
    });
    fireEvent.click(screen.getByText("Prompt dua"));

    await screen.findByText("Simpan perubahan?");
    expect(screen.getByRole("button", { name: /simpan & pindah/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^buang$/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^batal$/i })).toBeNull();
  });

  it("reports dirty state to the route blocker", async () => {
    renderEditor();
    expect(capturedBlocker.shouldBlockFn?.()).toBe(false);

    fireEvent.change(await screen.findByDisplayValue("Prompt satu"), {
      target: { value: "Prompt satu edited" },
    });

    expect(capturedBlocker.shouldBlockFn?.()).toBe(true);
  });

  it("shows the guard on blocked route navigation and proceeds after save", async () => {
    const { rerenderEditor } = renderEditor();
    fireEvent.change(await screen.findByDisplayValue("Prompt satu"), {
      target: { value: "Prompt satu edited" },
    });

    blockerStore.status = "blocked";
    rerenderEditor();

    await screen.findByText("Simpan perubahan?");
    fireEvent.click(screen.getByRole("button", { name: /simpan & pindah/i }));

    await waitFor(() => expect(updateMock).toHaveBeenCalledTimes(1));
    expect(blockerStore.proceed).toHaveBeenCalledTimes(1);
  });

  it("stops blocking after the edited screen is saved", async () => {
    renderEditor();
    fireEvent.change(await screen.findByDisplayValue("Prompt satu"), {
      target: { value: "Prompt satu edited" },
    });
    expect(capturedBlocker.shouldBlockFn?.()).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: /^simpan$/i }));
    await waitFor(() => expect(updateMock).toHaveBeenCalledTimes(1));

    expect(capturedBlocker.shouldBlockFn?.()).toBe(false);
  });

  it("proceeds without saving on Buang for blocked routes", async () => {
    const { rerenderEditor } = renderEditor();
    fireEvent.change(await screen.findByDisplayValue("Prompt satu"), {
      target: { value: "Prompt satu edited" },
    });

    blockerStore.status = "blocked";
    rerenderEditor();
    await screen.findByText("Simpan perubahan?");

    fireEvent.click(screen.getByRole("button", { name: /^buang$/i }));

    expect(updateMock).not.toHaveBeenCalled();
    expect(blockerStore.proceed).toHaveBeenCalledTimes(1);
  });

  it("closes the dialog when Simpan fails validation so the field can be filled", async () => {
    renderEditor();
    fireEvent.change(await screen.findByDisplayValue("Prompt satu"), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByText("Prompt dua"));
    await screen.findByText("Simpan perubahan?");

    fireEvent.click(screen.getByRole("button", { name: /simpan & pindah/i }));

    // Nothing saved, dialog closed, and the form is editable again so the
    // user can fill the required field. The guard reopens on next navigation.
    await waitFor(() => expect(screen.queryByText("Simpan perubahan?")).toBeNull());
    expect(updateMock).not.toHaveBeenCalled();
    expect(screen.getByDisplayValue("")).toBeInTheDocument();
    expect(capturedBlocker.shouldBlockFn?.()).toBe(true);
  });

  it("offers a close X in the dialog corner", async () => {
    renderEditor();
    fireEvent.change(await screen.findByDisplayValue("Prompt satu"), {
      target: { value: "Prompt satu edited" },
    });
    fireEvent.click(screen.getByText("Prompt dua"));

    await screen.findByText("Simpan perubahan?");
    const close = screen.getByRole("button", { name: /close/i });
    expect(close.className).toContain("right-6");
    expect(close.className).toContain("top-6");
  });

  it("cancels the switch without saving on X", async () => {
    renderEditor();
    const prompt = await screen.findByDisplayValue("Prompt satu");
    fireEvent.change(prompt, { target: { value: "Prompt satu edited" } });
    fireEvent.click(screen.getByText("Prompt dua"));
    await screen.findByText("Simpan perubahan?");

    fireEvent.click(screen.getByRole("button", { name: /close/i }));

    // Dialog closed, still on screen one with the edits intact.
    expect(screen.queryByText("Simpan perubahan?")).toBeNull();
    expect(updateMock).not.toHaveBeenCalled();
    expect(screen.getByDisplayValue("Prompt satu edited")).toBeInTheDocument();
    expect(blockerStore.reset).not.toHaveBeenCalled();
  });

  it("resets the route blocker on X", async () => {
    const { rerenderEditor } = renderEditor();
    fireEvent.change(await screen.findByDisplayValue("Prompt satu"), {
      target: { value: "Prompt satu edited" },
    });

    blockerStore.status = "blocked";
    rerenderEditor();
    await screen.findByText("Simpan perubahan?");

    fireEvent.click(screen.getByRole("button", { name: /close/i }));

    expect(blockerStore.reset).toHaveBeenCalledTimes(1);
    expect(blockerStore.proceed).not.toHaveBeenCalled();

    // The real blocker re-renders the route after reset(); the mock needs one.
    rerenderEditor();
    expect(blockerStore.status).toBe("idle");
    expect(screen.queryByText("Simpan perubahan?")).toBeNull();
  });

  it("queues screen creation behind the guard when the form is dirty", async () => {
    renderEditor();
    fireEvent.change(await screen.findByDisplayValue("Prompt satu"), {
      target: { value: "Prompt satu edited" },
    });

    fireEvent.click(screen.getByRole("button", { name: /tambah screen/i }));
    await screen.findByText("Tambah Screen Baru");
    fireEvent.click(screen.getByRole("button", { name: /buat screen/i }));

    // Nothing created yet: the unsaved edits resolve first, so the edit is
    // never silently discarded by switching selection to the new draft.
    await screen.findByText("Simpan perubahan?");
    expect(createMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /simpan & pindah/i }));
    await waitFor(() => expect(updateMock).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(createMock).toHaveBeenCalledTimes(1));
    await screen.findByText("Daftar Screen (3)");
  });

  it("creates the screen and discards edits when Buang is chosen", async () => {
    renderEditor();
    fireEvent.change(await screen.findByDisplayValue("Prompt satu"), {
      target: { value: "Prompt satu edited" },
    });

    fireEvent.click(screen.getByRole("button", { name: /tambah screen/i }));
    await screen.findByText("Tambah Screen Baru");
    fireEvent.click(screen.getByRole("button", { name: /buat screen/i }));
    await screen.findByText("Simpan perubahan?");

    fireEvent.click(screen.getByRole("button", { name: /^buang$/i }));

    expect(updateMock).not.toHaveBeenCalled();
    await waitFor(() => expect(createMock).toHaveBeenCalledTimes(1));
    await screen.findByText("Daftar Screen (3)");
  });
});
