// Reproduction: a freshly added screen must survive create + refetch + settle.
// It is a blank draft the user simply has not filled in yet — the system must
// not classify it as trash while it stays selected. Runs under StrictMode to
// match production (apps/web/src/client.tsx) and uses delayed fake-network
// reads so invalidate/refetch interleavings are realistic.
import { StrictMode } from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ScreenEditor } from "#/features/admin/pages/ScreenEditor.tsx";

type Row = {
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
  const mk = (id: string, prompt: string, sortOrder: number): Row => ({
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
    sortOrder,
    createdAt: "2026-09-24T00:00:00.000Z",
    updatedAt: "2026-09-24T00:00:00.000Z",
  });
  const store = {
    rows: [mk("s-1", "Prompt satu", 0), mk("s-blank", "", 1), mk("s-2", "Prompt dua", 2)] as Row[],
    reset() {
      store.rows = [mk("s-1", "Prompt satu", 0), mk("s-blank", "", 1), mk("s-2", "Prompt dua", 2)];
    },
  };
  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const api = {
    // Realistic network reads: always respond late and with fresh objects.
    getScreens: vi.fn(async () => {
      await delay(10);
      return store.rows.map((r) => ({ ...r }));
    }),
    createScreen: vi.fn(async ({ data }: { data: { id?: string; lessonId: string } }) => {
      await delay(5);
      const row: Row = {
        id: data.id ?? "s-new",
        lessonId: data.lessonId,
        type: "concept",
        slug: data.id ?? "s-new",
        prompt: "",
        explain: "",
        options: null,
        correctId: null,
        numericUnit: null,
        acceptRangeMin: null,
        acceptRangeMax: null,
        categories: null,
        rule: null,
        sortOrder: store.rows.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.rows = [...store.rows, row];
      return row;
    }),
    updateScreen: vi.fn(async ({ data }: { data: { id: string } }) => {
      const row = store.rows.find((s) => s.id === data.id);
      return row ? { ...row, ...data } : row;
    }),
    deleteScreen: vi.fn(async ({ data }: { data: { id: string } }) => {
      await delay(5);
      store.rows = store.rows.filter((s) => s.id !== data.id);
      return null;
    }),
    reorderScreens: vi.fn(async () => null),
  };
  return { store, api, capturedBlocker: {} as { shouldBlockFn?: () => boolean } };
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
    <StrictMode>
      <QueryClientProvider client={client}>
        <ScreenEditor lessonId="l-1" />
      </QueryClientProvider>
    </StrictMode>,
  );
}

async function createDraftViaDialog() {
  fireEvent.click(screen.getByRole("button", { name: /tambah screen/i }));
  await screen.findByText("Tambah Screen Baru");
  fireEvent.click(screen.getByRole("button", { name: /buat screen/i }));
  await waitFor(() => expect(api.createScreen).toHaveBeenCalledTimes(1));
  const call = api.createScreen.mock.calls[0]?.[0] as { data: { id: string } };
  return call.data.id;
}

const settle = (ms = 100) => new Promise((r) => setTimeout(r, ms));

function deletedIds(): string[] {
  return api.deleteScreen.mock.calls.map((c) => (c[0] as { data: { id: string } }).data.id);
}

beforeEach(() => {
  store.reset();
  vi.clearAllMocks();
});

describe("new screen survival", () => {
  it("keeps the newly added blank screen after create and refetch settle", async () => {
    renderEditor();
    await screen.findByDisplayValue("Prompt satu");
    await settle(); // let the pre-existing blank cleanup finish

    const draftId = await createDraftViaDialog();
    await settle();

    // The pre-existing blank may be cleaned up, never the new draft.
    expect(deletedIds()).not.toContain(draftId);
    expect(store.rows.some((r) => r.id === draftId)).toBe(true);
    await screen.findByText("Daftar Screen (3)");
  });

  it("does not refetch the list when blank cleanup deletes rows", async () => {
    renderEditor();
    await screen.findByDisplayValue("Prompt satu");
    await settle();

    // Blank cleanup removed s-blank WITHOUT invalidating: the delete is a
    // local cache removal, so no read happens and it can never race a
    // pending create by snapshotting the list without the new row.
    const readsAfterLoad = api.getScreens.mock.calls.length;
    expect(deletedIds()).toContain("s-blank");
    expect(api.getScreens.mock.calls.length).toBe(readsAfterLoad);

    const draftId = await createDraftViaDialog();
    await settle();

    expect(api.getScreens.mock.calls.length).toBe(readsAfterLoad + 1); // create's own refetch only
    expect(store.rows.some((r) => r.id === draftId)).toBe(true);
    await screen.findByText("Daftar Screen (3)");
  });

  it("follows the server id when the server assigns a different one", async () => {
    api.createScreen.mockImplementationOnce(async ({ data }) => {
      await settle(20);
      const serverId = `srv-${data.id}`;
      const row: Row = {
        id: serverId,
        lessonId: data.lessonId,
        type: "concept",
        slug: serverId,
        prompt: "",
        explain: "",
        options: null,
        correctId: null,
        numericUnit: null,
        acceptRangeMin: null,
        acceptRangeMax: null,
        categories: null,
        rule: null,
        sortOrder: store.rows.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.rows = [...store.rows, row];
      return row;
    });

    renderEditor();
    await screen.findByDisplayValue("Prompt satu");
    await settle();

    const draftId = await createDraftViaDialog();
    await settle(200);

    // Nothing was trashed; the UI follows the server id.
    expect(deletedIds()).not.toContain(draftId);
    expect(deletedIds()).not.toContain(`srv-${draftId}`);
    expect(store.rows.some((r) => r.id === `srv-${draftId}`)).toBe(true);
    await screen.findByText("Daftar Screen (3)");
  });

  it("deletes a draft the user abandoned while its create was in flight", async () => {
    api.createScreen.mockImplementationOnce(async ({ data }) => {
      await settle(60); // slow create — the user clicks away meanwhile
      const row: Row = {
        id: data.id ?? "s-new",
        lessonId: data.lessonId,
        type: "concept",
        slug: data.id ?? "s-new",
        prompt: "",
        explain: "",
        options: null,
        correctId: null,
        numericUnit: null,
        acceptRangeMin: null,
        acceptRangeMax: null,
        categories: null,
        rule: null,
        sortOrder: store.rows.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.rows = [...store.rows, row];
      return row;
    });

    renderEditor();
    await screen.findByDisplayValue("Prompt satu");
    await settle();

    const draftId = await createDraftViaDialog();
    // Abandon the blank draft immediately, while the create is still pending.
    fireEvent.click(screen.getByText("Prompt dua"));

    // No DELETE can go out before the row exists on the server.
    expect(deletedIds()).not.toContain(draftId);

    await settle(200);
    // Once created, the abandoned draft is removed — no ghost row.
    expect(deletedIds()).toContain(draftId);
    expect(store.rows.some((r) => r.id === draftId)).toBe(false);
    await screen.findByText("Daftar Screen (2)");
  });
});
