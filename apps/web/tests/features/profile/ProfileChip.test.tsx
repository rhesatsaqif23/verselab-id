// Tests for ProfileChip: renders display name + starting unit from
// resolveSession().profile and hides itself for anonymous sessions.
import { beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProfileChip from "#/features/profile/ProfileChip.tsx";
import type { ResolvedSession } from "#/libs/session.ts";

const { resolveSessionMock, navigateMock, signOutMock } = vi.hoisted(() => ({
  resolveSessionMock: vi.fn(),
  navigateMock: vi.fn(),
  signOutMock: vi.fn(),
}));

vi.mock("#/libs/session.ts", () => ({
  resolveSession: resolveSessionMock,
}));

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigateMock,
}));

vi.mock("#/libs/auth-client.ts", () => ({
  authClient: {
    signOut: signOutMock,
  },
}));

const authenticated: ResolvedSession = {
  status: "authenticated",
  user: {
    id: "u-1",
    email: "budi@test.dev",
    name: "Budi",
    createdAt: new Date(),
    updatedAt: new Date(),
    emailVerified: false,
  },
  profile: {
    userId: "u-1",
    displayName: "Budi",
    startUnitId: "kewirausahaan",
    dailyGoal: "regular",
    onboardedAt: "2026-09-12T00:00:00.000Z",
  },
  onboarded: true,
  role: "user",
};

beforeEach(() => {
  resolveSessionMock.mockReset();
  navigateMock.mockReset();
  signOutMock.mockReset();
});

// Render inside act, then yield to the event loop so React 19's scheduler can
// flush the resolveSession().then() state update while act is still active.
async function renderChip() {
  await act(async () => {
    render(<ProfileChip />);
    await new Promise((r) => setTimeout(r, 0));
  });
}

describe("ProfileChip", () => {
  it("renders the display name, unit title, and logout button", async () => {
    resolveSessionMock.mockResolvedValue(authenticated);
    await renderChip();
    expect(await screen.findByText("Budi")).toBeInTheDocument();
    expect(screen.getByText("Kewirausahaan")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Keluar" })).toBeInTheDocument();
  });

  it("calls signOut and navigates home when logout button is clicked", async () => {
    const user = userEvent.setup();
    signOutMock.mockResolvedValue({});
    resolveSessionMock.mockResolvedValue(authenticated);
    await renderChip();

    const logoutButton = screen.getByRole("button", { name: "Keluar" });
    await user.click(logoutButton);

    const dialog = screen.getByRole("alertdialog");
    const confirmButton = within(dialog).getByRole("button", { name: "Keluar" });
    await act(async () => {
      fireEvent.click(confirmButton);
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(signOutMock).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith({ to: "/" });
  });

  it("renders nothing for an anonymous session", async () => {
    resolveSessionMock.mockResolvedValue({ status: "anonymous" });
    const { container } = render(<ProfileChip />);
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when the session cannot be resolved", async () => {
    resolveSessionMock.mockRejectedValue(new Error("offline"));
    const { container } = render(<ProfileChip />);
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });
    expect(container.firstChild).toBeNull();
  });
});
