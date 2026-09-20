"use client";

import { loginAction } from "@/actions/auth/login-action";
import { googleAuthAction } from "@/actions/auth/google-action";
import { AuthField } from "@/components/features/auth/auth-field";
import { GoogleIcon } from "@/components/features/auth/google-icon";
import { PasswordInput } from "@/components/features/auth/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { loginSchema, type LoginFormValues } from "./login-schema";
import { getPostLoginRedirect } from "@/lib/auth/redirect";

export function LoginForm() {
  const router = useRouter();
  const [formError, setFormError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function handleLogin(values: LoginFormValues) {
    setNotice(null);
    setFormError(null);

    const result = await loginAction(values);
    if (!result.success) {
      setFormError(result.error);
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (
            messages &&
            messages[0] &&
            (field === "email" || field === "password")
          ) {
            setError(field as keyof LoginFormValues, {
              type: "server",
              message: messages[0],
            });
          }
        }
      }
      return;
    }
    setNotice("Signed in successfully.");
    router.refresh();
    router.push(getPostLoginRedirect(result.data.user.role));
  }


  return (
    <div className="rounded-xl border border-border bg-surface p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-8">
      <div className="mb-space-lg text-center">
        <h1 className="font-headline-md text-headline-md font-semibold text-on-surface">
          Welcome back
        </h1>
        <p className="mt-1.5 font-body-sm text-body-sm text-on-surface-variant">
          Sign in to continue your Arabic learning journey.
        </p>
      </div>

      <form action={googleAuthAction}>
        <Button
          type="submit"
          variant="outline"
          className="w-full"
          disabled={isSubmitting}
        >
          <GoogleIcon className="h-[18px] w-[18px]" />
          Continue with Google
        </Button>
      </form>

      {notice ? (
        <p
          role="status"
          className="mt-space-sm rounded-default border border-border-strong bg-info-bg px-3 py-2 font-body-sm text-body-sm text-info-text"
        >
          {notice}
        </p>
      ) : null}

      <div
        className="my-space-lg flex items-center gap-space-sm"
        aria-hidden="true"
      >
        <span className="h-px flex-1 bg-border" />
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">
          or continue with email
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <form
        onSubmit={handleSubmit(handleLogin)}
        className="space-y-space-md"
        noValidate
      >
        <AuthField id="login-email" label="Email" error={errors.email}>
          <Input
            id="login-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register("email")}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "login-email-error" : undefined}
            disabled={isSubmitting}
          />
        </AuthField>

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-space-sm">
            <span className="font-body-sm text-body-sm font-medium text-on-surface">
              Password
            </span>
            <Link
              href="/forgot-password"
              className="font-label-sm text-label-sm font-medium text-primary transition-colors hover:text-primary-dark hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <AuthField id="login-password" label="" error={errors.password}>
            <PasswordInput
              id="login-password"
              aria-label="Password"
              autoComplete="current-password"
              placeholder="••••••••"
              {...register("password")}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password ? "login-password-error" : undefined
              }
              disabled={isSubmitting}
            />
          </AuthField>
        </div>

        {formError ? (
          <p
            role="alert"
            className="rounded-default border border-error/30 bg-error-bg px-3 py-2 font-body-sm text-body-sm text-error-text"
          >
            {formError}
          </p>
        ) : null}

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      <p className="mt-space-lg text-center font-body-sm text-body-sm text-on-surface-variant">
        New to Arabic Master?{" "}
        <Link
          href="/register"
          className="font-medium text-primary transition-colors hover:text-primary-dark hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
