// Screen CRUD end-to-end in the ScreenEditor: create each of the four screen
// types through the type picker, edit every field group, validation toasts,
// reorder, and delete from both the list panel and the edit panel — with cache
// invalidation assertions. State-backed server-fn mock, no Postgres, no sockets.
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ScreenEditor } from "#/features/admin/pages/ScreenEditor.tsx";
import type { AdminScreen } from "#/libs/admin-content-fns.ts";

const { mockScreens, createMock, updateMock, deleteMock, reorderMock, toastMock, seedScreens } =
  vi.hoisted(() => {
    const mockScreens: AdminScreen[] = [];
    let nextId = 1;

    const createMock = vi.fn(
      async (input: {
        data: {
          id?: string;
          lessonId?: string;
          type?: AdminScreen["type"];
          prompt?: string;
          explain?: string;
          options?: { id: string; label: string }[];
          correctId?: string;
          numericUnit?: string;
          acceptRangeMin?: number;
          acceptRangeMax?: number;
          categories?: string[];
          rule?: AdminScreen["rule"];
        };
      }) => {
        const data = input.data;
        const id = data.id ?? `s-new-${nextId++}`;
        const row: AdminScreen = {
          id,
          lessonId: data.lessonId ?? "l-1",
          type: data.type ?? "concept",
          slug: id,
          prompt: data.prompt ?? "",
          explain: data.explain ?? "",
          options: data.options ?? null,
          correctId: data.correctId ?? null,
          numericUnit: data.numericUnit ?? null,
          acceptRangeMin: data.acceptRangeMin ?? null,
          acceptRangeMax: data.acceptRangeMax ?? null,
          categories: data.categories ?? null,
          rule: data.rule ?? null,
          sortOrder: mockScreens.length,
          createdAt: "2026-09-23T00:00:00.000Z",
          updatedAt: "2026-09-23T00:00:00.000Z",
        };
        mockScreens.push(row);
        return { ...row };
      },
    );

    const updateMock = vi.fn(async (input: { data: Partial<AdminScreen> & { id: string } }) => {
      const row = mockScreens.find((s) => s.id === input.data.id);
      if (!row) throw new Error("unknown screen");
      Object.assign(row, input.data, { updatedAt: "2026-09-23T01:00:00.000Z" });
      return { ...row };
    });

    const deleteMock = vi.fn(async (input: { data: { id: string } }) => {
      const index = mockScreens.findIndex((s) => s.id === input.data.id);
      if (index >= 0) mockScreens.splice(index, 1);
      return null;
    });

    const reorderMock = vi.fn(async (input: { data: { ids: string[] } }) => {
      const ordered = input.data.ids
        .map((id) => mockScreens.find((s) => s.id === id))
        .filter((s): s is AdminScreen => Boolean(s));
      mockScreens.splice(0, mockScreens.length, ...ordered);
      return null;
    });

    return {
      mockScreens,
      createMock,
      updateMock,
      deleteMock,
      reorderMock,
      toastMock: { success: vi.fn(), error: vi.fn() },
      seedScreens: (rows: AdminScreen[]) =>
        mockScreens.splice(0, mockScreens.length, ...rows.map((r) => ({ ...r }))),
    };
  });

vi.mock("#/libs/admin-content-fns.ts", () => ({
  adminGetScreens: async (input: { data: { lessonId: string } }) =>
    mockScreens.filter((s) => s.lessonId === input.data.lessonId).map((s) => ({ ...s })),
  adminCreateScreen: createMock,
  adminUpdateScreen: updateMock,
  adminDeleteScreen: deleteMock,
  adminReorderScreens: reorderMock,
  translateAdminError: (_err: unknown, fallback: string) => fallback,
}));

vi.mock("@tanstack/react-router", () => ({
  useNavigate: vi.fn(),
  useBlocker: () => ({ status: "idle", proceed: vi.fn(), reset: vi.fn() }),
}));

vi.mock("sonner", () => ({
  Toaster: () => null,
  toast: toastMock,
}));

function mkScreen(
  id: string,
  type: AdminScreen["type"],
  prompt: string,
  extra: Partial<AdminScreen> = {},
): AdminScreen {
  return {
    id,
    lessonId: "l-1",
    type,
    slug: id,
    prompt,
    explain: "Penjelasan",
    options: null,
    correctId: null,
    numericUnit: null,
    acceptRangeMin: null,
    acceptRangeMax: null,
    categories: null,
    rule: null,
    sortOrder: mockScreens.length,
    createdAt: "2026-09-23T00:00:00.000Z",
    updatedAt: "2026-09-23T00:00:00.000Z",
    ...extra,
  };
}

