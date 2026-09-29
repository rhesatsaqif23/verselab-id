// Unit catalog CRUD end-to-end: list → create (trimmed input) → validation →
// edit → delete confirm/cancel → filter → row navigation → cache invalidation.
// The real UnitList page drives a state-backed server-fn mock, so mutations
// stick and the invalidation refetch sees them — no Postgres, no sockets.
import { beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UnitList } from "#/features/admin/pages/UnitList.tsx";
import type { AdminUnit } from "#/libs/admin-content-fns.ts";

const { mockUnits, createMock, updateMock, deleteMock, navigateMock, toastMock, seedUnits } =
  vi.hoisted(() => {
    const slugify = (title: string) =>
      title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const mkUnit = (id: string, title: string, description: string | null = null): AdminUnit => ({
      id,
      title,
      slug: slugify(title),
      description,
      imageUrl: null,
      sortOrder: 0,
      createdAt: "2026-09-20T00:00:00.000Z",
      updatedAt: "2026-09-20T00:00:00.000Z",
    });

    const mockUnits: AdminUnit[] = [];
    let nextId = 1;

    const createMock = vi.fn(async (input: { data: { title: string; description?: string } }) => {
      const row = mkUnit(`u-new-${nextId++}`, input.data.title, input.data.description ?? null);
      mockUnits.push(row);
      return row;
    });

    const updateMock = vi.fn(
      async (input: {
        data: { id: string; title?: string; description?: string; imageUrl?: string | null };
      }) => {
        const row = mockUnits.find((u) => u.id === input.data.id);
        if (!row) throw new Error("unknown unit");
        if (input.data.title !== undefined) {
          row.title = input.data.title;
          row.slug = slugify(input.data.title);
        }
        if (input.data.description !== undefined) row.description = input.data.description;
        if (input.data.imageUrl !== undefined) row.imageUrl = input.data.imageUrl;
        return { ...row };
      },
    );

    const deleteMock = vi.fn(async (input: { data: { id: string } }) => {
      const index = mockUnits.findIndex((u) => u.id === input.data.id);
      if (index >= 0) mockUnits.splice(index, 1);
      return null;
    });

    return {
      mockUnits,
      createMock,
      updateMock,
      deleteMock,
      navigateMock: vi.fn(),
      toastMock: { success: vi.fn(), error: vi.fn() },
      seedUnits: (rows: AdminUnit[]) =>
        mockUnits.splice(0, mockUnits.length, ...rows.map((r) => ({ ...r }))),
      mkUnit,
    };
  });

vi.mock("#/libs/admin-content-fns.ts", () => ({
  adminGetUnits: async () => mockUnits.map((u) => ({ ...u })),
  adminCreateUnit: createMock,
  adminUpdateUnit: updateMock,
  adminDeleteUnit: deleteMock,
  adminUploadUnitImage: vi.fn(),
  translateAdminError: (_err: unknown, fallback: string) => fallback,
}));

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigateMock,
}));

vi.mock("sonner", () => ({
  Toaster: () => null,
  toast: toastMock,
}));

