import type { Metadata } from "next";
import { LoginForm } from "@/components/features/auth/login-form";
export const metadata: Metadata = {
  title: "Sign in — Arabic Master",
  description: "Sign in to access your Arabic Master account.",
};

export default async function LoginPage() {
  return <LoginForm />;
}
