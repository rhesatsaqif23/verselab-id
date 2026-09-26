// Tests for blank screen drafts: pre-existing empty rows are removed, a new
// blank draft is selected for filling, and abandoning it deletes it silently.
import { describe, expect, it, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ScreenEditor } from "#/features/admin/pages/ScreenEditor.tsx";
import {
  isScreenEmpty,
  snapshotScreenForm,
  validateScreenFields,
} from "#/features/admin/components/ScreenForm.tsx";

type DraftRow = {
  id: string;
  lessonId: string;
  type: "concept";
  slug: string;
  prompt: string;
  explain: string;
  options: null;
  correctId: null;
  numericUnit: null;
  acceptRangeMin: null;
  acceptRangeMax: null;
  categories: null;
  rule: null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

const { store, api, capturedBlocker } = vi.hoisted(() => {
  const valid: DraftRow = {
    id: "s-1",
    lessonId: "l-1",
    type: "concept",
    slug: "s-1",
    prompt: "Prompt satu",
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
  };
  const blank: DraftRow = { ...valid, id: "s-blank", slug: "s-blank", prompt: "", explain: "" };
  const store = {
    rows: [valid, blank] as DraftRow[],
    reset() {
      store.rows = [{ ...valid }, { ...blank }];
    },
  };
  const api = {
    getScreens: vi.fn(async () => store.rows),
    createScreen: vi.fn(
      async ({
        data,
      }: {
        data: { id?: string; lessonId: string; prompt: string; explain: string };
      }) => {
        const row: DraftRow = {
          ...valid,
          id: data.id ?? "s-new",
          slug: data.id ?? "s-new",
          lessonId: data.lessonId,
          prompt: data.prompt,
          explain: data.explain,
          sortOrder: store.rows.length,
        };
        store.rows = [...store.rows, row];
        return row;
      },
    ),
    updateScreen: vi.fn(async ({ data }: { data: { id: string } }) => {
      const row = store.rows.find((s) => s.id === data.id);
      return row ? { ...row, ...data } : null;
    }),
    deleteScreen: vi.fn(async ({ data }: { data: { id: string } }) => {
      store.rows = store.rows.filter((s) => s.id !== data.id);
      return null;
    }),
    reorderScreens: vi.fn(async () => null),
  };
  return {
    store,
    api,
    capturedBlocker: {} as { shouldBlockFn?: () => boolean },
  };
});

vi.mock("#/libs/admin-content-fns.ts", () => ({
  adminGetScreens: api.getScreens,
  adminCreateScreen: api.createScreen,
  adminDeleteScreen: api.deleteScreen,
  adminReorderScreens: api.reorderScreens,
  adminUpdateScreen: api.updateScreen,
  translateAdminError: (_err: unknown, fallback: string) => fallback,
}));

vi.mock("@tanstack/react-router", () => ({
  useBlocker: (opts: { shouldBlockFn: () => boolean }) => {
    capturedBlocker.shouldBlockFn = opts.shouldBlockFn;
    return { status: "idle", proceed: vi.fn(), reset: vi.fn() };
  },
}));

function renderEditor() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <ScreenEditor lessonId="l-1" />
    </QueryClientProvider>,
  );
}

async function createBlankDraft() {
  fireEvent.click(screen.getByRole("button", { name: /tambah screen/i }));
  await screen.findByText("Tambah Screen Baru");
  fireEvent.click(screen.getByRole("button", { name: /buat screen/i }));
  await waitFor(() => expect(api.createScreen).toHaveBeenCalledTimes(1));
  const call = api.createScreen.mock.calls[0]?.[0] as { data: { id: string } };
  return call.data.id;
}

beforeEach(() => {
  store.reset();
  vi.clearAllMocks();
});

