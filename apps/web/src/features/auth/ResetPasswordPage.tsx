// ResetPasswordPage: set a new password using the token from the reset link.
"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Form } from "#/components/ui/form";
import { Button } from "#/components/ui/button";
import { authClient } from "#/libs/auth-client.ts";
import { AuthField } from "./components/AuthField.tsx";
import { AuthShell } from "./components/AuthShell.tsx";
import { AuthSubmitButton } from "./components/AuthSubmitButton.tsx";
import { resetPasswordSchema, type ResetPasswordValues } from "./schemas.ts";

export function ResetPasswordPage({ token }: { token: string }) {
  const [done, setDone] = useState(false);
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });
  const { handleSubmit, setError, setValue, formState } = form;
  const submitting = formState.isSubmitting;

  async function onSubmit(values: ResetPasswordValues) {
    const { error } = await authClient.resetPassword({
      newPassword: values.password,
      token,
    });
    if (error) {
      setError("root", { message: error.message ?? "Tautan reset tidak valid atau kedaluwarsa" });
      return;
    }
    setValue("password", "");
    setValue("confirmPassword", "");
    setDone(true);
  }

  if (done) {
    return (
      <AuthShell
        title="Kata sandi berubah"
        description="Kata sandi kamu berhasil diperbarui. Silakan masuk dengan kata sandi baru."
        icon={ShieldCheck}
        footer={
          <Button asChild variant="outline" className="w-full font-bold">
            <Link to="/login">Masuk sekarang</Link>
          </Button>
        }
      />
    );
  }

  return (
    <AuthShell
      title="Buat kata sandi baru"
      description="Masukkan kata sandi baru untuk akunmu."
      icon={ShieldCheck}
    >
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <AuthField
            name="password"
            label="Kata sandi baru"
            type="password"
            placeholder="Minimal 8 karakter"
            autoComplete="new-password"
            disabled={submitting}
          />
          <AuthField
            name="confirmPassword"
            label="Ulangi kata sandi"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            disabled={submitting}
          />
          {formState.errors.root && (
            <p className="text-sm font-medium text-destructive">{formState.errors.root.message}</p>
          )}
          <AuthSubmitButton loading={submitting}>Simpan kata sandi</AuthSubmitButton>
        </form>
      </Form>
    </AuthShell>
  );
}
