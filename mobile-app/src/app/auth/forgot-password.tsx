import * as Haptics from "expo-haptics";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  KeyRound,
  Mail,
  MailCheck,
  RotateCcw,
  Send,
  X,
} from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BrandMark } from "@/components/onboarding/BrandMark";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();

  // State
  const [email, setEmail] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // Initialize with param if passed from Login screen
  useEffect(() => {
    if (params.email && typeof params.email === "string") {
      setEmail(params.email);
    }
  }, [params.email]);

  // Cooldown countdown effect
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  const triggerHaptic = (
    style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light,
  ) => {
    try {
      Haptics.impactAsync(style);
    } catch {
      // Safe fallback
    }
  };

  const handleSendLink = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setErrorMessage(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setErrorMessage("Please enter your email address.");
      return;
    }
    if (!trimmed.includes("@") || !trimmed.includes(".")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      setCooldownSeconds(60);
      triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
    }, 900);
  };

  const handleResend = () => {
    if (cooldownSeconds > 0 || isLoading) return;
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setCooldownSeconds(60);
      triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    }, 800);
  };

  const handleOpenEmailApp = async () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    try {
      if (Platform.OS === "ios") {
        const canOpen = await Linking.canOpenURL("message://");
        if (canOpen) {
          await Linking.openURL("message://");
          return;
        }
      }
      await Linking.openURL("mailto:");
    } catch {
      // Safe fallback if email client is unavailable
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Top Minimal Navigation Bar */}
        <View className="h-14 flex-row items-center justify-between px-margin">
          <Pressable
            onPress={() => {
              triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            className="h-10 w-10 items-center justify-center rounded-full border border-outline-variant bg-surface-container-lowest active:bg-surface-container-low active:scale-95"
          >
            <ArrowLeft size={20} color="#171717" strokeWidth={2.4} />
          </Pressable>

          <BrandMark variant="logo" size={36} />

          <View className="h-10 w-10" />
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="flex-1 justify-between px-margin pb-6 pt-2">
            {!isSubmitted ? (
              // ---------------- STATE 1: Enter Email ----------------
              <View>
                {/* Hero Icon & Title */}
                <View className="items-center pb-2 pt-3">
                  <View className="h-16 w-16 items-center justify-center rounded-2xl bg-primary-subtle border border-primary/20 shadow-xs">
                    <KeyRound size={30} color="#15803d" strokeWidth={2.2} />
                  </View>
                  <Text className="mt-4 text-center font-headline-md text-[26px] font-extrabold tracking-tight text-on-surface">
                    Forgot password?
                  </Text>
                  <Text className="mt-2 text-center font-body-sm text-[14px] text-on-surface-variant max-w-[290px] leading-relaxed">
                    No worries! Enter your registered email and we'll send you instructions to reset your password.
                  </Text>
                </View>

                {/* Error Banner */}
                {errorMessage ? (
                  <View className="mt-4 flex-row items-center gap-2.5 rounded-2xl border border-error/20 bg-error-container p-3.5">
                    <AlertCircle size={18} color="#ba1a1a" strokeWidth={2.2} />
                    <Text className="flex-1 font-body-sm text-xs font-semibold text-on-error-container">
                      {errorMessage}
                    </Text>
                    <Pressable
                      onPress={() => setErrorMessage(null)}
                      hitSlop={8}
                      className="p-1"
                    >
                      <X size={15} color="#ba1a1a" />
                    </Pressable>
                  </View>
                ) : null}

                {/* Form Input */}
                <View className="mt-6">
                  <Text className="mb-1.5 font-label-md text-xs font-semibold text-on-surface">
                    Email address
                  </Text>
                  <View
                    style={{
                      shadowColor: isFocused ? "#15803d" : "#000000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: isFocused ? 0.08 : 0.02,
                      shadowRadius: 6,
                      elevation: isFocused ? 3 : 1,
                    }}
                    className={`h-[56px] flex-row items-center rounded-2xl border px-4 ${
                      isFocused
                        ? "border-2 border-primary bg-white"
                        : "border-outline-variant bg-surface-container-low"
                    }`}
                  >
                    <Mail
                      size={20}
                      color={isFocused ? "#15803d" : "#737373"}
                      strokeWidth={2}
                    />
                    <TextInput
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      onFocus={() => {
                        triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                        setIsFocused(true);
                      }}
                      onBlur={() => setIsFocused(false)}
                      placeholder="Enter your email"
                      placeholderTextColor="#737373"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="email"
                      textContentType="emailAddress"
                      returnKeyType="done"
                      onSubmitEditing={handleSendLink}
                      className="ml-3 flex-1 font-body-md text-[15px] text-on-surface"
                    />
                    {email.length > 0 ? (
                      <Pressable
                        onPress={() => {
                          triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                          setEmail("");
                        }}
                        hitSlop={8}
                        accessibilityLabel="Clear email"
                        className="h-6 w-6 items-center justify-center rounded-full bg-outline-variant/60"
                      >
                        <X size={13} color="#525252" strokeWidth={2.5} />
                      </Pressable>
                    ) : null}
                  </View>
                </View>

                {/* Primary CTA */}
                <Pressable
                  onPress={handleSendLink}
                  disabled={isLoading}
                  accessibilityRole="button"
                  accessibilityLabel="Send Reset Link"
                  accessibilityState={{ busy: isLoading }}
                  style={({ pressed }) => [
                    {
                      shadowColor: "#15803d",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.22,
                      shadowRadius: 10,
                      elevation: 4,
                      opacity: pressed ? 0.92 : 1,
                      transform: [{ scale: pressed ? 0.985 : 1 }],
                    },
                  ]}
                  className="mt-6 h-[56px] w-full flex-row items-center justify-center rounded-2xl bg-primary"
                >
                  {isLoading ? (
                    <View className="flex-row items-center gap-2">
                      <ActivityIndicator color="#ffffff" size="small" />
                      <Text className="font-label-lg text-base font-bold text-white">
                        Sending link...
                      </Text>
                    </View>
                  ) : (
                    <View className="flex-row items-center gap-2">
                      <Send size={18} color="#ffffff" strokeWidth={2.4} />
                      <Text className="font-label-lg text-base font-bold text-white tracking-wide">
                        Send Reset Link
                      </Text>
                    </View>
                  )}
                </Pressable>

                {/* Demo Shortcut: Skip to Reset Screen */}
                <Pressable
                  onPress={() => {
                    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                    router.push({
                      pathname: "/auth/reset-password",
                      params: { email: email.trim() || "demo@arabicmaster.com" },
                    });
                  }}
                  className="mt-4 flex-row items-center justify-center py-2"
                >
                  <Text className="font-body-sm text-xs font-medium text-on-surface-variant">
                    Already have a reset link or code?{" "}
                  </Text>
                  <Text className="font-label-sm text-xs font-bold text-primary">
                    Enter here
                  </Text>
                </Pressable>
              </View>
            ) : (
              // ---------------- STATE 2: Email Dispatched ----------------
              <View className="items-center pt-6">
                {/* Soft Concentric Glow Badge */}
                <View className="items-center justify-center mb-6">
                  <View className="h-28 w-28 items-center justify-center rounded-full bg-emerald-50">
                    <View className="h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
                      <View className="h-14 w-14 items-center justify-center rounded-full bg-primary shadow-sm shadow-emerald-500/20">
                        <MailCheck size={28} color="#ffffff" strokeWidth={2.4} />
                      </View>
                    </View>
                  </View>
                </View>

                <Text className="text-center font-headline-md text-[24px] font-extrabold tracking-tight text-on-surface">
                  Check your email
                </Text>
                <Text className="mt-2 text-center font-body-sm text-[14px] text-on-surface-variant leading-relaxed max-w-[280px]">
                  We have sent password reset instructions to:
                </Text>

                {/* Email Highlight Pill */}
                <View className="mt-3 flex-row items-center gap-2 rounded-2xl border border-outline-variant bg-surface-container-low px-4 py-2.5">
                  <Mail size={16} color="#15803d" strokeWidth={2} />
                  <Text className="font-label-lg text-sm font-bold text-on-surface">
                    {email.trim()}
                  </Text>
                  <Pressable
                    onPress={() => {
                      triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                      setIsSubmitted(false);
                    }}
                    hitSlop={8}
                    className="ml-1"
                  >
                    <Text className="font-label-sm text-xs font-semibold text-primary underline">
                      Change
                    </Text>
                  </Pressable>
                </View>

                {/* Helpful Guidance Card */}
                <View className="mt-6 w-full rounded-2xl border border-outline-variant bg-surface-container-lowest p-4">
                  <View className="flex-row items-start gap-3">
                    <CheckCircle2 size={18} color="#15803d" strokeWidth={2.2} className="mt-0.5" />
                    <View className="flex-1">
                      <Text className="font-label-md text-xs font-bold text-on-surface">
                        Didn't receive the email?
                      </Text>
                      <Text className="mt-1 font-body-sm text-xs text-on-surface-variant leading-relaxed">
                        Please check your spam or junk folder. The reset link is valid for 15 minutes.
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="mt-6 w-full gap-3">
                  {/* Open Email Client */}
                  <Pressable
                    onPress={handleOpenEmailApp}
                    accessibilityRole="button"
                    accessibilityLabel="Open email app"
                    style={({ pressed }) => [
                      {
                        shadowColor: "#15803d",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.22,
                        shadowRadius: 10,
                        elevation: 4,
                        opacity: pressed ? 0.92 : 1,
                        transform: [{ scale: pressed ? 0.985 : 1 }],
                      },
                    ]}
                    className="h-[54px] w-full flex-row items-center justify-center gap-2 rounded-2xl bg-primary"
                  >
                    <Mail size={18} color="#ffffff" strokeWidth={2.2} />
                    <Text className="font-label-lg text-base font-bold text-white">
                      Open Email App
                    </Text>
                  </Pressable>

                  {/* Continue to New Password Screen */}
                  <Pressable
                    onPress={() => {
                      triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
                      router.push({
                        pathname: "/auth/reset-password",
                        params: { email: email.trim() },
                      });
                    }}
                    style={({ pressed }) => [
                      {
                        opacity: pressed ? 0.85 : 1,
                        transform: [{ scale: pressed ? 0.99 : 1 }],
                      },
                    ]}
                    className="h-[52px] w-full flex-row items-center justify-center gap-2 rounded-2xl border border-outline-variant bg-surface-container-lowest"
                  >
                    <Text className="font-label-lg text-sm font-semibold text-on-surface">
                      Set New Password Now
                    </Text>
                    <ArrowRight size={16} color="#171717" strokeWidth={2.2} />
                  </Pressable>

                  {/* Resend Timer Button */}
                  <Pressable
                    onPress={handleResend}
                    disabled={cooldownSeconds > 0 || isLoading}
                    className="h-10 items-center justify-center"
                  >
                    {cooldownSeconds > 0 ? (
                      <Text className="font-label-sm text-xs font-medium text-on-surface-variant">
                        Resend email in <Text className="font-bold text-primary">{cooldownSeconds}s</Text>
                      </Text>
                    ) : (
                      <View className="flex-row items-center gap-1.5">
                        <RotateCcw size={14} color="#15803d" strokeWidth={2.2} />
                        <Text className="font-label-sm text-xs font-bold text-primary">
                          Resend reset email
                        </Text>
                      </View>
                    )}
                  </Pressable>
                </View>
              </View>
            )}

            {/* Bottom Footer: Back to Login */}
            <View className="items-center pt-6">
              <Pressable
                onPress={() => {
                  triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                  router.push("/auth/login");
                }}
                hitSlop={10}
                className="flex-row items-center py-2"
              >
                <Text className="font-body-sm text-sm text-on-surface-variant">
                  Remember your password?{" "}
                </Text>
                <Text className="font-label-lg text-sm font-bold text-primary">
                  Log in
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
