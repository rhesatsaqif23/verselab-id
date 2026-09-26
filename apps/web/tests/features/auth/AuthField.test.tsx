// Tests for AuthField password visibility toggle.
import { describe, expect, it } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm, FormProvider } from "react-hook-form";
import { AuthField } from "#/features/auth/components/AuthField.tsx";

function TestWrapper({ type = "password" }: { type?: string }) {
  const methods = useForm({ defaultValues: { password: "secret-password" } });
  return (
    <FormProvider {...methods}>
      <form>
        <AuthField name="password" label="Kata sandi" type={type} />
      </form>
    </FormProvider>
  );
}

describe("AuthField", () => {
  it("renders a password input by default when type='password'", () => {
    render(<TestWrapper type="password" />);
    const input = screen.getByLabelText("Kata sandi");
    expect(input).toHaveAttribute("type", "password");
  });

  it("toggles password visibility when the eye icon button is clicked", async () => {
    const user = userEvent.setup();
    render(<TestWrapper type="password" />);

    const input = screen.getByLabelText("Kata sandi");
    const toggleButton = screen.getByRole("button", { name: "Tampilkan kata sandi" });

    expect(input).toHaveAttribute("type", "password");

    await user.click(toggleButton);
    expect(input).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Sembunyikan kata sandi" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Sembunyikan kata sandi" }));
    expect(input).toHaveAttribute("type", "password");
  });

  it("does not render the toggle button when type is 'text'", () => {
    render(<TestWrapper type="text" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
