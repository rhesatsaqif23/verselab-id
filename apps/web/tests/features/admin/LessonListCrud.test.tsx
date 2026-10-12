// Lesson CRUD end-to-end for one unit: list → create (trimmed) → validation →
// edit → prerequisite chips (including cycle hiding) → delete confirm/cancel →
// filter → row navigation → cache invalidation. Drives the real LessonList
// page against a state-backed server-fn mock — no Postgres, no sockets.
import { beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LessonList } from "#/features/admin/pages/LessonList.tsx";
import type { AdminLesson } from "#/libs/admin-content-fns.ts";

const { mockLessons, createMock, updateMock, deleteMock, navigateMock, toastMock, slugify } =
  vi.hoisted(() => {
    const slugify = (title: string) =>
      title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const mockLessons: AdminLesson[] = [];
    let nextId = 1;

    const createMock = vi.fn(
      async (input: {
        data: {
          unitId: string;
          title: string;
          description?: string;
          prerequisiteIds?: string[];
        };
      }) => {
        const row: AdminLesson = {
          id: `l-new-${nextId++}`,
          unitId: input.data.unitId,
          title: input.data.title,
          slug: slugify(input.data.title),
          description: input.data.description ?? null,
          icon: null,
          imageUrl: null,
          prerequisiteIds: input.data.prerequisiteIds ?? null,
          sortOrder: mockLessons.filter((l) => l.unitId === input.data.unitId).length,
          createdAt: "2026-09-22T00:00:00.000Z",
          updatedAt: "2026-09-22T00:00:00.000Z",
        };
        mockLessons.push(row);
        return row;
      },
    );

    const updateMock = vi.fn(
      async (input: {
        data: {
          id: string;
          title?: string;
          description?: string | null;
          imageUrl?: string | null;
          prerequisiteIds?: string[] | null;
        };
      }) => {
        const row = mockLessons.find((l) => l.id === input.data.id);
        if (!row) throw new Error("unknown lesson");
        if (input.data.title !== undefined) {
          row.title = input.data.title;
          row.slug = slugify(input.data.title);
        }
        if (input.data.description !== undefined) row.description = input.data.description;
        if (input.data.prerequisiteIds !== undefined) {
          row.prerequisiteIds = input.data.prerequisiteIds;
        }
        if (input.data.imageUrl !== undefined) row.imageUrl = input.data.imageUrl;
        return { ...row };
      },
    );

    const deleteMock = vi.fn(async (input: { data: { id: string } }) => {
      const index = mockLessons.findIndex((l) => l.id === input.data.id);
      if (index >= 0) mockLessons.splice(index, 1);
      return null;
    });

    return {
      mockLessons,
      createMock,
      updateMock,
      deleteMock,
      navigateMock: vi.fn(),
      toastMock: { success: vi.fn(), error: vi.fn() },
      slugify,
    };
  });

vi.mock("#/libs/admin-content-fns.ts", () => ({
  adminGetLessons: async (input: { data: { unitId: string } }) =>
    mockLessons.filter((l) => l.unitId === input.data.unitId).map((l) => ({ ...l })),
  adminGetAllLessons: async () => mockLessons.map((l) => ({ ...l })),
  adminCreateLesson: createMock,
  adminUpdateLesson: updateMock,
  adminDeleteLesson: deleteMock,
  adminUploadLessonImage: vi.fn(),
  translateAdminError: (_err: unknown, fallback: string) => fallback,
}));

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigateMock,
}));

vi.mock("sonner", () => ({
  Toaster: () => null,
  toast: toastMock,
}));

function mkLesson(
  id: string,
  title: string,
  unitId = "u-1",
  extra: Partial<AdminLesson> = {},
): AdminLesson {
  return {
    id,
    unitId,
    title,
    slug: slugify(title),
    description: null,
    icon: null,
    imageUrl: null,
    prerequisiteIds: null,
    sortOrder: mockLessons.filter((l) => l.unitId === unitId).length,
    createdAt: "2026-09-22T00:00:00.000Z",
    updatedAt: "2026-09-22T00:00:00.000Z",
    ...extra,
  };
}

function seedLessons(rows: AdminLesson[]) {
  mockLessons.splice(0, mockLessons.length, ...rows.map((r) => ({ ...r })));
}

function renderLessons() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const invalidateSpy = vi.spyOn(client, "invalidateQueries");
  const view = render(
    <QueryClientProvider client={client}>
      <LessonList unitId="u-1" unitSlug="keuangan" />
    </QueryClientProvider>,
  );
  return { ...view, invalidateSpy };
}

