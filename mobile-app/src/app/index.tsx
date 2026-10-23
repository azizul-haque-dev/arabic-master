import * as Haptics from "expo-haptics";
import { BookOpen, ChevronRight, Globe, User, Zap } from "lucide-react-native";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BrandMark } from "@/components/onboarding/BrandMark";
import { useOnboardingStore } from "@/features/onboarding/store";

export default function WelcomeScreen() {
  const router = useRouter();
  const reset = useOnboardingStore((state) => state.reset);

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
            <View className="mt-2.5 rounded-full border border-primary/20 bg-primary-subtle px-3 py-1">
              <Text className="font-label-sm text-[11px] font-bold uppercase tracking-wider text-primary-strong">
                Everyday Spoken Arabic
              </Text>
            </View>
          </View>

          {/* Hero Section: Typography & Conversational Visual */}
          <View className="items-center py-2">
            {/* Value Proposition Headline */}
            <Text className="text-center font-headline-lg-mobile text-[30px] font-extrabold tracking-tight text-on-surface leading-[38px]">
              Master Arabic{"\n"}Through Real Dialogues
            </Text>
            <Text className="mt-2 text-center font-body-sm text-[14.5px] font-normal text-on-surface-variant max-w-[290px] leading-relaxed">
              Learn practical, conversational Arabic step-by-step with zero
              overwhelm.
            </Text>

            {/* Conversational Art Centerpiece */}
            <View
              className="relative mt-6 h-56 w-56 items-center justify-center"
              accessible={false}
              importantForAccessibility="no-hide-descendants"
            >
              {/* Outer Radiant Mint Halo */}
              <View
                style={{
                  shadowColor: "#15803d",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.12,
                  shadowRadius: 20,
                  elevation: 4,
                }}
                className="h-48 w-48 items-center justify-center rounded-full border border-primary/15 bg-primary-subtle"
              >
                {/* Secondary Ambient Ring */}
                <View className="h-36 w-36 items-center justify-center rounded-full bg-white/70">
                  {/* Primary Arabic Speech Bubble */}
                  <View
                    style={{
                      shadowColor: "#14532d",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.2,
                      shadowRadius: 8,
                      elevation: 5,
                    }}
                    className="relative -ml-3 -mt-2 h-[72px] w-[106px] items-center justify-center rounded-2xl bg-primary"
                  >
                    <Text className="font-arabic-display text-2xl font-bold tracking-wider text-white">
                      ا ب ت
                    </Text>
                    {/* Speech Bubble Pointer */}
                    <View
                      style={{ width: 14, height: 14 }}
                      className="absolute -bottom-2 left-6 rotate-45 rounded-xs bg-primary"
                    />
                  </View>
                </View>
              </View>

              {/* Overlapping Conversation Pill with 3 Dialog Dots */}
              <View
                style={{
                  shadowColor: "#000000",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.08,
                  shadowRadius: 6,
                  elevation: 4,
                }}
                className="absolute bottom-5 right-5 flex-row items-center gap-1.5 rounded-2xl border border-primary/25 bg-[#def5ea] px-3.5 py-2.5"
              >
                <View className="h-2 w-2 rounded-full bg-primary" />
                <View className="h-2 w-2 rounded-full bg-primary opacity-80" />
                <View className="h-2 w-2 rounded-full bg-primary opacity-50" />
              </View>

              {/* Floating Cultural Tag: "Marhaban" */}
              <View
                style={{
                  shadowColor: "#15803d",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 5,
                  elevation: 3,
                }}
                className="absolute -top-1 right-2 flex-row items-center gap-1.5 rounded-full border border-primary/20 bg-white px-2.5 py-1"
              >
                <Text className="text-xs font-bold text-primary">
                  مَرْحَبًا
                </Text>
                <Text className="text-[10px] font-semibold text-on-surface-variant">
                  Ahlan
                </Text>
              </View>
            </View>

            {/* Micro Feature Proof Points */}
            <View className="mt-5 flex-row items-center justify-center gap-3">
              <View className="flex-row items-center gap-1.5 rounded-lg bg-surface-container-low px-2.5 py-1.5">
                <Zap size={13} color="#f59e0b" strokeWidth={2.5} />
                <Text className="font-label-sm text-xs font-semibold text-on-surface">
                  5 Min Lessons
                </Text>
              </View>
              <View className="flex-row items-center gap-1.5 rounded-lg bg-surface-container-low px-2.5 py-1.5">
                <Globe size={13} color="#15803d" strokeWidth={2.5} />
                <Text className="font-label-sm text-xs font-semibold text-on-surface">
                  বাংলা & English
                </Text>
              </View>
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
              style={({ pressed }) => [
                {
                  shadowColor: "#15803d",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 10,
                  elevation: 4,
                  opacity: pressed ? 0.92 : 1,
                  transform: [{ scale: pressed ? 0.985 : 1 }],
                },
              ]}
              className="relative overflow-hidden rounded-2xl bg-primary p-4"
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
                        <Text className="text-[10px] font-extrabold uppercase tracking-wider text-on-secondary">
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
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.85 : 1,
                  transform: [{ scale: pressed ? 0.99 : 1 }],
                },
              ]}
              className="flex-row items-center justify-between rounded-2xl border border-outline-variant bg-surface-container-lowest p-3.5"
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
                    Preview sign-in; saved progress is not connected.
                  </Text>
                </View>
              </View>
              <ChevronRight color="#737373" size={19} strokeWidth={2.4} />
            </Pressable>

            {/* Reassurance Footnote */}
            <Text className="text-center font-body-sm text-[11.5px] text-on-surface-variant">
              No subscription or credit card required to start
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
