"use client";

import { AuthAlert } from "@/components/features/auth/auth-alert";
import { AuthField } from "@/components/features/auth/auth-field";
import { PasswordInput } from "@/components/features/auth/password-input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { resetPasswordAction } from "./reset-password-action";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "./reset-password-schema";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [formError, setFormError] = React.useState<string | null>(null);
  const [tokenInvalid, setTokenInvalid] = React.useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, password: "", confirmPassword: "" },
  });

  async function handleResetPassword(values: ResetPasswordFormValues) {
    setFormError(null);
    setTokenInvalid(false);

    const result = await resetPasswordAction(values);
    if (!result.success) {
      setFormError(result.message);
      setTokenInvalid(Boolean(result.tokenInvalid));
      for (const field of ["password", "confirmPassword"] as const) {
        const message = result.fieldErrors?.[field]?.[0];
        if (message) setError(field, { type: "server", message });
      }
      return;
    }

    router.push("/login");
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-8">
      <div className="mb-space-lg text-center">
        <h1 className="font-headline-md text-headline-md font-semibold text-on-surface">
          Choose a new password
        </h1>
        <p className="mt-1.5 font-body-sm text-body-sm text-on-surface-variant">
          Make sure it&apos;s at least 8 characters.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(handleResetPassword)}
        className="space-y-space-md"
        noValidate
      >
        <input type="hidden" {...register("token")} />

        <AuthField id="reset-password" label="New password" error={errors.password}>
          <PasswordInput
            id="reset-password"
            autoComplete="new-password"
            placeholder="••••••••"
            {...register("password")}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "reset-password-error" : undefined}
            disabled={isSubmitting}
          />
        </AuthField>

        <AuthField
          id="reset-confirm-password"
          label="Confirm new password"
          error={errors.confirmPassword}
        >
          <PasswordInput
            id="reset-confirm-password"
            autoComplete="new-password"
            placeholder="••••••••"
            {...register("confirmPassword")}
            aria-invalid={Boolean(errors.confirmPassword)}
            aria-describedby={
              errors.confirmPassword ? "reset-confirm-password-error" : undefined
            }
            disabled={isSubmitting}
          />
        </AuthField>

        {formError ? <AuthAlert variant="error">{formError}</AuthAlert> : null}

        {tokenInvalid ? (
          <Link
            href="/forgot-password"
            className="block text-center font-body-sm text-body-sm font-medium text-primary hover:underline"
          >
            Request a new reset link
          </Link>
        ) : null}

        <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Resetting…
            </>
          ) : (
            "Reset password"
          )}
        </Button>
      </form>
    </div>
  );
}