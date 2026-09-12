import type { Metadata } from "next";
import { LoginForm } from "@/components/features/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in — Arabic Master Admin",
  description: "Sign in to manage the Arabic Master content library.",
};

export default function LoginPage() {
  return <LoginForm />;
}
