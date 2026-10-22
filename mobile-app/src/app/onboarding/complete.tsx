import * as Haptics from "expo-haptics";
import {
  ArrowRight,
  Award,
  Check,
  CheckCircle2,
  Clock3,
  Globe,
  GraduationCap,
  Languages,
  MessageCircle,
  ShieldCheck,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BrandMark } from "@/components/onboarding/BrandMark";
import {
  useOnboardingStore,
  type PracticeDuration,
} from "@/features/onboarding/store";

function formatDuration(duration: PracticeDuration | null) {
  if (!duration) return "10 min / day";
  if (duration === "20+") return "20+ min / day";
  return `${duration} min / day`;
}

function getGoalSummary(goals: string[]) {
  if (goals.length === 0) return "Everyday conversation";
  if (goals.length === 1) return goals[0];
  return `${goals[0]} +${goals.length - 1} more`;
}

export default function CompleteScreen() {
  const router = useRouter();
  const practiceDuration = useOnboardingStore(
    (state) => state.practiceDuration,
  );
  const goals = useOnboardingStore((state) => state.goals);
  const language = useOnboardingStore((state) => state.language);
  const country = useOnboardingStore((state) => state.country);

  const handleCreateAccount = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Graceful fallback
    }
    router.push("/auth/register");
  };

  const handleContinueAsGuest = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Graceful fallback
    }
    Alert.alert(
      "Continue as Guest",
      "You are entering guest mode. Your streak and progress can be safely backed up anytime in your profile settings.",
      [
        {
          text: "Let's Go!",
          onPress: () => router.replace("/"),
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="flex-1 px-margin pb-6 pt-3">
          {/* Header Brand */}
          <View className="items-center">
            <BrandMark variant="logo" size={42} />
          </View>

          {/* Celebratory Hero & Milestone Announcement */}
          <View className="items-center pt-4">
            {/* Multi-layered Celebration Aura */}
            <View
              className="relative h-32 w-32 items-center justify-center"
              accessible={false}
              importantForAccessibility="no-hide-descendants"
            >
              {/* Outer Radiant Mint Halo */}
              <View
                style={{
                  shadowColor: "#15803d",
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.16,
                  shadowRadius: 16,
                  elevation: 4,
                }}
                className="h-28 w-28 items-center justify-center rounded-full border border-primary/20 bg-primary-subtle"
              >
                {/* Center Solid Checkmark Badge */}
                <View
                  style={{
                    shadowColor: "#14532d",
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.25,
                    shadowRadius: 6,
                    elevation: 5,
                  }}
                  className="h-16 w-16 items-center justify-center rounded-full bg-primary"
                >
                  <Check color="#ffffff" size={32} strokeWidth={3.5} />
                </View>
              </View>
            </View>

            {/* Cultural Micro-Chip */}
            <View className="mt-1 flex-row items-center rounded-full border border-secondary/30 bg-secondary-subtle px-3 py-0.5">
              <Text className="font-label-sm text-[11px] font-bold text-on-secondary-subtle">
                مَبْرُوك • Plan Ready!
              </Text>
            </View>

            {/* Primary Headline & Affirmation */}
            <Text className="mt-2.5 text-center font-headline-lg-mobile text-[26px] font-extrabold tracking-tight text-on-surface leading-tight">
              You’re all set!
            </Text>
            <Text className="mt-1 text-center font-body-sm text-[14px] font-medium text-on-surface-variant max-w-[280px] leading-relaxed">
              We’ve crafted a personalized Arabic curriculum tailored to your daily goals.
            </Text>
          </View>

          {/* Personalized Curriculum Roadmap Card */}
          <View
            style={{
              shadowColor: "#14532d",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
            className="mt-5 rounded-2xl border border-primary/20 bg-primary-subtle p-4"
          >
            {/* Card Header Label */}
            <View className="mb-3 flex-row items-center justify-between border-b border-primary/10 pb-2.5">
              <View className="flex-row items-center gap-1.5">
                <Target size={15} color="#15803d" strokeWidth={2.4} />
                <Text className="font-label-sm text-xs font-bold uppercase tracking-wider text-primary-strong">
                  Your Learning Blueprint
                </Text>
              </View>
              <View className="rounded-full bg-white px-2 py-0.5 border border-primary/15">
                <Text className="text-[10px] font-bold text-primary">
                  Beginner Path
                </Text>
              </View>
            </View>

            {/* 4-Pillar Grid Details */}
            <View className="gap-3">
              {/* Row 1: Daily Goal & Target Focus */}
              <View className="flex-row gap-3">
                {/* Tile 1: Daily Pace */}
                <View className="flex-1 rounded-xl bg-white p-3 border border-outline-variant/60">
                  <View className="flex-row items-center gap-1.5">
                    <Clock3 size={15} color="#15803d" strokeWidth={2.2} />
                    <Text className="font-label-sm text-[11px] font-semibold text-on-surface-variant">
                      Daily Goal
                    </Text>
                  </View>
                  <Text className="mt-1 font-label-lg text-sm font-bold text-on-surface">
                    {formatDuration(practiceDuration)}
                  </Text>
                </View>

                {/* Tile 2: Primary Focus */}
                <View className="flex-1 rounded-xl bg-white p-3 border border-outline-variant/60">
                  <View className="flex-row items-center gap-1.5">
                    <MessageCircle size={15} color="#15803d" strokeWidth={2.2} />
                    <Text className="font-label-sm text-[11px] font-semibold text-on-surface-variant">
                      Focus Area
                    </Text>
                  </View>
                  <Text
                    numberOfLines={1}
                    className="mt-1 font-label-lg text-sm font-bold text-on-surface"
                  >
                    {getGoalSummary(goals)}
                  </Text>
                </View>
              </View>

              {/* Row 2: Starting Level & Language Medium */}
              <View className="flex-row gap-3">
                {/* Tile 3: Starting Point */}
                <View className="flex-1 rounded-xl bg-white p-3 border border-outline-variant/60">
                  <View className="flex-row items-center gap-1.5">
                    <GraduationCap size={15} color="#15803d" strokeWidth={2.2} />
                    <Text className="font-label-sm text-[11px] font-semibold text-on-surface-variant">
                      Starting Level
                    </Text>
                  </View>
                  <Text className="mt-1 font-label-lg text-sm font-bold text-on-surface">
                    Level 1 • Basics
                  </Text>
                </View>

                {/* Tile 4: Instruction Medium */}
                <View className="flex-1 rounded-xl bg-white p-3 border border-outline-variant/60">
                  <View className="flex-row items-center gap-1.5">
                    <Languages size={15} color="#15803d" strokeWidth={2.2} />
                    <Text className="font-label-sm text-[11px] font-semibold text-on-surface-variant">
                      Medium
                    </Text>
                  </View>
                  <Text className="mt-1 font-label-lg text-sm font-bold text-on-surface">
                    {language === "bn" ? "বাংলা ব্যাখ্যা" : "English Medium"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Motivational Projection Banner */}
            <View className="mt-3.5 flex-row items-center gap-2 rounded-xl bg-[#e3f7ed] px-3 py-2 border border-primary/10">
              <TrendingUp size={16} color="#15803d" strokeWidth={2.2} />
              <Text className="flex-1 font-body-sm text-[11.5px] font-medium text-primary-strong leading-snug">
                Consistent practice will unlock 150+ spoken phrases in your first 30 days.
              </Text>
            </View>
          </View>

          {/* Account Value Section: Save Your Progress */}
          <View className="mt-6 rounded-2xl border border-outline-variant bg-surface-container-lowest p-4">
            <View className="flex-row items-center gap-2.5">
              <View className="h-9 w-9 items-center justify-center rounded-xl bg-primary-subtle border border-primary/20">
                <ShieldCheck size={20} color="#15803d" strokeWidth={2.2} />
              </View>
              <View className="flex-1">
                <Text className="font-headline-sm text-sm font-bold text-on-surface">
                  Save your learning journey
                </Text>
                <Text className="font-body-sm text-xs text-on-surface-variant">
                  Create a free profile to preserve your progress
                </Text>
              </View>
            </View>

            {/* 4 Feature Checklist Items */}
            <View className="mt-3.5 gap-2.5">
              {[
                { title: "Preserve your daily streak & XP", icon: Zap },
                { title: "Sync smoothly across phone and tablet", icon: Globe },
                { title: "Bookmark important vocabulary & audios", icon: CheckCircle2 },
                { title: "Earn completion badges & certificates", icon: Award },
              ].map(({ title, icon: IconItem }) => (
                <View key={title} className="flex-row items-center gap-2.5">
                  <View className="h-5 w-5 items-center justify-center rounded-full bg-primary">
                    <Check color="#ffffff" size={12} strokeWidth={3} />
                  </View>
                  <Text className="flex-1 font-body-sm text-xs font-medium text-on-surface">
                    {title}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View className="border-t border-outline-variant bg-background px-margin py-4">
        {/* Primary Action Button: Create an Account */}
        <Pressable
          onPress={handleCreateAccount}
          accessibilityRole="button"
          accessibilityLabel="Create an account and save progress"
          accessibilityHint="Registers your account to save streaks and access lessons"
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
          className="min-h-[54px] w-full flex-row items-center justify-center gap-2 rounded-2xl bg-primary py-3.5"
        >
          <Text className="font-label-lg text-base font-bold text-white tracking-wide">
            Create an account
          </Text>
          <ArrowRight color="#ffffff" size={19} strokeWidth={2.6} />
        </Pressable>

        {/* Secondary Action Button: Continue as Guest */}
        <Pressable
          onPress={handleContinueAsGuest}
          accessibilityRole="button"
          accessibilityLabel="Continue as guest without creating an account"
          accessibilityHint="Starts lessons immediately in guest mode"
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.99 : 1 }],
            },
          ]}
          className="mt-2.5 min-h-[48px] w-full flex-row items-center justify-center rounded-2xl border border-outline-variant bg-surface-container-low py-3"
        >
          <Text className="font-label-lg text-sm font-semibold text-on-surface">
            Continue as guest
          </Text>
        </Pressable>

        {/* Reassurance Subtitle */}
        <Text className="pt-2 text-center font-body-sm text-[11px] text-on-surface-variant">
          You can create an account anytime from settings • Free forever
        </Text>
      </View>
    </SafeAreaView>
  );
}


