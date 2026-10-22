import {
  ArrowRight,
  ChartNoAxesColumnIncreasing,
  Check,
  Clock3,
  MessageCircle,
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
  return `${duration} min / day`;
}

export default function CompleteScreen() {
  const router = useRouter();
  const practiceDuration = useOnboardingStore(
    (state) => state.practiceDuration,
  );
  const goals = useOnboardingStore((state) => state.goals);
  const primaryGoal = goals[0] ?? "Everyday conversation";

  const showAccountNotice = (action: string) => {
    Alert.alert(
      action,
      `${action} will navigate to the main learning dashboard.`,
      [
        {
          text: "OK",
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

          {/* Celebration Hero */}
          <View className="items-center pt-5">
            <View
              className="relative h-28 w-28 items-center justify-center rounded-full bg-primary-subtle"
              accessible={false}
              importantForAccessibility="no-hide-descendants"
            >
              {/* Outer celebratory accents */}
              <View className="absolute -top-1 right-2 h-3 w-3 rounded-full bg-secondary" />
              <View className="absolute bottom-2 left-2 h-2.5 w-2.5 rounded-full bg-secondary opacity-80" />

              {/* Center solid checkmark circle */}
              <View className="h-16 w-16 items-center justify-center rounded-full bg-primary shadow-md">
                <Check color="#ffffff" size={32} strokeWidth={3.2} />
              </View>
            </View>

            <Text className="mt-3.5 text-center font-headline-lg-mobile text-2xl font-extrabold tracking-tight text-on-surface">
              You’re all set!
            </Text>
            <Text className="mt-1 text-center font-body-sm text-sm font-medium text-on-surface-variant">
              Your learning experience is ready.
            </Text>
          </View>

          {/* Summary Stats Card (3 Columns) */}
          <View className="mt-6 flex-row rounded-2xl border border-outline-variant bg-primary-subtle py-3.5">
            {/* Column 1: Daily Goal */}
            <View className="flex-1 items-center px-1">
              <Clock3 className="mb-1 text-primary" size={20} strokeWidth={2.2} />
              <Text className="text-center font-label-lg text-xs font-bold text-on-surface leading-tight">
                {formatDuration(practiceDuration)}
              </Text>
              <Text className="mt-0.5 text-center font-body-sm text-[11px] font-normal text-on-surface-variant">
                Daily goal
              </Text>
            </View>

            {/* Vertical Divider */}
            <View className="w-px bg-outline-variant" />

            {/* Column 2: Level */}
            <View className="flex-1 items-center px-1">
              <ChartNoAxesColumnIncreasing className="mb-1 text-primary" size={20} strokeWidth={2.2} />
              <Text className="text-center font-label-lg text-xs font-bold text-on-surface leading-tight">
                Beginner
              </Text>
              <Text className="mt-0.5 text-center font-body-sm text-[11px] font-normal text-on-surface-variant">
                Your level
              </Text>
            </View>

            {/* Vertical Divider */}
            <View className="w-px bg-outline-variant" />

            {/* Column 3: Focus Topic */}
            <View className="flex-1 items-center px-1">
              <MessageCircle className="mb-1 text-primary" size={20} strokeWidth={2.2} />
              <Text
                className="text-center font-label-lg text-xs font-bold text-on-surface leading-tight"
                numberOfLines={2}
              >
                {primaryGoal}
              </Text>
              <Text className="mt-0.5 text-center font-body-sm text-[11px] font-normal text-on-surface-variant">
                Your focus
              </Text>
            </View>
          </View>

          {/* Save Your Progress Section */}
          <View className="mt-6">
            <Text className="font-headline-sm text-base font-bold text-on-surface">
              Save your progress
            </Text>
            <Text className="mt-0.5 font-body-sm text-xs text-on-surface-variant leading-snug">
              Create an account to keep your learning progress safe.
            </Text>

            <View className="mt-3.5 gap-2.5">
              {[
                "Keep your XP and level",
                "Save lesson progress",
                "Protect your streak",
                "Continue learning across devices",
              ].map((benefit) => (
                <View key={benefit} className="flex-row items-center gap-3">
                  <View className="h-5 w-5 items-center justify-center rounded-full bg-primary text-on-primary">
                    <Check className="text-on-primary" size={13} strokeWidth={3} />
                  </View>
                  <Text className="flex-1 font-body-md text-sm font-medium text-on-surface">
                    {benefit}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View className="gap-2.5 border-t border-outline-variant bg-background px-margin py-4">
        {/* Primary Action Button */}
        <Pressable
          onPress={() => showAccountNotice("Create an account")}
          accessibilityRole="button"
          className="min-h-12 w-full flex-row items-center justify-center gap-2 rounded-xl bg-primary py-3.5 active:opacity-90"
        >
          <Text className="font-label-lg text-base font-bold text-on-primary">
            Create an account
          </Text>
          <ArrowRight className="text-on-primary" size={18} strokeWidth={2.5} />
        </Pressable>

        {/* Secondary Action Button */}
        <Pressable
          onPress={() => showAccountNotice("Continue as guest")}
          accessibilityRole="button"
          className="min-h-12 w-full flex-row items-center justify-center rounded-xl border border-primary bg-transparent py-3 active:opacity-90"
        >
          <Text className="font-label-lg text-sm font-semibold text-primary">
            Continue as guest
          </Text>
        </Pressable>

        {/* Helper Note */}
        <Text className="text-center font-body-sm text-[11px] text-on-surface-variant pt-0.5">
          You can create an account later.
        </Text>
      </View>
    </SafeAreaView>
  );
}

