"use client";

import { GoogleIcon } from "@/components/features/auth/google-icon";
import { PasswordInput } from "@/components/features/auth/password-input";
import { AuthField } from "@/components/features/auth/auth-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { registerAction } from "./register-action";
import { registerSchema, type RegisterFormValues } from "./register-schema";

export function RegisterForm() {
  const router = useRouter();
  const [formError, setFormError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = form;

  async function handleRegister(values: RegisterFormValues) {
    setNotice(null);
    setFormError(null);

    const result = await registerAction(values);
    if (!result.success) {
      setFormError(result.message);
      for (const field of ["name", "email", "password"] as const) {
        const message = result.fieldErrors?.[field]?.[0];
        if (message) {
          setError(field, { type: "server", message });
        }
      }
      return;
    }

    setNotice(result.message);
    router.push("/login");
  }

  function handleGoogleSignUp() {
    setFormError(null);
    setNotice(
      "Google sign-up isn't connected yet — use your email and password for now.",
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-8">
      <div className="mb-space-lg text-center">
        <h1 className="font-headline-md text-headline-md font-semibold text-on-surface">
          Create your account
        </h1>

        <p className="mt-1.5 font-body-sm text-body-sm text-on-surface-variant">
          Create an account and start your Arabic learning journey.
        </p>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogleSignUp}
        disabled={isSubmitting}
      >
        <GoogleIcon className="h-[18px] w-[18px]" />
        Continue with Google
      </Button>

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
          or sign up with email
        </span>

        <span className="h-px flex-1 bg-border" />
      </div>

      <form
        onSubmit={handleSubmit(handleRegister)}
        className="space-y-space-md"
        noValidate
      >
        <AuthField
          id="register-name"
          label="Name"
          error={errors.name}
        >
          <Input
            id="register-name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            {...register("name")}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "register-name-error" : undefined}
            disabled={isSubmitting}
          />
        </AuthField>

        <AuthField
          id="register-email"
          label="Email"
          error={errors.email}
        >
          <Input
            id="register-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register("email")}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "register-email-error" : undefined}
            disabled={isSubmitting}
          />
        </AuthField>

        <AuthField
          id="register-password"
          label="Password"
          error={errors.password}
        >
          <PasswordInput
            id="register-password"
            autoComplete="new-password"
            placeholder="••••••••"
            {...register("password")}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password ? "register-password-error" : undefined
            }
            disabled={isSubmitting}
          />
        </AuthField>

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
              Creating account…
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      <p className="mt-space-lg text-center font-body-sm text-body-sm text-on-surface-variant">
        Already have an account?{" "}
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