async function rowOf(title: string): Promise<HTMLElement> {
  const cell = await screen.findByText(title);
  const row = cell.closest("tr");
  expect(row).not.toBeNull();
  return row as HTMLElement;
}

beforeEach(() => {
  createMock.mockClear();
  updateMock.mockClear();
  deleteMock.mockClear();
  navigateMock.mockClear();
  toastMock.success.mockClear();
  toastMock.error.mockClear();
});

describe("LessonList CRUD", () => {
  it("lists only the lessons of the given unit", async () => {
    seedLessons([
      mkLesson("l-1", "Pengantar"),
      mkLesson("l-2", "Menabung"),
      mkLesson("l-9", "Unit lain", "u-9"),
    ]);
    renderLessons();

    await screen.findByText("Pengantar");
    expect(screen.getByText("Menabung")).toBeInTheDocument();
    expect(screen.queryByText("Unit lain")).toBeNull();
  });

  it("creates a lesson with trimmed title and description", async () => {
    seedLessons([]);
    const { invalidateSpy } = renderLessons();

    fireEvent.click(screen.getByRole("button", { name: "Tambah Lesson" }));
    const title = await screen.findByLabelText(/judul lesson/i);
    fireEvent.change(title, { target: { value: "  Mulai Menabung  " } });
    fireEvent.change(screen.getByLabelText(/deskripsi/i), {
      target: { value: "  Konsep dasar  " },
    });

    fireEvent.submit(document.getElementById("lesson-form") as HTMLFormElement);

    await waitFor(() => expect(createMock).toHaveBeenCalledTimes(1));
    expect(createMock.mock.calls[0][0]).toEqual({
      data: { unitId: "u-1", title: "Mulai Menabung", description: "Konsep dasar" },
    });
    await screen.findByText("Mulai Menabung");
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["admin-lessons", "u-1"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["admin-all-lessons"] });
    expect(toastMock.success).toHaveBeenCalledWith("Lesson berhasil ditambahkan");
  });

  it("keeps the dialog open and skips the API call on an empty title", async () => {
    seedLessons([]);
    renderLessons();

    fireEvent.click(screen.getByRole("button", { name: "Tambah Lesson" }));
    await screen.findByLabelText(/judul lesson/i);
    fireEvent.submit(document.getElementById("lesson-form") as HTMLFormElement);

    expect(createMock).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(toastMock.error).toHaveBeenCalledWith("Judul Lesson wajib diisi");
  });

  it("edits a lesson with prefilled values and saves trimmed input", async () => {
    seedLessons([mkLesson("l-1", "Pengantar")]);
    renderLessons();

    fireEvent.click(within(await rowOf("Pengantar")).getByRole("button", { name: "Edit lesson" }));
    const title = await screen.findByLabelText(/judul lesson/i);
    expect(title).toHaveValue("Pengantar");

    fireEvent.change(title, { target: { value: "  Pengantar Baru  " } });
    fireEvent.change(screen.getByLabelText(/deskripsi/i), {
      target: { value: "  Deskripsi baru  " },
    });
    fireEvent.submit(document.getElementById("lesson-form") as HTMLFormElement);

    await waitFor(() => expect(updateMock).toHaveBeenCalledTimes(1));
    expect(updateMock.mock.calls[0][0]).toMatchObject({
      data: { id: "l-1", title: "Pengantar Baru", description: "Deskripsi baru" },
    });
    await screen.findByText("Pengantar Baru");
    expect(toastMock.success).toHaveBeenCalledWith("Lesson berhasil diperbarui");
  });

  it("stores a selected prerequisite through the chips", async () => {
    seedLessons([
      mkLesson("l-1", "Pengantar"),
      mkLesson("l-2", "Menabung"),
      mkLesson("l-3", "Investasi"),
    ]);
    renderLessons();

    fireEvent.click(within(await rowOf("Menabung")).getByRole("button", { name: "Edit lesson" }));
    await screen.findByLabelText(/judul lesson/i);

    // Chips list the other lessons of this unit.
    expect(screen.getByRole("button", { name: "Pengantar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Investasi" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Menabung" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Pengantar" }));
    fireEvent.submit(document.getElementById("lesson-form") as HTMLFormElement);

    await waitFor(() => expect(updateMock).toHaveBeenCalledTimes(1));
    expect(updateMock.mock.calls[0][0]).toMatchObject({
      data: { id: "l-2", title: "Menabung", prerequisiteIds: ["l-1"] },
    });
  });

  it("clears prerequisites by deselecting the chip (sends null)", async () => {
    seedLessons([
      mkLesson("l-1", "Pengantar"),
      mkLesson("l-2", "Menabung", "u-1", { prerequisiteIds: ["l-1"] }),
    ]);
    renderLessons();

    fireEvent.click(within(await rowOf("Menabung")).getByRole("button", { name: "Edit lesson" }));
    const chip = await screen.findByRole("button", { name: "Pengantar" });

    // Already selected — clicking again drops it.
    fireEvent.click(chip);
    fireEvent.submit(document.getElementById("lesson-form") as HTMLFormElement);

    await waitFor(() => expect(updateMock).toHaveBeenCalledTimes(1));
    expect(updateMock.mock.calls[0][0]).toMatchObject({
      data: { id: "l-2", prerequisiteIds: null },
    });
  });

  it("hides lessons that would create a prerequisite cycle", async () => {
    seedLessons([
      mkLesson("l-1", "Pengantar"),
      mkLesson("l-2", "Menabung", "u-1", { prerequisiteIds: ["l-1"] }),
      mkLesson("l-3", "Investasi"),
    ]);
    renderLessons();

    // Editing Pengantar: Menabung already depends on it, so it is hidden.
    fireEvent.click(within(await rowOf("Pengantar")).getByRole("button", { name: "Edit lesson" }));
    await screen.findByLabelText(/judul lesson/i);

    expect(screen.queryByRole("button", { name: "Menabung" })).toBeNull();
    expect(screen.getByRole("button", { name: "Investasi" })).toBeInTheDocument();
    expect(
      screen.getByText(/Beberapa lesson disembunyikan karena akan menimbulkan siklus\./),
    ).toBeInTheDocument();
  });

  it("cancels deletion when Batal is pressed", async () => {
    seedLessons([mkLesson("l-1", "Pengantar")]);
    renderLessons();

    fireEvent.click(within(await rowOf("Pengantar")).getByRole("button", { name: "Hapus lesson" }));
    const dialog = await screen.findByRole("alertdialog");
    expect(within(dialog).getByText("Pengantar")).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: "Batal" }));

    expect(deleteMock).not.toHaveBeenCalled();
    expect(screen.queryByText("Hapus lesson?")).toBeNull();
    expect(screen.getByText("Pengantar")).toBeInTheDocument();
  });

  it("deletes a lesson after confirmation and invalidates dependent caches", async () => {
    seedLessons([mkLesson("l-1", "Pengantar"), mkLesson("l-2", "Menabung")]);
    const { invalidateSpy } = renderLessons();

    fireEvent.click(within(await rowOf("Pengantar")).getByRole("button", { name: "Hapus lesson" }));
    const dialog = await screen.findByRole("alertdialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Hapus" }));

    await waitFor(() => expect(deleteMock).toHaveBeenCalledWith({ data: { id: "l-1" } }));
    await waitFor(() => expect(screen.queryByText("Pengantar")).toBeNull());
    expect(screen.getByText("Menabung")).toBeInTheDocument();
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["admin-lessons"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["admin-all-lessons"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["admin-all-screens"] });
    expect(toastMock.success).toHaveBeenCalledWith("Lesson berhasil dihapus");
  });

  it("filters lessons by title", async () => {
    seedLessons([mkLesson("l-1", "Pengantar"), mkLesson("l-2", "Menabung")]);
    renderLessons();
    await screen.findByText("Pengantar");

    fireEvent.change(screen.getByPlaceholderText("Cari lesson..."), {
      target: { value: "Mena" },
    });
    await screen.findByText("Menabung");
    expect(screen.queryByText("Pengantar")).toBeNull();

    fireEvent.change(screen.getByPlaceholderText("Cari lesson..."), {
      target: { value: "zzz" },
    });
    await screen.findByText('Tidak ada lesson yang cocok dengan "zzz".');
  });

  it("navigates to the lesson editor when a row is clicked", async () => {
    seedLessons([mkLesson("l-1", "Pengantar")]);
    renderLessons();
    await screen.findByText("Pengantar");

    fireEvent.click(screen.getByText("Pengantar"));

    await waitFor(() =>
      expect(navigateMock).toHaveBeenCalledWith({
        to: "/admin/$unitSlug/$lessonSlug",
        params: { unitSlug: "keuangan", lessonSlug: "pengantar" },
      }),
    );
  });
});