describe("ScreenEditor blank drafts", () => {
  it("classifies blank and complete concept screens", () => {
    const blank = store.rows.find((s) => s.id === "s-blank");
    const valid = store.rows.find((s) => s.id === "s-1");
    expect(blank).toBeDefined();
    expect(valid).toBeDefined();
    if (!blank || !valid) return;

    expect(isScreenEmpty(blank)).toBe(true);
    expect(validateScreenFields(blank).length).toBeGreaterThan(0);
    expect(isScreenEmpty(valid)).toBe(false);
    expect(validateScreenFields(valid)).toHaveLength(0);
  });

  it("treats database key order the same as form key order", () => {
    const blank = store.rows.find((s) => s.id === "s-blank");
    expect(blank).toBeDefined();
    if (!blank) return;

    // Form builds rule as { type, categoryId, min }; Postgres jsonb reads it
    // back reordered by key length. Same values must compare equal.
    const formSide = {
      ...blank,
      type: "allocation" as const,
      prompt: "Alokasi?",
      explain: "Atur.",
      categories: ["A", "B"],
      rule: { type: "min", categoryId: "A", min: 20 },
    };
    const serverSide = {
      ...formSide,
      rule: JSON.parse('{"min":20,"type":"min","categoryId":"A"}'),
    };
    expect(validateScreenFields(formSide)).toHaveLength(0);
    expect(snapshotScreenForm(formSide)).toBe(snapshotScreenForm(serverSide));
  });

  it("deletes a pre-existing blank screen automatically", async () => {
    renderEditor();
    await screen.findByDisplayValue("Prompt satu");

    await waitFor(() => expect(api.deleteScreen).toHaveBeenCalledWith({ data: { id: "s-blank" } }));
    expect(store.rows.some((s) => s.id === "s-blank")).toBe(false);
  });

  it("keeps the open blank draft until the user leaves it", async () => {
    const blank = store.rows.find((s) => s.id === "s-blank");
    const valid = store.rows.find((s) => s.id === "s-1");
    expect(blank).toBeDefined();
    expect(valid).toBeDefined();
    if (!blank || !valid) return;
    store.rows = [blank, valid];

    renderEditor();
    // The blank draft is selected on open and must not vanish on sight.
    await screen.findByText("Daftar Screen (2)");
    expect(api.deleteScreen).not.toHaveBeenCalled();

    // Leaving it pristine for another screen trashes it without any dialog.
    fireEvent.click(screen.getByText("Prompt satu"));

    await waitFor(() => expect(api.deleteScreen).toHaveBeenCalledWith({ data: { id: "s-blank" } }));
    expect(screen.queryByText("Simpan perubahan?")).toBeNull();
    await screen.findByDisplayValue("Prompt satu");
  });

  it("leaves a pristine blank draft without showing the guard, then deletes it", async () => {
    renderEditor();
    await screen.findByDisplayValue("Prompt satu");
    const draftId = await createBlankDraft();

    // The blank draft is selected and editable immediately, before any refetch.
    expect(screen.getAllByDisplayValue("")).toHaveLength(2);

    // No unsaved difference yet, so navigation must not ask Simpan/Buang.
    expect(capturedBlocker.shouldBlockFn?.()).toBe(false);

    fireEvent.click(screen.getByText("Prompt satu"));

    await waitFor(() => expect(api.deleteScreen).toHaveBeenCalledWith({ data: { id: draftId } }));
    expect(screen.queryByText("Simpan perubahan?")).toBeNull();
    await screen.findByDisplayValue("Prompt satu");
  });

  it("deletes a half-filled new draft when Buang is chosen", async () => {
    renderEditor();
    await screen.findByDisplayValue("Prompt satu");
    const draftId = await createBlankDraft();

    const prompts = screen.getAllByDisplayValue("");
    fireEvent.change(prompts[0], { target: { value: "Draft setengah" } });
    fireEvent.click(screen.getByText("Prompt satu"));
    await screen.findByText("Simpan perubahan?");

    fireEvent.click(screen.getByRole("button", { name: /^buang$/i }));

    await waitFor(() => expect(api.deleteScreen).toHaveBeenCalledWith({ data: { id: draftId } }));
    expect(api.updateScreen).not.toHaveBeenCalled();
    await screen.findByDisplayValue("Prompt satu");
  });
});
