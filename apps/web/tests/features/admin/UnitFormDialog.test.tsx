// Double-submit protection: two submits in the same tick both pass the
// disabled-button check (React has not re-rendered yet), so handleSubmit
// guards with a ref — exactly one create must reach the API.
import { describe, expect, it, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UnitFormDialog } from "#/features/admin/components/UnitFormDialog.tsx";

const { createMock, updateMock } = vi.hoisted(() => {
  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
  return {
    createMock: vi.fn(async (_input: unknown) => {
      await delay(20);
      return { id: "u-new" };
    }),
    updateMock: vi.fn(async (_input: unknown) => ({ id: "u-1" })),
  };
});

vi.mock("#/libs/admin-content-fns.ts", () => ({
  adminCreateUnit: createMock,
  adminUpdateUnit: updateMock,
  adminUploadUnitImage: vi.fn(),
  translateAdminError: (_err: unknown, fallback: string) => fallback,
}));

function renderDialog() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <UnitFormDialog trigger={<button>Buka</button>} />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  createMock.mockClear();
  updateMock.mockClear();
});

describe("UnitFormDialog submit guard", () => {
  it("creates exactly one unit on a same-tick double submit", async () => {
    renderDialog();
    fireEvent.click(screen.getByText("Buka"));
    const title = await screen.findByLabelText(/judul unit/i);
    fireEvent.change(title, { target: { value: "Unit Baru" } });

    const form = document.getElementById("unit-form");
    expect(form).not.toBeNull();
    fireEvent.submit(form as HTMLFormElement);
    fireEvent.submit(form as HTMLFormElement);

    await waitFor(() => expect(createMock).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.queryByText("Tambah Unit")).toBeNull());
  });

  it("rejects an empty title before any API call", async () => {
    renderDialog();
    fireEvent.click(screen.getByText("Buka"));
    await screen.findByLabelText(/judul unit/i);

    const form = document.getElementById("unit-form");
    fireEvent.submit(form as HTMLFormElement);

    expect(createMock).not.toHaveBeenCalled();
    // Dialog stays open with the validation error still fixable inline.
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
