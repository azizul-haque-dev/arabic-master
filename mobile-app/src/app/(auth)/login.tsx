import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppleLoginButton } from "@/components/auth/AppleLoginButton";
import { BottomCTA } from "@/components/auth/BottomCTA";
import { Divider } from "@/components/auth/Divider";
import { FormError } from "@/components/auth/FormError";
import { FormField } from "@/components/auth/FormField";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import { Logo } from "@/components/auth/Logo";
import { PasswordField } from "@/components/auth/PasswordField";
import { BackButton } from "@/components/shared/BackButton";
import { useLogin } from "@/hooks/useLogin";
import { loginSchema, type LoginFormValues } from "@/schemas/authSchema";

function getLoginErrorMessage(error: unknown): string | null {
  if (!error) return null;

  if (error instanceof AxiosError) {
    if (!error.response) {
      return "Couldn't connect. Check your internet and try again.";
    }
    if (error.response.status === 401) {
      return "Incorrect email or password.";
    }
    return "Something went wrong. Please try again.";
  }

  return "Something went wrong. Please try again.";
}

export default function LoginScreen() {
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  const { mutate: login, isPending, error } = useLogin();
  const errorMessage = getLoginErrorMessage(error);

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
          <Animated.View entering={FadeIn.duration(300)}>
            <Logo />

            <View className="gap-2 pb-8 pt-6">
              <Text className="text-center text-3xl font-bold tracking-tight text-text-main">
                Welcome back 👋
              </Text>
              <Text className="text-center text-base text-muted">
                Continue your Arabic learning journey.
              </Text>
            </View>

            <GoogleLoginButton onPress={() => {}} disabled={isPending} />
            <AppleLoginButton onPress={() => {}} disabled={isPending} />

            <Divider label="or continue with email" />

            <View className="gap-5">
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
              />
            </View>

            <FormError message={errorMessage} />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <LinearGradient
        colors={["transparent", "rgba(255,255,255,0.85)", "#ffffff"]}
        className="absolute bottom-0 left-0 w-full"
        style={{ height: 180 }}
        pointerEvents="box-none"
      >
        <BottomCTA
          onSubmit={handleSubmit((values) => login(values))}
          disabled={!isValid}
          loading={isPending}
        />
      </LinearGradient>
    </SafeAreaView>
  );
}
