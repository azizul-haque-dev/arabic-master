import { zodResolver } from "@hookform/resolvers/zod";
import { LinearGradient } from "expo-linear-gradient";
import { useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";

import { BottomCTA } from "@/components/auth/BottomCTA";
import { Divider } from "@/components/auth/Divider";
import { FormField } from "@/components/auth/FormField";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import { LanguageSwitcher } from "@/components/auth/LanguageSwitcher";
import { PasswordField } from "@/components/auth/PasswordField";

import { useLogin } from "@/hooks/useLogin";
import { loginSchema, type LoginFormValues } from "@/schemas/authSchema";
import { SafeAreaView } from "react-native-safe-area-context";

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

  return (
    <SafeAreaView className="flex-1 bg-background justify-center h-screen">
      <LanguageSwitcher />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1  justify-center h-screen"
      >
        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          contentContainerClassName="pb-36"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="gap-2 pb-8 pt-2">
            <Text className="text-3xl font-bold tracking-tight text-text-main">
              Welcome back
            </Text>
            <Text className="text-base text-muted">
              Log in to continue your learning journey.
            </Text>
          </View>

          <GoogleLoginButton onPress={() => {}} />

          <Divider label="Or log in with email" />

          <View className="gap-5">
            <FormField
              control={control}
              name="email"
              label="Email address"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <PasswordField control={control} />
          </View>

          {error && (
            <Text className="mt-4 text-center text-sm text-red-500">
              Invalid email or password.
            </Text>
          )}
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
