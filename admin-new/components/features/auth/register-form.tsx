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

interface RegisterErrors {
  name?: string;
  email?: string;
  password?: string;
}

export function RegisterForm() {
  const router = useRouter();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const [errors, setErrors] = React.useState<RegisterErrors>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  function validate(): RegisterErrors {
    const next: RegisterErrors = {};

    if (!name.trim()) {
      next.name = "Name is required.";
    }

    if (!email.trim()) {
      next.email = "Email is required.";
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      next.email = "Enter a valid email address.";
    }

    if (!password) {
      next.password = "Password is required.";
    } else if (password.length < 8) {
      next.password = "Password must be at least 8 characters.";
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
      // TODO: replace with the real POST /auth/register request
      await new Promise((resolve) => setTimeout(resolve, 900));

      router.push("/login");
    } catch {
      setFormError(
        "We couldn't create your account. Please check your details and try again.",
      );
      setIsSubmitting(false);
    }
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

      <form onSubmit={handleSubmit} className="space-y-space-md" noValidate>
        {/* Name */}
        <div>
          <Label htmlFor="register-name">Name</Label>

          <Input
            id="register-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "register-name-error" : undefined}
            disabled={isSubmitting}
          />

          {errors.name ? (
            <p
              id="register-name-error"
              className="mt-1.5 font-body-sm text-body-sm text-error-text"
            >
              {errors.name}
            </p>
          ) : null}
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="register-email">Email</Label>

          <Input
            id="register-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "register-email-error" : undefined}
            disabled={isSubmitting}
          />

          {errors.email ? (
            <p
              id="register-email-error"
              className="mt-1.5 font-body-sm text-body-sm text-error-text"
            >
              {errors.email}
            </p>
          ) : null}
        </div>

        {/* Password */}
        <div>
          <Label htmlFor="register-password">Password</Label>

          <PasswordInput
            id="register-password"
            name="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password ? "register-password-error" : undefined
            }
            disabled={isSubmitting}
          />

          {errors.password ? (
            <p
              id="register-password-error"
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
