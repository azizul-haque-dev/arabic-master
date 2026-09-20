import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/features/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password — Arabic Master Admin",
  description: "Request a password reset link for your Arabic Master account.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}