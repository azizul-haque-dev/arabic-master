import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { AppleLoginButton } from "@/components/auth/AppleLoginButton";
import { BackButton } from "@/components/auth/BackButton";
import { Divider } from "@/components/auth/Divider";
import { FormField } from "@/components/auth/FormField";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import { Logo } from "@/components/auth/Logo";
import { PasswordField } from "@/components/auth/PasswordField";
import { TermsCheckbox } from "@/components/auth/TermsCheckbox";
import { useRegister } from "@/hooks/useRegister";
import { registerSchema, type RegisterFormValues } from "@/schemas/authSchema";
import { SafeAreaView } from "react-native-safe-area-context";

function getRegisterErrorMessage(error: unknown): string | null {
  if (!error) return null;

  if (error instanceof AxiosError) {
    if (!error.response) {
      return "Couldn't connect. Check your internet and try again.";
    }
    if (error.response.status === 409) {
      return "An account with this email already exists.";
    }
    return "Something went wrong. Please try again.";
  }

  return "Something went wrong. Please try again.";
}

export default function RegisterScreen() {
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      acceptedTerms: false,
    },
  });

  const { mutate: register, isPending, error } = useRegister();
  const errorMessage = getRegisterErrorMessage(error);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View className="px-6 pb-2 pt-4">
          <BackButton />
        </View>

        <ScrollView
          className="flex-1 px-6"
          contentContainerClassName="pb-36"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Logo />

          <View className="gap-2 pb-8 pt-6">
            <Text className="text-center text-3xl font-bold tracking-tight text-text-main">
              Create your account
            </Text>
            <Text className="text-center text-base text-muted">
              Start your Arabic learning journey.
            </Text>
          </View>

          <GoogleLoginButton onPress={() => {}} disabled={isPending} />
          <AppleLoginButton onPress={() => {}} disabled={isPending} />

          <Divider label="or continue with email" />

          <View className="gap-5">
            <FormField
              control={control}
              name="fullName"
              label="Full Name"
              placeholder="Enter your full name"
              autoCapitalize="words"
              autoComplete="name"
              editable={!isPending}
            />

            <FormField
              control={control}
              name="email"
              label="Email"
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!isPending}
            />

            <PasswordField
              control={control}
              name="password"
              disabled={isPending}
              showForgotPassword={false}
            />

            <TermsCheckbox control={control} name="acceptedTerms" />
          </View>

          {errorMessage && (
            <Text
              className="mt-4 text-center text-sm text-red-500"
              accessibilityLiveRegion="polite"
            >
              {errorMessage}
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <LinearGradient
        colors={["transparent", "rgba(255,255,255,0.85)", "#ffffff"]}
        className="absolute bottom-0 left-0 w-full"
        style={{ height: 180 }}
        pointerEvents="box-none"
      >
        <View className="px-6 pb-8 pt-10">
          <Pressable
            onPress={handleSubmit((values) => register(values))}
            disabled={!isValid || isPending}
            className={`h-14 w-full items-center justify-center rounded-2xl ${
              !isValid || isPending ? "bg-slate-200" : "bg-primary"
            }`}
          >
            <Text
              className={`text-base font-semibold ${
                !isValid || isPending ? "text-slate-400" : "text-white"
              }`}
            >
              {isPending ? "Creating account..." : "Create Account"}
            </Text>
          </Pressable>

          <View className="mt-4 flex-row justify-center">
            <Text className="text-sm text-muted">
              Already have an account?{" "}
            </Text>
            <Link
              href="/(auth)/login"
              className="text-sm font-bold text-brand-primary"
            >
              Log in
            </Link>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
