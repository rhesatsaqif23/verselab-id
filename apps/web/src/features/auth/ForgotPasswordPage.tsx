// ForgotPasswordPage: request a password-reset link sent to the account email.
"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { KeyRound, MailCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Form } from "#/components/ui/form";
import { Button } from "#/components/ui/button";
import { authClient } from "#/libs/auth-client.ts";
import { env } from "#/libs/env.ts";
import { AuthField } from "./components/AuthField.tsx";
import { AuthShell } from "./components/AuthShell.tsx";
import { AuthSubmitButton } from "./components/AuthSubmitButton.tsx";
import { forgotPasswordSchema, type ForgotPasswordValues } from "./schemas.ts";

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });
  const { handleSubmit, setError, formState } = form;
  const submitting = formState.isSubmitting;

  async function onSubmit(values: ForgotPasswordValues) {
    const { error } = await authClient.requestPasswordReset({
      email: values.email,
      redirectTo: `${env.apiOrigin}/reset-password`,
    });
    if (error) {
      setError("root", { message: error.message ?? "Gagal mengirim tautan reset" });
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <AuthShell
        title="Cek email kamu"
        description="Jika akun tersebut terdaftar, kami kirim tautan untuk mengatur ulang kata sandi."
        icon={MailCheck}
        footer={
          <div className="flex flex-col gap-2">
            <Button asChild variant="outline" className="w-full font-bold">
              <Link to="/login">Kembali ke masuk</Link>
            </Button>
          </div>
        }
      >
        <p className="text-center text-sm text-muted-foreground">
          Tautan reset berlaku sementara. Periksa folder spam bila tidak muncul.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Lupa kata sandi"
      description="Masukkan email kamu dan kami kirimkan tautan reset."
      icon={KeyRound}
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Ingat kata sandi?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Masuk
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
          {formState.errors.root && (
            <p className="text-sm font-medium text-destructive">{formState.errors.root.message}</p>
          )}
          <AuthSubmitButton loading={submitting}>Kirim tautan reset</AuthSubmitButton>
        </form>
      </Form>
    </AuthShell>
  );
}
