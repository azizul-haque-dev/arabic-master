import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { ResetPasswordForm } from "@/components/features/auth/reset-password-form";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Reset password — Arabic Master Admin",
  description: "Choose a new password for your Arabic Master account.",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-center shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-8">
        <div className="mx-auto mb-space-md flex h-12 w-12 items-center justify-center rounded-full bg-error-bg text-error-text">
          <ShieldAlert className="h-5 w-5" aria-hidden="true" />
        </div>
        <h1 className="font-headline-md text-headline-md font-semibold text-on-surface">
          Invalid reset link
        </h1>
        <p className="mt-1.5 font-body-sm text-body-sm text-on-surface-variant">
          This password reset link is missing or invalid. Please request a
          new one.
        </p>
        <Link href="/forgot-password" className="mt-space-lg inline-block w-full">
          <Button variant="primary" className="w-full">
            Request a new link
          </Button>
        </Link>
      </div>
    );
  }

  return <ResetPasswordForm token={token} />;
}