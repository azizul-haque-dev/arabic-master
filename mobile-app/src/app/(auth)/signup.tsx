import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthDivider } from "@/components/auth/AuthDivider";
import { AuthFooterLink } from "@/components/auth/AuthFooterLink";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { FormInput } from "@/components/auth/FormInput";
import { GoogleIcon } from "@/components/auth/Googleicon";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { PrimaryButton } from "@/components/auth/PrimaryButton";
import { SocialButton } from "@/components/auth/SocialButton";
import { useAppleSignIn } from "@/hooks/useApplesignin";
import { SignupFormValues, signupSchema } from "@/schemas/authSchema";
import { authService } from "@/services/authService";
import { AppleIcon } from "lucide-react-native";

export default function SignupScreen() {
  const { control, handleSubmit } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  const { signInWithApple } = useAppleSignIn();

  const signupMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: () => {
      // TODO: এখানে zustand auth store-এ accessToken/refreshToken/user সেভ করুন
      router.replace("/");
    },
  });

  const onSubmit = (values: SignupFormValues) => {
    signupMutation.mutate(values);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Curved header background, HTML design অনুযায়ী */}
        <View className="absolute left-0 top-0 h-[300px] w-full rounded-b-[48px] bg-[#eafaf1]" />

        <ScrollView
          className="flex-1 px-4 pb-8"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="flex-grow justify-center px-4 py-8"
        >
          <AuthHeader
            title="Join Arabic Master"
            subtitle="Start your journey to fluency today."
            logoSource={{
              uri: "https://lh3.googleusercontent.com/aida/AEtjO1XEk2QNOzM4amzU6ghTV7ytz0TiiP3583fs8q5wgFZOUG-IayZ-MKdvsX-Bh_3EKaZm3b5BArtz3GmC3MlBgKIl6non2rQkis4t8mouR3MEXItk5j5PmDxn2kpMQD7QZzORaO0UKUwOyAw2c_bjwiXvGPCGHM4826gylchv4QBDqSxuar1sWgpwWuooQgeit78D1liy5yfkeh63fdkJwYfXsSyy7XvR46Xufa-Mr0IVnD_E0ihKqEqLXGw",
            }}
          />

          <View className="mb-6 px-1 gap-4">
            <SocialButton
              label="Continue with Apple"
              icon={<AppleIcon />}
              onPress={signInWithApple}
            />
            <SocialButton
              label="Continue with Google"
              icon={<GoogleIcon />}
              onPress={signInWithApple}
            />
          </View>

          <AuthDivider label="or create account with email" />

          <FormInput
            control={control}
            name="fullName"
            label="Full Name"
            placeholder="Enter your full name"
          />
          <FormInput
            control={control}
            name="email"
            label="Email"
            placeholder="Enter your email"
            keyboardType="email-address"
          />
          <PasswordInput
            control={control}
            name="password"
            label="Password"
            placeholder="Create a password"
          />

          <PrimaryButton
            label="Create Account"
            onPress={handleSubmit(onSubmit)}
            loading={signupMutation.isPending}
          />

          <AuthFooterLink
            question="Already have an account?"
            actionLabel="Log In"
            href="/(auth)/login"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
