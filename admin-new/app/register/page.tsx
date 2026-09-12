import { RegisterForm } from "@/components/features/auth/register-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create an Account — Arabic Master",
  description:
    "Create your Arabic Master account and start your Arabic learning journey.",
};

function RegisterPage() {
  return <RegisterForm />;
}

export default RegisterPage;