function renderEditor() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const invalidateSpy = vi.spyOn(client, "invalidateQueries");
  const view = render(
    <QueryClientProvider client={client}>
      <ScreenEditor lessonId="l-1" />
    </QueryClientProvider>,
  );
  return { ...view, invalidateSpy };
}

/** Open a Radix select by trigger id and choose an option by its visible name. */
async function pickSelectOption(triggerId: string, optionName: string) {
  const trigger = document.getElementById(triggerId);
  expect(trigger).not.toBeNull();
  fireEvent.pointerDown(trigger as Element, { pointerId: 1, pointerType: "mouse" });
  const option = await screen.findByRole("option", { name: optionName });
  fireEvent.click(option);
}

function listPanel(): HTMLElement {
  const heading = screen.getByText(/Daftar Screen \(\d+\)/);
  expect(heading.parentElement).not.toBeNull();
  return heading.parentElement as HTMLElement;
}

function listedPrompts(): string[] {
  return within(listPanel())
    .getAllByText(/.+/)
    .map((el) => el.textContent ?? "")
    .filter((text) => text.startsWith("Prompt"));
}

beforeAll(() => {
  // jsdom lacks the pointer-capture and scrolling APIs Radix Select relies on.
  const proto = window.HTMLElement.prototype as unknown as Record<string, unknown>;
  proto.scrollIntoView = () => undefined;
  proto.hasPointerCapture = () => false;
  proto.setPointerCapture = () => undefined;
  proto.releasePointerCapture = () => undefined;
});

beforeEach(() => {
  createMock.mockClear();
  updateMock.mockClear();
  deleteMock.mockClear();
  reorderMock.mockClear();
  toastMock.success.mockClear();
  toastMock.error.mockClear();
});

