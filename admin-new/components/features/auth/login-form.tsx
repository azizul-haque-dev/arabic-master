"use client";

import { GoogleIcon } from "@/components/features/auth/google-icon";
import { PasswordInput } from "@/components/features/auth/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface LoginErrors {
  email?: string;
  password?: string;
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errors, setErrors] = React.useState<LoginErrors>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  function validate(): LoginErrors {
    const next: LoginErrors = {};
    if (!email.trim()) {
      next.email = "Email is required.";
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      next.email = "Enter a valid email address.";
    }
    if (!password) {
      next.password = "Password is required.";
    }
    return next;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    setFormError(null);

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      // TODO: replace with the real POST /auth/login request once the API is wired.
      await new Promise((resolve) => setTimeout(resolve, 900));
      router.push("/arabic-entities");
    } catch {
      setFormError(
        "We couldn't sign you in. Please check your details and try again.",
      );
      setIsSubmitting(false);
    }
  }

  function handleGoogleSignIn() {
    setFormError(null);
    setNotice(
      "Google sign-in isn't connected yet — use your email and password for now.",
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-8">
      <div className="mb-space-lg text-center">
        <h1 className="font-headline-md text-headline-md font-semibold text-on-surface">
          Welcome back
        </h1>
        <p className="mt-1.5 font-body-sm text-body-sm text-on-surface-variant">
          Sign in to manage Arabic entities, words, and sentences.
        </p>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogleSignIn}
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
          or continue with email
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-space-md" noValidate>
        <div>
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "login-email-error" : undefined}
            disabled={isSubmitting}
          />
          {errors.email ? (
            <p
              id="login-email-error"
              className="mt-1.5 font-body-sm text-body-sm text-error-text"
            >
              {errors.email}
            </p>
          ) : null}
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-space-sm">
            <Label htmlFor="login-password" className="mb-0">
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="font-label-sm text-label-sm font-medium text-primary transition-colors hover:text-primary-dark hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="login-password"
            name="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password ? "login-password-error" : undefined
            }
            disabled={isSubmitting}
          />
          {errors.password ? (
            <p
              id="login-password-error"
              className="mt-1.5 font-body-sm text-body-sm text-error-text"
            >
              {errors.password}
            </p>
          ) : null}
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
