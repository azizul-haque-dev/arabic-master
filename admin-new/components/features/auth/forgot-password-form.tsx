"use client";

import { forgotPasswordAction } from "@/actions/auth/forgot-password-action";
import { AuthAlert } from "@/components/features/auth/auth-alert";
import { AuthField } from "@/components/features/auth/auth-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ForgotPasswordFormValues, forgotPasswordSchema } from "@/schemas/auth.shema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { useForm } from "react-hook-form";


export function ForgotPasswordForm() {
  const [formError, setFormError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function handleForgotPassword(values: ForgotPasswordFormValues) {
    setNotice(null);
    setFormError(null);

    const result = await forgotPasswordAction(values);
    if (!result.success) {
      setFormError(result.message);
      const message = result.fieldErrors?.email?.[0];
      if (message) setError("email", { type: "server", message });
      return;
    }

    setNotice(result.message);
    reset();
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-8">
      <div className="mb-space-lg text-center">
        <h1 className="font-headline-md text-headline-md font-semibold text-on-surface">
          Forgot your password?
        </h1>
        <p className="mt-1.5 font-body-sm text-body-sm text-on-surface-variant">
          Enter your email and we’ll send you a link to reset it.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(handleForgotPassword)}
        className="space-y-space-md"
        noValidate
      >
        <AuthField id="forgot-email" label="Email" error={errors.email}>
          <Input
            id="forgot-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register("email")}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "forgot-email-error" : undefined}
            disabled={isSubmitting}
          />
        </AuthField>

        {notice ? <AuthAlert variant="info">{notice}</AuthAlert> : null}
        {formError ? <AuthAlert variant="error">{formError}</AuthAlert> : null}

        <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Sending link…
            </>
          ) : (
            "Send reset link"
          )}
        </Button>
      </form>

      <p className="mt-space-lg text-center font-body-sm text-body-sm text-on-surface-variant">
        Remembered your password?{" "}
        <Link
          href="/login"
          className="font-medium text-primary transition-colors hover:text-primary-dark hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}