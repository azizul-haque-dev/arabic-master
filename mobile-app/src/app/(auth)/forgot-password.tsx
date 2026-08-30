import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { FormError } from "@/components/auth/FormError";
import { FormField } from "@/components/auth/FormField";
import { Logo } from "@/components/auth/Logo";
import { BackButton } from "@/components/shared/BackButton";

const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});
type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
  const [sent, setSent] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
    defaultValues: { email: "" },
  });

  const errorMessage =
    error instanceof AxiosError
      ? "Couldn't send the reset link. Please try again."
      : null;

  const onSubmit = async (_values: ForgotPasswordValues) => {
    setIsPending(true);
    setError(null);
    try {
      // TODO: call your real password-reset mutation here
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSent(true);
    } catch (err) {
      setError(err);
    } finally {
      setIsPending(false);
    }
  };

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
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Logo />

          <View className="gap-2 pb-8 pt-6">
            <Text className="text-center text-3xl font-bold tracking-tight text-text-main">
              {sent ? "Check your email" : "Reset your password"}
            </Text>
            <Text className="text-center text-base text-muted">
              {sent
                ? "We've sent a reset link to your email address."
                : "Enter the email tied to your account and we'll send you a reset link."}
            </Text>
          </View>

          {!sent && (
            <>
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

              <FormError message={errorMessage} />

              <Pressable
                onPress={handleSubmit(onSubmit)}
                disabled={!isValid || isPending}
                className={`mt-6 h-14 w-full items-center justify-center rounded-2xl active:scale-[0.98] ${
                  !isValid || isPending
                    ? "bg-slate-200"
                    : "bg-primary shadow-brand-sm"
                }`}
              >
                <Text
                  className={`text-base font-semibold ${
                    !isValid || isPending ? "text-slate-400" : "text-white"
                  }`}
                >
                  {isPending ? "Sending..." : "Send reset link"}
                </Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
