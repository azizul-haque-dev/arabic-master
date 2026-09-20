import type { Metadata } from "next";
import { LoginForm } from "@/components/features/auth/login-form";
import { cookies } from 'next/headers'
export const metadata: Metadata = {
  title: "Sign in — Arabic Master",
  description: "Sign in to access your Arabic Master account.",
};

export default async function LoginPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("session")
  console.log(token)

  return <LoginForm />;
}
