import Link from "next/link";

import { CenteredAuthCard } from "@/components/auth/centered-auth-card";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <CenteredAuthCard
      title="Sign in"
      subtitle="Sign in to continue learning or purchase your Pro plan."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-(--am-moss) hover:underline"
          >
            Create a new account
          </Link>
        </>
      }
    >
      <LoginForm />
    </CenteredAuthCard>
  );
}
