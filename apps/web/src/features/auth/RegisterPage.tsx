// RegisterPage: create an account and sign in immediately (email verification
// is disabled on the API, so sign-up succeeds right away).
"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { Form } from "#/components/ui/form";
import { authClient } from "#/libs/auth-client.ts";
import { AuthField } from "./components/AuthField.tsx";
import { AuthShell } from "./components/AuthShell.tsx";
import { AuthSubmitButton } from "./components/AuthSubmitButton.tsx";
import { registerSchema, type RegisterValues } from "./schemas.ts";

export function RegisterPage() {
  const navigate = useNavigate();
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });
  const { handleSubmit, setError, setValue, formState } = form;
  const submitting = formState.isSubmitting;

  async function onSubmit(values: RegisterValues) {
    const { error } = await authClient.signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
    });
    if (error) {
      setError("root", { message: error.message ?? "Gagal membuat akun" });
      return;
    }
    setValue("password", "");
    await navigate({ to: "/onboarding" });
  }

  return (
    <AuthShell
      title="Buat akun"
      description="Daftar gratis dan mulai belajar interaktif."
      icon={UserPlus}
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Sudah punya akun?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Masuk
          </Link>
        </p>
      }
    >
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <AuthField
            name="name"
            label="Nama"
            placeholder="Nama lengkap"
            autoComplete="name"
            disabled={submitting}
          />
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
            placeholder="Minimal 8 karakter"
            autoComplete="new-password"
            disabled={submitting}
          />
          {formState.errors.root && (
            <p className="text-sm font-medium text-destructive">{formState.errors.root.message}</p>
          )}
          <AuthSubmitButton loading={submitting}>Daftar</AuthSubmitButton>
        </form>
      </Form>
    </AuthShell>
  );
}