function renderUnits() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const invalidateSpy = vi.spyOn(client, "invalidateQueries");
  const view = render(
    <QueryClientProvider client={client}>
      <UnitList />
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

describe("UnitList CRUD", () => {
  it("lists the unit catalog with title and description cells", async () => {
    seedUnits([]);
    mockUnits.push(
      {
        id: "u-1",
        title: "Keuangan",
        slug: "keuangan",
        description: "Belajar dasar",
        imageUrl: null,
        sortOrder: 0,
        createdAt: "2026-09-20T00:00:00.000Z",
        updatedAt: "2026-09-20T00:00:00.000Z",
      },
      {
        id: "u-2",
        title: "Akuntansi",
        slug: "akuntansi",
        description: null,
        imageUrl: null,
        sortOrder: 1,
        createdAt: "2026-09-21T00:00:00.000Z",
        updatedAt: "2026-09-21T00:00:00.000Z",
      },
    );

    renderUnits();
    await screen.findByText("Keuangan");
    expect(screen.getByText("Akuntansi")).toBeInTheDocument();
    expect(screen.getByText("Belajar dasar")).toBeInTheDocument();
    // Both the description and the image cells fall back to a dash placeholder.
    expect(screen.getAllByText("-").length).toBeGreaterThan(0);
  });

  it("creates a unit with trimmed title and description", async () => {
    seedUnits([]);
    const { invalidateSpy } = renderUnits();

    fireEvent.click(screen.getByRole("button", { name: "Tambah Unit" }));
    const title = await screen.findByLabelText(/judul unit/i);
    fireEvent.change(title, { target: { value: "  Investasi  " } });
    fireEvent.change(screen.getByLabelText(/deskripsi/i), {
      target: { value: "  Modal awal  " },
    });

    fireEvent.submit(document.getElementById("unit-form") as HTMLFormElement);

    await waitFor(() => expect(createMock).toHaveBeenCalledTimes(1));
    expect(createMock.mock.calls[0][0]).toEqual({
      data: { title: "Investasi", description: "Modal awal" },
    });
    await screen.findByText("Investasi");
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["admin-units"] });
    expect(toastMock.success).toHaveBeenCalledWith("Unit berhasil ditambahkan");
    // Dialog closed after the save.
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("keeps the dialog open and skips the API call on an empty title", async () => {
    seedUnits([]);
    renderUnits();

    fireEvent.click(screen.getByRole("button", { name: "Tambah Unit" }));
    await screen.findByLabelText(/judul unit/i);
    fireEvent.submit(document.getElementById("unit-form") as HTMLFormElement);

    expect(createMock).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(toastMock.error).toHaveBeenCalledWith("Judul Unit wajib diisi");
  });

  it("edits a unit with prefilled values and saves trimmed input", async () => {
    seedUnits([
      {
        id: "u-1",
        title: "Keuangan",
        slug: "keuangan",
        description: "Deskripsi lama",
        imageUrl: null,
        sortOrder: 0,
        createdAt: "2026-09-20T00:00:00.000Z",
        updatedAt: "2026-09-20T00:00:00.000Z",
      },
    ]);
    renderUnits();

    fireEvent.click(within(await rowOf("Keuangan")).getByRole("button", { name: "Edit unit" }));
    const title = await screen.findByLabelText(/judul unit/i);
    expect(title).toHaveValue("Keuangan");
    expect(screen.getByLabelText(/deskripsi/i)).toHaveValue("Deskripsi lama");

    fireEvent.change(title, { target: { value: "  Keuangan Pribadi  " } });
    fireEvent.change(screen.getByLabelText(/deskripsi/i), {
      target: { value: "  Deskripsi baru  " },
    });
    fireEvent.submit(document.getElementById("unit-form") as HTMLFormElement);

    await waitFor(() => expect(updateMock).toHaveBeenCalledTimes(1));
    expect(updateMock.mock.calls[0][0]).toEqual({
      data: { id: "u-1", title: "Keuangan Pribadi", description: "Deskripsi baru" },
    });
    await screen.findByText("Keuangan Pribadi");
    expect(toastMock.success).toHaveBeenCalledWith("Unit berhasil diperbarui");
  });

  it("cancels deletion when Batal is pressed", async () => {
    seedUnits([
      {
        id: "u-1",
        title: "Keuangan",
        slug: "keuangan",
        description: null,
        imageUrl: null,
        sortOrder: 0,
        createdAt: "2026-09-20T00:00:00.000Z",
        updatedAt: "2026-09-20T00:00:00.000Z",
      },
    ]);
    renderUnits();

    fireEvent.click(within(await rowOf("Keuangan")).getByRole("button", { name: "Hapus unit" }));
    const dialog = await screen.findByRole("alertdialog");
    expect(within(dialog).getByText("Keuangan")).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: "Batal" }));

    expect(deleteMock).not.toHaveBeenCalled();
    expect(screen.queryByText("Hapus unit?")).toBeNull();
    expect(screen.getByText("Keuangan")).toBeInTheDocument();
  });

  it("deletes a unit after confirmation and invalidates dependent caches", async () => {
    seedUnits([
      {
        id: "u-1",
        title: "Keuangan",
        slug: "keuangan",
        description: null,
        imageUrl: null,
        sortOrder: 0,
        createdAt: "2026-09-20T00:00:00.000Z",
        updatedAt: "2026-09-20T00:00:00.000Z",
      },
      {
        id: "u-2",
        title: "Akuntansi",
        slug: "akuntansi",
        description: null,
        imageUrl: null,
        sortOrder: 1,
        createdAt: "2026-09-21T00:00:00.000Z",
        updatedAt: "2026-09-21T00:00:00.000Z",
      },
    ]);
    const { invalidateSpy } = renderUnits();

    fireEvent.click(within(await rowOf("Keuangan")).getByRole("button", { name: "Hapus unit" }));
    const dialog = await screen.findByRole("alertdialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Hapus" }));

    await waitFor(() => expect(deleteMock).toHaveBeenCalledWith({ data: { id: "u-1" } }));
    await waitFor(() => expect(screen.queryByText("Keuangan")).toBeNull());
    expect(screen.getByText("Akuntansi")).toBeInTheDocument();
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["admin-units"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["admin-lessons"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["admin-all-lessons"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["admin-all-screens"] });
    expect(toastMock.success).toHaveBeenCalledWith("Unit berhasil dihapus");
  });

  it("filters units by title and shows the empty-filter message", async () => {
    seedUnits([
      {
        id: "u-1",
        title: "Keuangan",
        slug: "keuangan",
        description: null,
        imageUrl: null,
        sortOrder: 0,
        createdAt: "2026-09-20T00:00:00.000Z",
        updatedAt: "2026-09-20T00:00:00.000Z",
      },
      {
        id: "u-2",
        title: "Akuntansi",
        slug: "akuntansi",
        description: null,
        imageUrl: null,
        sortOrder: 1,
        createdAt: "2026-09-21T00:00:00.000Z",
        updatedAt: "2026-09-21T00:00:00.000Z",
      },
    ]);
    renderUnits();
    await screen.findByText("Keuangan");

    fireEvent.change(screen.getByPlaceholderText("Cari unit..."), {
      target: { value: "Akunt" },
    });
    await screen.findByText("Akuntansi");
    expect(screen.queryByText("Keuangan")).toBeNull();

    fireEvent.change(screen.getByPlaceholderText("Cari unit..."), {
      target: { value: "zzz" },
    });
    await screen.findByText('Tidak ada unit yang cocok dengan "zzz".');
  });

  it("navigates to the unit detail when a row is clicked", async () => {
    seedUnits([
      {
        id: "u-1",
        title: "Keuangan",
        slug: "keuangan",
        description: null,
        imageUrl: null,
        sortOrder: 0,
        createdAt: "2026-09-20T00:00:00.000Z",
        updatedAt: "2026-09-20T00:00:00.000Z",
      },
    ]);
    renderUnits();
    await screen.findByText("Keuangan");

    fireEvent.click(screen.getByText("Keuangan"));

    await waitFor(() =>
      expect(navigateMock).toHaveBeenCalledWith({
        to: "/admin/$unitSlug",
        params: { unitSlug: "keuangan" },
      }),
    );
  });
});
