import * as Haptics from "expo-haptics";
import { BookOpen, ChevronRight, User } from "lucide-react-native";
import { useRouter } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect } from "react";

import { BrandMark } from "@/components/onboarding/BrandMark";
import { useOnboardingStore } from "@/features/onboarding/store";
import { useAuth } from "@/features/auth/auth-context";

export default function WelcomeScreen() {
  const router = useRouter();
  const reset = useOnboardingStore((state) => state.reset);
  const { user, isLoading, restoreError } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/home");
    }
  }, [isLoading, router, user]);

  if (isLoading) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center bg-background"
        edges={["top", "bottom"]}
      >
        <ActivityIndicator size="large" color="#15803d" />
        <Text className="mt-3 font-body-sm text-sm text-on-surface-variant">
          Restoring your session...
        </Text>
      </SafeAreaView>
    );
  }

  const handleStartOnboarding = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Graceful fallback for web/non-supported environments
    }
    reset();
    router.push("/onboarding/language");
  };

  const handleSignIn = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Graceful fallback
    }
    router.push("/auth/login");
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="flex-1 justify-between px-margin pb-6 pt-3">
          {/* Top Brand Identity Header */}
          <View className="items-center">
            <BrandMark variant="logo" size={42} />
            <View className="mt-2.5 rounded-md bg-primary-subtle px-3 py-1">
              <Text className="font-label-sm text-xs font-medium text-primary-strong">
                Practical spoken Arabic
              </Text>
            </View>
          </View>

          <View className="items-center gap-5 py-5">
            <View className="items-center">
              <Text className="text-center font-headline-lg-mobile text-[30px] font-semibold tracking-tight text-on-surface leading-[38px]">
                Learn practical Arabic{"\n"}through everyday dialogue
              </Text>
              <Text className="mt-2 max-w-[300px] text-center font-body-sm text-[14px] font-normal text-on-surface-variant leading-relaxed">
                Study useful words, sentences, and conversations with Bangla
                and English meanings.
              </Text>
            </View>

            <View className="w-full max-w-[340px] rounded-2xl border border-outline-variant bg-white p-5">
              <Text className="font-label-sm text-xs font-medium text-on-surface-variant">
                Everyday greeting
              </Text>
              <Text
                className="mt-3 text-center font-arabic-display text-[36px] leading-[54px] text-primary-strong"
                style={{ writingDirection: "rtl" }}
              >
                مَرْحَبًا
              </Text>
              <View className="mt-3 h-1 w-10 self-center rounded-full bg-primary" />
              <Text className="mt-3 text-center font-body-md text-sm text-on-surface">
                Marhaban · Hello
              </Text>
            </View>
          </View>

          {/* Action Area: Clear Primary & Secondary Hierarchy */}
          <View className="gap-3 pt-2">
            {/* Primary Hero CTA: New Learner Onboarding Flow */}
            <Pressable
              onPress={handleStartOnboarding}
              accessibilityRole="button"
              accessibilityLabel="I'm new here, start learning without creating an account"
              accessibilityHint="Starts the personalized onboarding flow"
              style={({ pressed }) => [{ opacity: pressed ? 0.86 : 1 }]}
              className="rounded-xl bg-primary p-4"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1 flex-row items-center gap-3.5">
                  {/* Leading Icon Pill */}
                  <View className="h-12 w-12 items-center justify-center rounded-xl bg-primary-strong">
                    <BookOpen color="#ffffff" size={22} strokeWidth={2.3} />
                  </View>

                  {/* Main Copy */}
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="font-label-lg text-[17px] font-bold text-white leading-tight">
                        I’m new here
                      </Text>
                      {/* Highlight Badge */}
                      <View className="rounded-full bg-secondary px-2 py-0.5">
                        <Text className="text-xs font-semibold text-on-secondary">
                          Free
                        </Text>
                      </View>
                    </View>
                    <Text className="mt-0.5 font-body-sm text-[12.5px] font-medium text-white/85 leading-snug">
                      Start learning without creating an account
                    </Text>
                  </View>
                </View>

                {/* Trailing Forward Indicator */}
                <View className="h-8 w-8 items-center justify-center rounded-full bg-white/15">
                  <ChevronRight color="#ffffff" size={20} strokeWidth={2.8} />
                </View>
              </View>
            </Pressable>

            {/* Secondary CTA: Existing Account Sign In */}
            <Pressable
              onPress={handleSignIn}
              accessibilityRole="button"
              accessibilityLabel="I already have an account, sign in"
              accessibilityHint="Opens a sign-in UI preview; authentication and saved progress are not connected."
              style={({ pressed }) => [{ opacity: pressed ? 0.86 : 1 }]}
              className="flex-row items-center justify-between rounded-xl border border-outline-variant bg-surface-container-lowest p-4"
            >
              <View className="flex-1 flex-row items-center gap-3.5">
                <View className="h-11 w-11 items-center justify-center rounded-xl bg-surface-container">
                  <User color="#171717" size={20} strokeWidth={2.2} />
                </View>
                <View className="flex-1">
                  <Text className="font-label-lg text-base font-bold text-on-surface leading-tight">
                    I already have an account
                  </Text>
                  <Text className="mt-0.5 font-body-sm text-xs font-normal text-on-surface-variant leading-snug">
                    Preview sign-in; progress is not saved
                  </Text>
                </View>
              </View>
              <ChevronRight color="#737373" size={19} strokeWidth={2.4} />
            </Pressable>

            {/* Reassurance Footnote */}
            <Text className="text-center font-body-sm text-xs text-on-surface-variant">
              No subscription or credit card required to start
            </Text>
            {restoreError ? (
              <Text
                accessibilityRole="alert"
                className="text-center font-body-sm text-xs text-error"
              >
                {restoreError}
              </Text>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
