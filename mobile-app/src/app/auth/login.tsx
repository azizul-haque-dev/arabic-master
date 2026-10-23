import * as Haptics from "expo-haptics";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Send,
  X,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
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

export default function LoginScreen() {
  const router = useRouter();

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  // Help Sheet Modal State
  const [showHelpModal, setShowHelpModal] = useState(false);

  const triggerHaptic = (
    style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light,
  ) => {
    try {
      Haptics.impactAsync(style);
    } catch {
      // Safe fallback for environments where haptics are unsupported
    }
  };

  const handleLogin = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setErrorMessage(null);

    // Validation
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }
    if (!trimmedEmail.includes("@") || !trimmedEmail.includes(".")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    // Simulate authentication
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        "Sign-in preview",
        "Authentication is not connected in this UI demo. Continue to the sample Home screen?",
        [
          {
            text: "Open sample Home",
            onPress: () => router.replace("/home"),
          },
        ],
      );
    }, 1100);
  };

  const handleSocialAuth = (provider: "Google" | "Apple") => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        `${provider} sign-in preview`,
        `${provider} sign-in and progress sync are not connected in this UI demo. Continue to the sample Home screen?`,
        [
          {
            text: "Open sample Home",
            onPress: () => router.replace("/home"),
          },
        ],
      );
    }, 900);
  };

  const handleOpenForgotModal = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/auth/forgot-password",
      params: email.trim() ? { email: email.trim() } : undefined,
    });
  };

  const handleSendResetLink = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    const trimmed = forgotEmail.trim();
    if (!trimmed || !trimmed.includes("@") || !trimmed.includes(".")) {
      setForgotError("Please enter a valid email address.");
      return;
    }
    setForgotError(null);
    setForgotLoading(true);
    setTimeout(() => {
      setForgotLoading(false);
      setForgotSubmitted(true);
    }, 900);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <AuthPageHeader
          mode="login"
          onBack={() => {
            triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          onHelp={() => {
            triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
            setShowHelpModal(true);
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
          <View className="flex-1 justify-between px-margin pb-6 pt-2">
            {/* Main Content Area */}
            <View>
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

              {/* Form Input Fields */}
              <View className="mt-6 gap-4">
                {/* Email Address Field */}
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
                      size={20}
                      color={focusedField === "email" ? "#15803d" : "#737373"}
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
                        setFocusedField("email");
                      }}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Enter your email"
                      placeholderTextColor="#737373"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="email"
                      textContentType="emailAddress"
                      returnKeyType="next"
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

                {/* Password Field */}
                <View>
                  <View className="mb-1.5 flex-row items-center justify-between">
                    <Text className="font-label-md text-xs font-semibold text-on-surface">
                      Password
                    </Text>
                    <Pressable
                      onPress={handleOpenForgotModal}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel="Forgot password"
                    >
                      <Text className="font-label-sm text-xs font-bold text-primary">
                        Forgot password?
                      </Text>
                    </Pressable>
                  </View>
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
                      size={20}
                      color={
                        focusedField === "password" ? "#15803d" : "#737373"
                      }
                      strokeWidth={2}
                    />
                    <TextInput
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      onFocus={() => {
                        triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                        setFocusedField("password");
                      }}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Enter your password"
                      placeholderTextColor="#737373"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      textContentType="password"
                      returnKeyType="go"
                      onSubmitEditing={handleLogin}
                      className="ml-3 flex-1 font-body-md text-[15px] text-on-surface"
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
                        <EyeOff size={19} color="#737373" strokeWidth={2} />
                      ) : (
                        <Eye size={19} color="#737373" strokeWidth={2} />
                      )}
                    </Pressable>
                  </View>
                </View>

                {/* Primary CTA Button: Log In */}
                <Pressable
                  onPress={handleLogin}
                  disabled={isLoading}
                  accessibilityRole="button"
                  accessibilityLabel="Log In"
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
                  className="mt-1 h-[56px] w-full flex-row items-center justify-center rounded-2xl bg-primary active:bg-primary-strong"
                >
                  {isLoading ? (
                    <View className="flex-row items-center gap-2">
                      <ActivityIndicator color="#ffffff" size="small" />
                      <Text className="font-label-lg text-base font-bold text-white">
                        Signing in...
                      </Text>
                    </View>
                  ) : (
                    <View className="flex-row items-center gap-2">
                      <Text className="font-label-lg text-base font-bold text-white tracking-wide">
                        Log In
                      </Text>
                      <ArrowRight color="#ffffff" size={18} strokeWidth={2.6} />
                    </View>
                  )}
                </Pressable>
              </View>

              {/* Social Login Divider */}
              <View className="my-6 flex-row items-center">
                <View className="flex-1 h-px bg-outline-variant" />
                <Text className="px-3 font-label-sm text-xs font-normal text-on-surface-variant">
                  or continue with
                </Text>
                <View className="flex-1 h-px bg-outline-variant" />
              </View>

              {/* Social Login Action Buttons */}
              <View className="gap-3">
                {/* Google Sign In */}
                <Pressable
                  onPress={() => handleSocialAuth("Google")}
                  disabled={isLoading}
                  accessibilityRole="button"
                  accessibilityLabel="Continue with Google"
                  style={({ pressed }) => [
                    {
                      opacity: pressed ? 0.85 : 1,
                      transform: [{ scale: pressed ? 0.99 : 1 }],
                    },
                  ]}
                  className="h-[52px] w-full flex-row items-center justify-center gap-3 rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-xs"
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
                    Continue with Google
                  </Text>
                </Pressable>

                {/* Apple Sign In (iOS) */}
                {Platform.OS === "ios" ? (
                  <Pressable
                    onPress={() => handleSocialAuth("Apple")}
                    disabled={isLoading}
                    accessibilityRole="button"
                    accessibilityLabel="Continue with Apple"
                    style={({ pressed }) => [
                      {
                        opacity: pressed ? 0.85 : 1,
                        transform: [{ scale: pressed ? 0.99 : 1 }],
                      },
                    ]}
                    className="h-[52px] w-full flex-row items-center justify-center gap-2.5 rounded-2xl bg-black shadow-xs"
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
                      Continue with Apple
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            </View>

            {/* Bottom Navigation Footer */}
            <View className="items-center gap-3 pt-6">
              {/* Create Account Row */}
              <View className="flex-row items-center">
                <Text className="font-body-sm text-sm text-on-surface-variant">
                  Don't have an account?{" "}
                </Text>
                <Pressable
                  onPress={() => {
                    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                    router.push("/auth/register");
                  }}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Create account"
                >
                  <Text className="font-label-lg text-sm font-bold text-primary">
                    Create account
                  </Text>
                </Pressable>
              </View>

              {/* Continue as Guest */}
              <Pressable
                onPress={() => {
                  triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                  router.replace("/home");
                }}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Continue as guest"
                className="flex-row items-center gap-1 rounded-full py-1.5 px-3 active:bg-surface-container-low"
              >
                <Text className="font-label-sm text-xs font-semibold text-on-surface-variant">
                  Continue as guest
                </Text>
                <ChevronRight size={14} color="#737373" strokeWidth={2} />
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Forgot Password Modal (In-App Experience inspired by reset-success mock) */}
      <Modal
        visible={showForgotModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowForgotModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1 justify-end bg-black/50"
        >
          <Pressable
            className="flex-1"
            onPress={() => setShowForgotModal(false)}
          />
          <View className="rounded-t-[32px] border-t border-outline-variant bg-surface p-margin pb-10 shadow-xl">
            {/* Grab handle */}
            <View className="mb-4 h-1.5 w-12 self-center rounded-full bg-outline-variant" />

            {!forgotSubmitted ? (
              <View>
                <View className="flex-row items-center justify-between pb-2">
                  <Text className="font-headline-sm text-xl font-bold text-on-surface">
                    Reset password preview
                  </Text>
                  <Pressable
                    onPress={() => setShowForgotModal(false)}
                    hitSlop={8}
                    className="h-8 w-8 items-center justify-center rounded-full bg-surface-container-low"
                  >
                    <X size={18} color="#171717" />
                  </Pressable>
                </View>
                <Text className="mt-1 font-body-sm text-sm text-on-surface-variant leading-relaxed">
                  This UI demo does not send reset emails. Enter an address to
                  preview the flow.
                </Text>

                {forgotError ? (
                  <View className="mt-3 flex-row items-center gap-2 rounded-xl bg-error-container p-3">
                    <AlertCircle size={16} color="#ba1a1a" />
                    <Text className="font-body-sm text-xs font-semibold text-on-error-container">
                      {forgotError}
                    </Text>
                  </View>
                ) : null}

                <View className="mt-4">
                  <Text className="mb-1.5 font-label-md text-xs font-semibold text-on-surface">
                    Email address
                  </Text>
                  <View className="h-[52px] flex-row items-center rounded-2xl border border-outline-variant bg-surface-container-low px-4">
                    <Mail size={18} color="#737373" />
                    <TextInput
                      value={forgotEmail}
                      onChangeText={(t) => {
                        setForgotEmail(t);
                        if (forgotError) setForgotError(null);
                      }}
                      placeholder="your@email.com"
                      placeholderTextColor="#737373"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      className="ml-3 flex-1 font-body-md text-sm text-on-surface"
                    />
                  </View>
                </View>

                <Pressable
                  onPress={handleSendResetLink}
                  disabled={forgotLoading}
                  style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
                  className="mt-5 h-[52px] w-full flex-row items-center justify-center gap-2 rounded-2xl bg-primary shadow-sm"
                >
                  {forgotLoading ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <>
                      <Send size={18} color="#ffffff" />
                      <Text className="font-label-lg text-base font-bold text-white">
                        Preview reset flow
                      </Text>
                    </>
                  )}
                </Pressable>
              </View>
            ) : (
              <View className="items-center py-4">
                <View className="h-16 w-16 items-center justify-center rounded-full bg-success-container">
                  <CheckCircle2 size={36} color="#15803d" strokeWidth={2.4} />
                </View>
                <Text className="mt-4 font-headline-sm text-xl font-bold text-on-surface">
                  Reset flow preview
                </Text>
                <Text className="mt-2 text-center font-body-sm text-sm text-on-surface-variant max-w-[280px] leading-relaxed">
                  No reset email was sent to{" "}
                  <Text className="font-semibold text-on-surface">
                    {forgotEmail}
                  </Text>
                  . Reset submission is not connected in this UI demo.
                </Text>

                <Pressable
                  onPress={() => setShowForgotModal(false)}
                  className="mt-6 h-[50px] w-full items-center justify-center rounded-2xl bg-primary"
                >
                  <Text className="font-label-lg text-sm font-bold text-white">
                    Back to Login
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Help Modal */}
      <Modal
        visible={showHelpModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowHelpModal(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/50 px-margin">
          <View className="w-full max-w-sm rounded-3xl bg-surface p-6 shadow-2xl">
            <View className="flex-row items-center justify-between pb-3 border-b border-outline-variant">
              <Text className="font-headline-sm text-lg font-bold text-on-surface">
                Need Help Logging In?
              </Text>
              <Pressable
                onPress={() => setShowHelpModal(false)}
                hitSlop={8}
                className="h-8 w-8 items-center justify-center rounded-full bg-surface-container-low"
              >
                <X size={18} color="#171717" />
              </Pressable>
            </View>

            <View className="mt-4 gap-3.5">
              <View className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-3.5">
                <Text className="font-label-lg text-sm font-bold text-on-surface">
                  Forgot your password?
                </Text>
                <Text className="mt-1 font-body-sm text-xs text-on-surface-variant leading-relaxed">
                  Use the Forgot password option above to preview the reset
                  flow. No email is sent in this UI demo.
                </Text>
              </View>

              <View className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-3.5">
                <Text className="font-label-lg text-sm font-bold text-on-surface">
                  Signed up with Google or Apple?
                </Text>
                <Text className="mt-1 font-body-sm text-xs text-on-surface-variant leading-relaxed">
                  Google and Apple sign-in are not connected in this UI demo.
                </Text>
              </View>

              <View className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-3.5">
                <Text className="font-label-lg text-sm font-bold text-on-surface">
                  Still having issues?
                </Text>
                <Text className="mt-1 font-body-sm text-xs text-on-surface-variant leading-relaxed">
                  Contact our support team anytime at support@arabicmaster.app
                  for assistance.
                </Text>
              </View>
            </View>

            <Pressable
              onPress={() => setShowHelpModal(false)}
              className="mt-5 h-[48px] w-full items-center justify-center rounded-2xl bg-surface-container-high"
            >
              <Text className="font-label-lg text-sm font-bold text-on-surface">
                Close
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
