// Tests for the post-onboarding welcome screen: the primary CTA deep-links to
// the chosen unit instead of always pointing home.
import { describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { OnboardingWelcome } from "#/features/onboarding/components/OnboardingWelcome.tsx";
import type { OnboardingState } from "#/features/onboarding/types.ts";

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }));

vi.mock("#/libs/content-fns.ts", () => ({
  getUnit: vi.fn().mockResolvedValue({ id: "kewirausahaan", title: "Kewirausahaan" }),
}));

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigateMock,
  Link: ({
    to,
    params,
    children,
  }: {
    to: string;
    params?: Record<string, string>;
    children: React.ReactNode;
  }) => (
    <a
      href={params?.unitId ? `/units/${params.unitId}` : to}
      onClick={(e) => {
        e.preventDefault();
        if (params) navigateMock({ to, params });
        else navigateMock({ to });
      }}
    >
      {children}
    </a>
  ),
}));

const state: OnboardingState = {
  displayName: "Budi",
  startUnitId: "kewirausahaan",
  purpose: "wirausaha",
};

describe("OnboardingWelcome", () => {
  it("greets the user by name", () => {
    render(<OnboardingWelcome state={state} />);
    expect(screen.getByText(/Selamat datang, Budi!/)).toBeInTheDocument();
  });

  it("deep-links the primary CTA to the chosen unit", () => {
    render(<OnboardingWelcome state={state} />);
    expect(screen.getByRole("link", { name: /mulai belajar/i })).toHaveAttribute(
      "href",
      "/units/kewirausahaan",
    );
  });

  it("offers a secondary link back to the dashboard", () => {
    render(<OnboardingWelcome state={state} />);
    expect(screen.getByRole("link", { name: "Nanti saja" })).toHaveAttribute("href", "/home");
  });
});
