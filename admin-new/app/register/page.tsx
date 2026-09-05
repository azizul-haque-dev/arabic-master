import Link from "next/link";

import { CenteredAuthCard } from "@/components/auth/centered-auth-card";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <CenteredAuthCard
      title="Create an account"
      subtitle="Create an account to start learning and purchase a Pro plan."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-(--am-moss) hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </CenteredAuthCard>
  );
}
