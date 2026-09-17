// LoginPage: email + password sign-in via the Better Auth client.
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { LogIn } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Form } from "#/components/ui/form";
import { authClient, translateAuthError } from "#/libs/auth-client.ts";
import { AuthField } from "./components/AuthField.tsx";
import { AuthShell } from "./components/AuthShell.tsx";
import { AuthSubmitButton } from "./components/AuthSubmitButton.tsx";
import { loginSchema, type LoginValues } from "./schemas.ts";

export function LoginPage() {
  const navigate = useNavigate();
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const { handleSubmit, setValue, formState } = form;
  const submitting = formState.isSubmitting;

  async function onSubmit(values: LoginValues) {
    const { error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
    });
    if (error) {
      toast.error(translateAuthError(error, "Email atau kata sandi salah"));
      return;
    }
    setValue("password", "");
    await navigate({ to: "/home" });
  }

  return (
    <AuthShell
      title="Masuk"
      description="Lanjutkan belajar dan jaga streak harianmu."
      icon={LogIn}
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Belum punya akun?{" "}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Daftar
          </Link>
        </p>
      }
    >
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <AuthField
            name="email"
            label="Email"
            type="email"
            placeholder="nama@email.com"
            autoComplete="email"
            disabled={submitting}
          />
          <AuthField
            name="password"
            label="Kata sandi"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={submitting}
          />
          <div className="flex items-center justify-end">
            <Link
              to="/forgot-password"
              className="text-sm font-semibold text-primary hover:underline"
            >
              Lupa kata sandi?
            </Link>
          </div>
          <AuthSubmitButton loading={submitting}>Masuk</AuthSubmitButton>
        </form>
      </Form>
    </AuthShell>
  );
}
