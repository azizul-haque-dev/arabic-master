import * as Haptics from "expo-haptics";
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

import { AuthPageHeader } from "@/components/auth/AuthPageHeader";

export default function RegisterScreen() {
  const router = useRouter();

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [focusedField, setFocusedField] = useState<
    "name" | "email" | "password" | "confirmPassword" | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const triggerHaptic = (
    style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light,
  ) => {
    try {
      Haptics.impactAsync(style);
    } catch {
      // Safe fallback
    }
  };

  // Password Strength Calculation
  const hasMinLength = password.length >= 6;
  const hasMixedChars =
    password.length >= 8 &&
    (/\d/.test(password) || /[^A-Za-z0-9]/.test(password));
  const hasConfirmMatch =
    confirmPassword.length > 0 && password === confirmPassword;

  const passwordStrengthLevel = !password
    ? 0
    : hasMixedChars
      ? 3
      : hasMinLength
        ? 2
        : 1;

  const handleRegister = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setErrorMessage(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!trimmedEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }
    if (!trimmedEmail.includes("@") || !trimmedEmail.includes(".")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setErrorMessage("Please create a password.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    if (!agreeTerms) {
      setErrorMessage("Please agree to the Terms of Service to continue.");
      return;
    }

    // Simulate registration
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        "Account setup preview",
        `Account creation is not connected in this UI demo. Continue to the sample Home screen?`,
        [
          {
            text: "Open sample Home",
            onPress: () => router.replace("/home"),
          },
        ],
      );
    }, 1200);
  };

  const handleSocialRegister = (provider: "Google" | "Apple") => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        `${provider} sign-up preview`,
        `Account linking and progress backup are not connected in this UI demo. Continue to the sample Home screen?`,
        [
          {
            text: "Open sample Home",
            onPress: () => router.replace("/home"),
          },
        ],
      );
    }, 1000);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <AuthPageHeader
          mode="register"
          onBack={() => router.back()}
          onHelp={() => {
            triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
            Alert.alert(
              "Why Create an Account?",
              "Account creation, saved progress, and cross-device sync are not connected in this UI demo.",
            );
          }}
          onModeChange={(mode) => {
            triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
            router.push(mode === "login" ? "/auth/login" : "/auth/register");
          }}
        />

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="flex-1 justify-between px-margin pb-6 pt-1">
            {/* Main Content Area */}
            <View>
              {/* Error Banner */}
              {errorMessage ? (
                <View className="mt-3 flex-row items-center gap-2.5 rounded-2xl border border-error/20 bg-error-container p-3.5">
                  <AlertCircle size={18} color="#ba1a1a" strokeWidth={2.2} />
                  <Text className="flex-1 font-body-sm text-xs font-semibold text-on-error-container">
                    {errorMessage}
                  </Text>
                </View>
              ) : null}

              {/* Interactive Form Fields */}
              <View className="mt-5 gap-4">
                {/* Full Name Field */}
                <View>
                  <Text className="mb-1.5 font-label-md text-xs font-semibold text-on-surface">
                    Full name
                  </Text>
                  <View
                    style={{
                      shadowColor:
                        focusedField === "name" ? "#15803d" : "#000000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: focusedField === "name" ? 0.08 : 0.02,
                      shadowRadius: 6,
                      elevation: focusedField === "name" ? 3 : 1,
                    }}
                    className={`h-[56px] flex-row items-center rounded-2xl border px-4 ${
                      focusedField === "name"
                        ? "border-primary bg-surface"
                        : "border-outline-variant bg-surface"
                    }`}
                  >
                    <User
                      size={19}
                      color={focusedField === "name" ? "#15803d" : "#737373"}
                      strokeWidth={2.2}
                    />
                    <TextInput
                      value={name}
                      onChangeText={(text) => {
                        setName(text);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      onFocus={() => setFocusedField("name")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="e.g. Tariq Rahman"
                      placeholderTextColor="#737373"
                      autoCapitalize="words"
                      autoCorrect={false}
                      textContentType="name"
                      className="ml-3 flex-1 font-body-md text-sm text-on-surface"
                    />
                  </View>
                </View>

                {/* Email Field */}
                <View>
                  <Text className="mb-1.5 font-label-md text-xs font-semibold text-on-surface">
                    Email address
                  </Text>
                  <View
                    style={{
                      shadowColor:
                        focusedField === "email" ? "#15803d" : "#000000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: focusedField === "email" ? 0.08 : 0.02,
                      shadowRadius: 6,
                      elevation: focusedField === "email" ? 3 : 1,
                    }}
                    className={`h-[56px] flex-row items-center rounded-2xl border px-4 ${
                      focusedField === "email"
                        ? "border-primary bg-surface"
                        : "border-outline-variant bg-surface"
                    }`}
                  >
                    <Mail
                      size={19}
                      color={focusedField === "email" ? "#15803d" : "#737373"}
                      strokeWidth={2.2}
                    />
                    <TextInput
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="your.email@example.com"
                      placeholderTextColor="#737373"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      textContentType="emailAddress"
                      className="ml-3 flex-1 font-body-md text-sm text-on-surface"
                    />
                  </View>
                </View>

                {/* Password Field */}
                <View>
                  <Text className="mb-1.5 font-label-md text-xs font-semibold text-on-surface">
                    Password
                  </Text>
                  <View
                    style={{
                      shadowColor:
                        focusedField === "password" ? "#15803d" : "#000000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: focusedField === "password" ? 0.08 : 0.02,
                      shadowRadius: 6,
                      elevation: focusedField === "password" ? 3 : 1,
                    }}
                    className={`h-[56px] flex-row items-center rounded-2xl border px-4 ${
                      focusedField === "password"
                        ? "border-primary bg-surface"
                        : "border-outline-variant bg-surface"
                    }`}
                  >
                    <Lock
                      size={19}
                      color={
                        focusedField === "password" ? "#15803d" : "#737373"
                      }
                      strokeWidth={2.2}
                    />
                    <TextInput
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="At least 6 characters"
                      placeholderTextColor="#737373"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      textContentType="newPassword"
                      className="ml-3 flex-1 font-body-md text-sm text-on-surface"
                    />
                    <Pressable
                      onPress={() => {
                        triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                        setShowPassword(!showPassword);
                      }}
                      hitSlop={10}
                      accessibilityRole="button"
                      accessibilityLabel={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="p-1.5"
                    >
                      {showPassword ? (
                        <EyeOff size={19} color="#737373" strokeWidth={2.2} />
                      ) : (
                        <Eye size={19} color="#737373" strokeWidth={2.2} />
                      )}
                    </Pressable>
                  </View>
                </View>

                {/* Dynamic 2026 Password Strength Meter */}
                {password.length > 0 ? (
                  <View className="pt-0.5">
                    <View className="flex-row items-center gap-1.5">
                      <View
                        className={`h-1.5 flex-1 rounded-full ${
                          passwordStrengthLevel >= 1
                            ? "bg-error"
                            : "bg-surface-container"
                        }`}
                      />
                      <View
                        className={`h-1.5 flex-1 rounded-full ${
                          passwordStrengthLevel >= 2
                            ? "bg-secondary"
                            : "bg-surface-container"
                        }`}
                      />
                      <View
                        className={`h-1.5 flex-1 rounded-full ${
                          passwordStrengthLevel >= 3
                            ? "bg-primary"
                            : "bg-surface-container"
                        }`}
                      />
                    </View>
                    <Text className="mt-1 font-label-sm text-[10.5px] text-on-surface-variant text-right">
                      {passwordStrengthLevel === 1
                        ? "Too short"
                        : passwordStrengthLevel === 2
                          ? "Good password"
                          : "Strong & secure password ✓"}
                    </Text>
                  </View>
                ) : null}

                {/* Confirm Password Field */}
                <View>
                  <Text className="mb-1.5 font-label-md text-xs font-semibold text-on-surface">
                    Confirm password
                  </Text>
                  <View
                    style={{
                      shadowColor:
                        focusedField === "confirmPassword"
                          ? "#15803d"
                          : "#000000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity:
                        focusedField === "confirmPassword" ? 0.08 : 0.02,
                      shadowRadius: 6,
                      elevation: focusedField === "confirmPassword" ? 3 : 1,
                    }}
                    className={`h-[56px] flex-row items-center rounded-2xl border px-4 ${
                      focusedField === "confirmPassword"
                        ? "border-primary bg-surface"
                        : "border-outline-variant bg-surface"
                    }`}
                  >
                    <ShieldCheck
                      size={19}
                      color={
                        focusedField === "confirmPassword"
                          ? "#15803d"
                          : "#737373"
                      }
                      strokeWidth={2.2}
                    />
                    <TextInput
                      value={confirmPassword}
                      onChangeText={(text) => {
                        setConfirmPassword(text);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      onFocus={() => setFocusedField("confirmPassword")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Repeat your password"
                      placeholderTextColor="#737373"
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      textContentType="newPassword"
                      returnKeyType="done"
                      onSubmitEditing={handleRegister}
                      className="ml-3 flex-1 font-body-md text-sm text-on-surface"
                    />
                    <Pressable
                      onPress={() => {
                        triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                        setShowConfirmPassword(!showConfirmPassword);
                      }}
                      hitSlop={10}
                      accessibilityRole="button"
                      accessibilityLabel={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                      className="p-1.5"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={19} color="#737373" strokeWidth={2.2} />
                      ) : (
                        <Eye size={19} color="#737373" strokeWidth={2.2} />
                      )}
                    </Pressable>
                  </View>
                </View>

                {/* Real-time Dynamic Validation Pills */}
                <View className="flex-row items-center gap-4 pt-0.5">
                  <View className="flex-row items-center gap-1.5">
                    <View
                      className={`h-4 w-4 items-center justify-center rounded-full ${
                        hasMinLength ? "bg-primary" : "bg-surface-container"
                      }`}
                    >
                      <Check
                        size={10}
                        color={hasMinLength ? "#ffffff" : "#737373"}
                        strokeWidth={3}
                      />
                    </View>
                    <Text
                      className={`font-label-sm text-[11px] ${
                        hasMinLength
                          ? "text-primary font-bold"
                          : "text-on-surface-variant"
                      }`}
                    >
                      6+ characters
                    </Text>
                  </View>

                  <View className="flex-row items-center gap-1.5">
                    <View
                      className={`h-4 w-4 items-center justify-center rounded-full ${
                        hasConfirmMatch ? "bg-primary" : "bg-surface-container"
                      }`}
                    >
                      <Check
                        size={10}
                        color={hasConfirmMatch ? "#ffffff" : "#737373"}
                        strokeWidth={3}
                      />
                    </View>
                    <Text
                      className={`font-label-sm text-[11px] ${
                        hasConfirmMatch
                          ? "text-primary font-bold"
                          : "text-on-surface-variant"
                      }`}
                    >
                      Passwords match
                    </Text>
                  </View>
                </View>

                {/* Terms of Service Consent */}
                <Pressable
                  onPress={() => {
                    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                    setAgreeTerms(!agreeTerms);
                  }}
                  className="flex-row items-center gap-2.5 pt-1.5"
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: agreeTerms }}
                  accessibilityLabel="I agree to the Terms of Service and Privacy Policy"
                >
                  <View
                    className={`h-5 w-5 items-center justify-center rounded-md border ${
                      agreeTerms
                        ? "border-primary bg-primary"
                        : "border-outline-variant bg-white"
                    }`}
                  >
                    {agreeTerms ? (
                      <Check size={13} color="#ffffff" strokeWidth={3} />
                    ) : null}
                  </View>
                  <Text className="flex-1 font-body-sm text-xs text-on-surface-variant leading-snug">
                    I agree to the{" "}
                    <Text className="font-semibold text-primary">
                      Terms of Service
                    </Text>{" "}
                    and{" "}
                    <Text className="font-semibold text-primary">
                      Privacy Policy
                    </Text>
                    .
                  </Text>
                </Pressable>

                {/* Primary CTA: Create Account */}
                <Pressable
                  onPress={handleRegister}
                  disabled={isLoading}
                  accessibilityRole="button"
                  accessibilityLabel="Create Account"
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
                  className="mt-2 h-[56px] w-full flex-row items-center justify-center rounded-2xl bg-primary active:bg-primary-strong"
                >
                  {isLoading ? (
                    <View className="flex-row items-center gap-2">
                      <ActivityIndicator color="#ffffff" size="small" />
                      <Text className="font-label-lg text-base font-bold text-white">
                        Creating account...
                      </Text>
                    </View>
                  ) : (
                    <View className="flex-row items-center gap-2">
                      <Text className="font-label-lg text-base font-bold text-white tracking-wide">
                        Create Account
                      </Text>
                      <ArrowRight color="#ffffff" size={18} strokeWidth={2.6} />
                    </View>
                  )}
                </Pressable>
              </View>

              {/* Social Auth Divider */}
              <View className="my-6 flex-row items-center">
                <View className="flex-1 h-px bg-outline-variant" />
                <Text className="px-3 font-label-sm text-xs font-medium text-on-surface-variant">
                  or sign up with
                </Text>
                <View className="flex-1 h-px bg-outline-variant" />
              </View>

              {/* Social Sign Up Actions */}
              <View className="gap-3">
                {/* Google Sign Up */}
                <Pressable
                  onPress={() => handleSocialRegister("Google")}
                  disabled={isLoading}
                  accessibilityRole="button"
                  accessibilityLabel="Sign up with Google"
                  style={({ pressed }) => [
                    {
                      opacity: pressed ? 0.85 : 1,
                      transform: [{ scale: pressed ? 0.985 : 1 }],
                    },
                  ]}
                  className="h-[52px] w-full flex-row items-center justify-center gap-2.5 rounded-2xl border border-outline-variant bg-surface"
                >
                  <Svg width={18} height={18} viewBox="0 0 24 24">
                    <Path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <Path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <Path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      fill="#FBBC05"
                    />
                    <Path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      fill="#EA4335"
                    />
                  </Svg>
                  <Text className="font-label-lg text-sm font-semibold text-on-surface">
                    Google
                  </Text>
                </Pressable>

                {Platform.OS === "ios" ? (
                  <Pressable
                    onPress={() => handleSocialRegister("Apple")}
                    disabled={isLoading}
                    accessibilityRole="button"
                    accessibilityLabel="Sign up with Apple"
                    style={({ pressed }) => [
                      {
                        opacity: pressed ? 0.85 : 1,
                        transform: [{ scale: pressed ? 0.985 : 1 }],
                      },
                    ]}
                    className="h-[52px] w-full flex-row items-center justify-center gap-2.5 rounded-2xl bg-black"
                  >
                    <Svg
                      width={16}
                      height={16}
                      viewBox="0 0 24 24"
                      fill="#ffffff"
                    >
                      <Path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.64-.78 1.08-1.87.96-2.96-.93.04-2.05.62-2.72 1.4-.59.68-1.11 1.79-.97 2.85 1.04.08 2.09-.52 2.73-1.29" />
                    </Svg>
                    <Text className="font-label-lg text-sm font-semibold text-white">
                      Apple
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            </View>

            {/* Bottom Actions Footer */}
            <View className="items-center gap-3 pt-6">
              {/* Frictionless Guest Mode */}
              <Pressable
                onPress={() => {
                  triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                  router.replace("/home");
                }}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Continue as guest"
                className="flex-row items-center gap-1.5 py-1"
              >
                <Text className="font-label-sm text-xs font-semibold text-on-surface-variant">
                  Want to explore first?
                </Text>
                <Text className="font-label-sm text-xs font-bold text-primary">
                  Continue as guest →
                </Text>
              </Pressable>

              <Text className="text-center font-body-sm text-[11px] text-on-surface-variant/80">
                🔒 Secure 256-bit encrypted authentication
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
