import * as Haptics from "expo-haptics";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  X,
} from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BrandMark } from "@/components/onboarding/BrandMark";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();

  // State
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<
    "password" | "confirm" | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Password Validation Rules
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  // Strength score: 0 to 4
  const strengthScore = [
    hasMinLength,
    hasNumber,
    hasUppercase,
    password.length >= 10 && /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const getStrengthLabel = () => {
    if (!password) return { label: "", color: "bg-outline-variant" };
    if (strengthScore <= 1) return { label: "Weak", color: "bg-red-500" };
    if (strengthScore === 2) return { label: "Fair", color: "bg-amber-500" };
    if (strengthScore === 3) return { label: "Good", color: "bg-emerald-500" };
    return { label: "Strong", color: "bg-primary" };
  };

  const triggerHaptic = (
    style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light,
  ) => {
    try {
      Haptics.impactAsync(style);
    } catch {
      // Safe fallback
    }
  };

  const handleResetPassword = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setErrorMessage(null);

    if (!hasMinLength) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }
    if (!hasNumber) {
      setErrorMessage("Password must include at least one number.");
      return;
    }
    if (!hasUppercase) {
      setErrorMessage("Password must include at least one uppercase letter.");
      return;
    }
    if (!passwordsMatch) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
    }, 1000);
  };

  const strength = getStrengthLabel();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Top Minimal Navigation Bar */}
        <View className="h-14 flex-row items-center justify-between px-margin">
          {!isSuccess ? (
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
          ) : (
            <View className="h-10 w-10" />
          )}

          <BrandMark variant="logo" size={36} />

          <View className="h-10 w-10" />
        </View>

        {!isSuccess ? (
          // ==================== STATE 1: Enter New Password ====================
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <View className="flex-1 justify-between px-margin pb-6 pt-2">
              <View>
                {/* Hero Icon & Title */}
                <View className="items-center pb-2 pt-2">
                  <View className="h-16 w-16 items-center justify-center rounded-2xl bg-primary-subtle border border-primary/20 shadow-xs">
                    <ShieldCheck size={32} color="#15803d" strokeWidth={2.2} />
                  </View>
                  <Text className="mt-4 text-center font-headline-md text-[26px] font-extrabold tracking-tight text-on-surface">
                    Create new password
                  </Text>
                  <Text className="mt-2 text-center font-body-sm text-[14px] text-on-surface-variant max-w-[290px] leading-relaxed">
                    This UI demo previews the reset flow. Password changes are
                    not connected.
                  </Text>
                  {params.email ? (
                    <View className="mt-3 rounded-full bg-surface-container-low px-3 py-1 border border-outline-variant">
                      <Text className="font-label-sm text-xs font-semibold text-on-surface-variant">
                        For: {params.email}
                      </Text>
                    </View>
                  ) : null}
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

                {/* Form Fields */}
                <View className="mt-6 gap-4">
                  {/* New Password Field */}
                  <View>
                    <Text className="mb-1.5 font-label-md text-xs font-semibold text-on-surface">
                      New password
                    </Text>
                    <View
                      style={{
                        shadowColor:
                          focusedField === "password" ? "#15803d" : "#000000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity:
                          focusedField === "password" ? 0.08 : 0.02,
                        shadowRadius: 6,
                        elevation: focusedField === "password" ? 3 : 1,
                      }}
                      className={`h-[56px] flex-row items-center rounded-2xl border px-4 ${
                        focusedField === "password"
                          ? "border-2 border-primary bg-white"
                          : "border-outline-variant bg-surface-container-low"
                      }`}
                    >
                      <Lock
                        size={20}
                        color={
                          focusedField === "password" ? "#15803d" : "#737373"
                        }
                        strokeWidth={2}
                      />
                      <TextInput
                        value={password}
                        onChangeText={(t) => {
                          setPassword(t);
                          if (errorMessage) setErrorMessage(null);
                        }}
                        onFocus={() => {
                          triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                          setFocusedField("password");
                        }}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Enter new password"
                        placeholderTextColor="#737373"
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        textContentType="newPassword"
                        returnKeyType="next"
                        className="ml-3 flex-1 font-body-md text-[15px] text-on-surface"
                      />
                      <Pressable
                        onPress={() => {
                          triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                          setShowPassword(!showPassword);
                        }}
                        hitSlop={10}
                        accessibilityLabel={
                          showPassword ? "Hide password" : "Show password"
                        }
                        className="p-1.5"
                      >
                        {showPassword ? (
                          <EyeOff size={19} color="#737373" strokeWidth={2} />
                        ) : (
                          <Eye size={19} color="#737373" strokeWidth={2} />
                        )}
                      </Pressable>
                    </View>

                    {/* Password Strength Bar */}
                    {password.length > 0 ? (
                      <View className="mt-2.5">
                        <View className="flex-row items-center justify-between mb-1">
                          <Text className="font-label-sm text-[11px] font-medium text-on-surface-variant">
                            Password strength:{" "}
                            <Text className="font-bold text-on-surface">
                              {strength.label}
                            </Text>
                          </Text>
                        </View>
                        <View className="h-1.5 w-full flex-row gap-1.5 overflow-hidden rounded-full bg-surface-container-high">
                          <View
                            className={`flex-1 rounded-full ${
                              strengthScore >= 1
                                ? strength.color
                                : "bg-transparent"
                            }`}
                          />
                          <View
                            className={`flex-1 rounded-full ${
                              strengthScore >= 2
                                ? strength.color
                                : "bg-transparent"
                            }`}
                          />
                          <View
                            className={`flex-1 rounded-full ${
                              strengthScore >= 3
                                ? strength.color
                                : "bg-transparent"
                            }`}
                          />
                          <View
                            className={`flex-1 rounded-full ${
                              strengthScore >= 4
                                ? strength.color
                                : "bg-transparent"
                            }`}
                          />
                        </View>
                      </View>
                    ) : null}

                    {/* Requirement Checks */}
                    <View className="mt-3 gap-1.5">
                      <View className="flex-row items-center gap-2">
                        <View
                          className={`h-4 w-4 items-center justify-center rounded-full ${
                            hasMinLength ? "bg-primary" : "bg-outline-variant"
                          }`}
                        >
                          {hasMinLength ? (
                            <Check size={10} color="#ffffff" strokeWidth={3} />
                          ) : null}
                        </View>
                        <Text
                          className={`font-body-sm text-xs ${
                            hasMinLength
                              ? "font-semibold text-on-surface"
                              : "text-on-surface-variant"
                          }`}
                        >
                          At least 8 characters
                        </Text>
                      </View>

                      <View className="flex-row items-center gap-2">
                        <View
                          className={`h-4 w-4 items-center justify-center rounded-full ${
                            hasNumber ? "bg-primary" : "bg-outline-variant"
                          }`}
                        >
                          {hasNumber ? (
                            <Check size={10} color="#ffffff" strokeWidth={3} />
                          ) : null}
                        </View>
                        <Text
                          className={`font-body-sm text-xs ${
                            hasNumber
                              ? "font-semibold text-on-surface"
                              : "text-on-surface-variant"
                          }`}
                        >
                          Includes at least 1 number
                        </Text>
                      </View>

                      <View className="flex-row items-center gap-2">
                        <View
                          className={`h-4 w-4 items-center justify-center rounded-full ${
                            hasUppercase ? "bg-primary" : "bg-outline-variant"
                          }`}
                        >
                          {hasUppercase ? (
                            <Check size={10} color="#ffffff" strokeWidth={3} />
                          ) : null}
                        </View>
                        <Text
                          className={`font-body-sm text-xs ${
                            hasUppercase
                              ? "font-semibold text-on-surface"
                              : "text-on-surface-variant"
                          }`}
                        >
                          Includes at least 1 uppercase letter
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Confirm Password Field */}
                  <View className="mt-2">
                    <View className="flex-row items-center justify-between mb-1.5">
                      <Text className="font-label-md text-xs font-semibold text-on-surface">
                        Confirm new password
                      </Text>
                      {passwordsMatch ? (
                        <View className="flex-row items-center gap-1">
                          <CheckCircle2
                            size={13}
                            color="#15803d"
                            strokeWidth={2.4}
                          />
                          <Text className="font-label-sm text-xs font-bold text-primary">
                            Passwords match
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <View
                      style={{
                        shadowColor:
                          focusedField === "confirm" ? "#15803d" : "#000000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: focusedField === "confirm" ? 0.08 : 0.02,
                        shadowRadius: 6,
                        elevation: focusedField === "confirm" ? 3 : 1,
                      }}
                      className={`h-[56px] flex-row items-center rounded-2xl border px-4 ${
                        focusedField === "confirm"
                          ? "border-2 border-primary bg-white"
                          : "border-outline-variant bg-surface-container-low"
                      }`}
                    >
                      <Lock
                        size={20}
                        color={
                          focusedField === "confirm" ? "#15803d" : "#737373"
                        }
                        strokeWidth={2}
                      />
                      <TextInput
                        value={confirmPassword}
                        onChangeText={(t) => {
                          setConfirmPassword(t);
                          if (errorMessage) setErrorMessage(null);
                        }}
                        onFocus={() => {
                          triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                          setFocusedField("confirm");
                        }}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Re-enter new password"
                        placeholderTextColor="#737373"
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                        textContentType="newPassword"
                        returnKeyType="done"
                        onSubmitEditing={handleResetPassword}
                        className="ml-3 flex-1 font-body-md text-[15px] text-on-surface"
                      />
                      <Pressable
                        onPress={() => {
                          triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                          setShowConfirmPassword(!showConfirmPassword);
                        }}
                        hitSlop={10}
                        accessibilityLabel={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        className="p-1.5"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={19} color="#737373" strokeWidth={2} />
                        ) : (
                          <Eye size={19} color="#737373" strokeWidth={2} />
                        )}
                      </Pressable>
                    </View>
                  </View>
                </View>

                {/* Primary CTA */}
                <Pressable
                  onPress={handleResetPassword}
                  disabled={isLoading || !hasMinLength || !passwordsMatch}
                  accessibilityRole="button"
                  accessibilityLabel="Preview password reset"
                  accessibilityState={{ busy: isLoading }}
                  style={({ pressed }) => [
                    {
                      shadowColor: "#15803d",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: hasMinLength && passwordsMatch ? 0.22 : 0,
                      shadowRadius: 10,
                      elevation: hasMinLength && passwordsMatch ? 4 : 0,
                      opacity:
                        !hasMinLength || !passwordsMatch
                          ? 0.5
                          : pressed
                            ? 0.92
                            : 1,
                      transform: [
                        {
                          scale:
                            hasMinLength && passwordsMatch && pressed
                              ? 0.985
                              : 1,
                        },
                      ],
                    },
                  ]}
                  className="mt-8 h-[56px] w-full flex-row items-center justify-center rounded-2xl bg-primary"
                >
                  {isLoading ? (
                    <View className="flex-row items-center gap-2">
                      <ActivityIndicator color="#ffffff" size="small" />
                      <Text className="font-label-lg text-base font-bold text-white">
                        Preparing preview...
                      </Text>
                    </View>
                  ) : (
                    <View className="flex-row items-center gap-2">
                      <Text className="font-label-lg text-base font-bold text-white tracking-wide">
                        Preview password reset
                      </Text>
                      <ArrowRight color="#ffffff" size={18} strokeWidth={2.6} />
                    </View>
                  )}
                </Pressable>
              </View>

              {/* Bottom Cancel Link */}
              <View className="items-center pt-6">
                <Pressable
                  onPress={() => {
                    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                    router.push("/auth/login");
                  }}
                  hitSlop={10}
                  className="py-2"
                >
                  <Text className="font-label-md text-sm font-semibold text-on-surface-variant">
                    Cancel and return to login
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        ) : (
          // ==================== STATE 2: Success Screen (from reset-success.screen.html) ====================
          <View className="flex-1 justify-between px-margin pb-6 pt-10">
            {/* Centered Success Body */}
            <View className="flex-1 items-center justify-center">
              {/* Outer soft glowing concentric circles matching reference HTML */}
              <View className="relative items-center justify-center mb-8">
                {/* Outer Soft Ring */}
                <View className="h-32 w-32 items-center justify-center rounded-full bg-emerald-50">
                  {/* Middle Ring */}
                  <View className="h-24 w-24 items-center justify-center rounded-full bg-emerald-100">
                    {/* Core Emerald Circle with Checkmark */}
                    <View
                      style={{
                        shadowColor: "#10b981",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.25,
                        shadowRadius: 10,
                        elevation: 6,
                      }}
                      className="h-16 w-16 items-center justify-center rounded-full bg-primary"
                    >
                      <Check size={32} color="#ffffff" strokeWidth={3.5} />
                    </View>
                  </View>
                </View>
              </View>

              {/* Success Heading */}
              <Text className="text-center font-headline-md text-[23px] font-bold tracking-tight text-on-surface mb-3">
                Password reset preview
              </Text>

              {/* Informative Subtext */}
              <Text className="text-center font-body-sm text-[14px] text-on-surface-variant leading-relaxed max-w-[270px]">
                No account password was changed.{"\n"}
                Reset submission is not connected in this UI demo.
              </Text>
            </View>

            {/* Bottom Primary Action Button */}
            <View className="w-full">
              <Pressable
                onPress={() => {
                  triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
                  router.replace("/auth/login");
                }}
                accessibilityRole="button"
                accessibilityLabel="Back to Login"
                style={({ pressed }) => [
                  {
                    shadowColor: "#15803d",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    elevation: 4,
                    opacity: pressed ? 0.92 : 1,
                    transform: [{ scale: pressed ? 0.985 : 1 }],
                  },
                ]}
                className="h-[54px] w-full items-center justify-center rounded-2xl bg-primary"
              >
                <Text className="font-label-lg text-base font-semibold text-white">
                  Back to Login
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