describe("ScreenEditor CRUD", () => {
  it("creates a concept screen, fills it in and saves", async () => {
    seedScreens([mkScreen("s-1", "concept", "Prompt satu")]);
    const { invalidateSpy } = renderEditor();
    await screen.findByText("Daftar Screen (1)");

    fireEvent.click(screen.getByRole("button", { name: /tambah screen/i }));
    await screen.findByText("Tambah Screen Baru");
    fireEvent.click(screen.getByRole("button", { name: "Buat Screen" }));

    await waitFor(() => expect(createMock).toHaveBeenCalledTimes(1));
    expect(createMock.mock.calls[0][0]).toMatchObject({
      data: { lessonId: "l-1", type: "concept", id: expect.any(String), prompt: "", explain: "" },
    });
    await screen.findByText("Daftar Screen (2)");

    fireEvent.change(await screen.findByPlaceholderText("Teks pertanyaan / prompt"), {
      target: { value: "  Konsep baru  " },
    });
    fireEvent.change(screen.getByPlaceholderText(/Teks penjelasan yang muncul/), {
      target: { value: "  Penjelasan baru  " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Simpan" }));

    await waitFor(() => expect(updateMock).toHaveBeenCalledTimes(1));
    expect(updateMock.mock.calls[0][0]).toMatchObject({
      data: {
        id: expect.any(String),
        prompt: "Konsep baru",
        explain: "Penjelasan baru",
        options: null,
        numericUnit: null,
        categories: null,
      },
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["admin-screens", "l-1"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["admin-all-screens"] });
    expect(toastMock.success).toHaveBeenCalledWith("Screen berhasil disimpan");
  });

  it("creates a choice screen through the type picker with default options", async () => {
    seedScreens([mkScreen("s-1", "concept", "Prompt satu")]);
    renderEditor();
    await screen.findByText("Daftar Screen (1)");

    fireEvent.click(screen.getByRole("button", { name: /tambah screen/i }));
    await screen.findByText("Tambah Screen Baru");
    await pickSelectOption("screen-type", "Pilihan Ganda");
    fireEvent.click(screen.getByRole("button", { name: "Buat Screen" }));

    await waitFor(() => expect(createMock).toHaveBeenCalledTimes(1));
    expect(createMock.mock.calls[0][0]).toMatchObject({
      data: {
        lessonId: "l-1",
        type: "choice",
        prompt: "",
        explain: "",
        options: [
          { id: "opt1", label: "" },
          { id: "opt2", label: "" },
        ],
        correctId: "opt1",
      },
    });
    await screen.findByText("Daftar Screen (2)");
    expect(toastMock.success).toHaveBeenCalledWith("Screen berhasil ditambahkan");
  });

  it("creates a numeric screen through the type picker with the default range", async () => {
    seedScreens([mkScreen("s-1", "concept", "Prompt satu")]);
    renderEditor();
    await screen.findByText("Daftar Screen (1)");

    fireEvent.click(screen.getByRole("button", { name: /tambah screen/i }));
    await screen.findByText("Tambah Screen Baru");
    await pickSelectOption("screen-type", "Angka");
    fireEvent.click(screen.getByRole("button", { name: "Buat Screen" }));

    await waitFor(() => expect(createMock).toHaveBeenCalledTimes(1));
    expect(createMock.mock.calls[0][0]).toMatchObject({
      data: {
        lessonId: "l-1",
        type: "numeric",
        prompt: "",
        numericUnit: "",
        acceptRangeMin: 0,
        acceptRangeMax: 100,
      },
    });
    await screen.findByText("Daftar Screen (2)");
  });

  it("creates an allocation screen through the type picker with the default rule", async () => {
    seedScreens([mkScreen("s-1", "concept", "Prompt satu")]);
    renderEditor();
    await screen.findByText("Daftar Screen (1)");

    fireEvent.click(screen.getByRole("button", { name: /tambah screen/i }));
    await screen.findByText("Tambah Screen Baru");
    await pickSelectOption("screen-type", "Alokasi");
    fireEvent.click(screen.getByRole("button", { name: "Buat Screen" }));

    await waitFor(() => expect(createMock).toHaveBeenCalledTimes(1));
    expect(createMock.mock.calls[0][0]).toMatchObject({
      data: {
        lessonId: "l-1",
        type: "allocation",
        prompt: "",
        categories: [""],
        rule: { type: "min", categoryId: "", min: 0 },
      },
    });
    await screen.findByText("Daftar Screen (2)");
  });

  it("saves prompt and explain edits with trimmed input", async () => {
    seedScreens([mkScreen("s-1", "concept", "Prompt satu")]);
    renderEditor();

    fireEvent.change(await screen.findByDisplayValue("Prompt satu"), {
      target: { value: "  Prompt terbaru  " },
    });
    fireEvent.change(screen.getByDisplayValue("Penjelasan"), {
      target: { value: "  Penjelasan terbaru  " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Simpan" }));

    await waitFor(() => expect(updateMock).toHaveBeenCalledTimes(1));
    expect(updateMock.mock.calls[0][0]).toMatchObject({
      data: { id: "s-1", prompt: "Prompt terbaru", explain: "Penjelasan terbaru" },
    });
    expect(toastMock.success).toHaveBeenCalledWith("Screen berhasil disimpan");
  });

  it("edits choice options and changes the correct answer", async () => {
    seedScreens([
      mkScreen("s-c", "choice", "Pilih jawaban", {
        options: [
          { id: "opt1", label: "A" },
          { id: "opt2", label: "B" },
        ],
        correctId: "opt1",
      }),
    ]);
    renderEditor();
    await screen.findByDisplayValue("Pilih jawaban");

    // Rename the first option.
    fireEvent.change(screen.getByPlaceholderText("Pilihan 1"), {
      target: { value: "Opsi Satu" },
    });
    // Add a third option.
    fireEvent.click(screen.getByRole("button", { name: /tambah pilihan/i }));
    await screen.findByPlaceholderText("Pilihan 3");
    // Move the correct answer to the second option.
    await pickSelectOption("correct-id", "B");
    fireEvent.click(screen.getByRole("button", { name: "Simpan" }));

    await waitFor(() => expect(updateMock).toHaveBeenCalledTimes(1));
    expect(updateMock.mock.calls[0][0]).toMatchObject({
      data: {
        id: "s-c",
        options: [
          { id: "opt1", label: "Opsi Satu" },
          { id: "opt2", label: "B" },
          { id: expect.stringMatching(/^opt_/), label: "Pilihan 3" },
        ],
        correctId: "opt2",
        numericUnit: null,
        categories: null,
      },
    });
  });

  it("edits numeric unit and accepted range", async () => {
    seedScreens([
      mkScreen("s-n", "numeric", "Hitung angka", {
        numericUnit: "Rp",
        acceptRangeMin: 0,
        acceptRangeMax: 100,
      }),
    ]);
    renderEditor();
    await screen.findByDisplayValue("Hitung angka");

    fireEvent.change(document.getElementById("unit-label") as HTMLInputElement, {
      target: { value: "%" },
    });
    fireEvent.change(document.getElementById("min-range") as HTMLInputElement, {
      target: { value: "10" },
    });
    fireEvent.change(document.getElementById("max-range") as HTMLInputElement, {
      target: { value: "50" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Simpan" }));

    await waitFor(() => expect(updateMock).toHaveBeenCalledTimes(1));
    expect(updateMock.mock.calls[0][0]).toMatchObject({
      data: {
        id: "s-n",
        numericUnit: "%",
        acceptRangeMin: 10,
        acceptRangeMax: 50,
        options: null,
        categories: null,
      },
    });
  });

  it("edits allocation categories and the rule bounds", async () => {
    seedScreens([
      mkScreen("s-a", "allocation", "Atur alokasi", {
        categories: ["Kebutuhan"],
        rule: { type: "min", categoryId: "Kebutuhan", min: 20 },
      }),
    ]);
    renderEditor();
    await screen.findByDisplayValue("Atur alokasi");

    fireEvent.click(screen.getByRole("button", { name: /tambah kategori/i }));
    fireEvent.change(document.getElementById("rule-min") as HTMLInputElement, {
      target: { value: "25" },
    });
    fireEvent.change(document.getElementById("rule-max") as HTMLInputElement, {
      target: { value: "40" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Simpan" }));

    await waitFor(() => expect(updateMock).toHaveBeenCalledTimes(1));
    expect(updateMock.mock.calls[0][0]).toMatchObject({
      data: {
        id: "s-a",
        categories: ["Kebutuhan", "Kategori 2"],
        rule: { type: "min", categoryId: "Kebutuhan", min: 25, max: 40 },
        options: null,
        numericUnit: null,
      },
    });
  });

  it("blocks saving while required fields are missing and toasts each error", async () => {
    seedScreens([mkScreen("s-1", "concept", "Prompt satu")]);
    renderEditor();

    fireEvent.change(await screen.findByDisplayValue("Prompt satu"), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByDisplayValue("Penjelasan"), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "Simpan" }));

    expect(updateMock).not.toHaveBeenCalled();
    expect(toastMock.error).toHaveBeenCalledWith("Pertanyaan / Prompt wajib diisi");
    expect(toastMock.error).toHaveBeenCalledWith("Penjelasan wajib diisi");
  });

  it("reorders screens through the move buttons", async () => {
    seedScreens([
      mkScreen("s-1", "concept", "Prompt satu"),
      mkScreen("s-2", "concept", "Prompt dua"),
    ]);
    renderEditor();
    await screen.findByText("Daftar Screen (2)");

    fireEvent.click(screen.getAllByRole("button", { name: "Pindah ke bawah" })[0]);

    await waitFor(() =>
      expect(reorderMock).toHaveBeenCalledWith({ data: { ids: ["s-2", "s-1"] } }),
    );
    await waitFor(() => expect(listedPrompts()[0]).toBe("Prompt dua"));
  });

  it("deletes a screen from the list panel after confirmation", async () => {
    seedScreens([
      mkScreen("s-1", "concept", "Prompt satu"),
      mkScreen("s-2", "concept", "Prompt dua"),
    ]);
    const { invalidateSpy } = renderEditor();
    await screen.findByText("Daftar Screen (2)");

    // First "Hapus screen" belongs to the list panel, second to the edit panel.
    fireEvent.click(screen.getAllByRole("button", { name: "Hapus screen" })[0]);
    const dialog = await screen.findByRole("alertdialog");
    expect(within(dialog).getByText(/"Prompt satu"/)).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: "Hapus" }));

    await waitFor(() => expect(deleteMock).toHaveBeenCalledWith({ data: { id: "s-1" } }));
    await screen.findByText("Daftar Screen (1)");
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["admin-all-screens"] });
    expect(toastMock.success).toHaveBeenCalledWith("Screen berhasil dihapus");
  });

  it("deletes the active screen from the edit panel after confirmation", async () => {
    seedScreens([
      mkScreen("s-1", "concept", "Prompt satu"),
      mkScreen("s-2", "concept", "Prompt dua"),
    ]);
    renderEditor();
    await screen.findByDisplayValue("Prompt satu");

    // List rows come first in the DOM; the edit panel's button is the last one.
    const deleteButtons = screen.getAllByRole("button", { name: "Hapus screen" });
    fireEvent.click(deleteButtons[deleteButtons.length - 1]);
    const dialog = await screen.findByRole("alertdialog");
    expect(dialog.textContent).toContain("Perubahan yang belum disimpan ikut hilang");

    fireEvent.click(within(dialog).getByRole("button", { name: "Hapus" }));

    await waitFor(() => expect(deleteMock).toHaveBeenCalledWith({ data: { id: "s-1" } }));
    await screen.findByText("Daftar Screen (1)");
    // Selection falls back to the remaining screen.
    await screen.findByDisplayValue("Prompt dua");
  });
});
