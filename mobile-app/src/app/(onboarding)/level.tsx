import { router } from "expo-router";
import { BookOpen, Sprout, TrendingUp } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { OnboardingProgressHeader } from "@/components/onboarding/OnboardingProgressHeader";
import { RadioOptionCard } from "@/components/onboarding/RadioOptionCard";
import { BackButton } from "@/components/shared/BackButton";
import { colors } from "@/constants/colors";

import { useOnboardingStore, type LevelCode } from "@/stores/onboardingStore";
import { SafeAreaView } from "react-native-safe-area-context";

const LEVEL_OPTIONS: Array<{
  code: LevelCode;
  title: string;
  icon: typeof Sprout;
}> = [
  {
    code: "beginner",
    title: "Beginner",
    icon: Sprout,
  },
  {
    code: "some",
    title: "Some Arabic",
    icon: BookOpen,
  },
  {
    code: "intermediate",
    title: "Intermediate",
    icon: TrendingUp,
  },
];

export default function LevelOnboardingScreen() {
  const level = useOnboardingStore((state) => state.level);

  const setLevel = useOnboardingStore((state) => state.setLevel);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-6 pt-2">
        <BackButton />
      </View>
      <OnboardingProgressHeader step={2} totalSteps={4} />

      <View className="flex-1 px-6">
        <View className="mt-6">
          <Text className="text-center text-2xl font-bold text-text-main">
            How much Arabic do you know?
          </Text>

          <Text className="mt-2 text-center text-base text-muted">
            This helps us start you at the right level.
          </Text>
        </View>

        <View className="mt-8 gap-4">
          {LEVEL_OPTIONS.map((option) => {
            const Icon = option.icon;

            return (
              <RadioOptionCard
                key={option.code}
                icon={
                  <View className="h-11 w-11 items-center justify-center rounded-xl bg-primary-light">
                    <Icon size={20} color={colors.primary} />
                  </View>
                }
                title={option.title}
                selected={level === option.code}
                onPress={() => setLevel(option.code)}
              />
            );
          })}
        </View>
      </View>

      <View className="px-6 pb-8 pt-4">
        <Pressable
          onPress={() => router.push("/(onboarding)/situations")}
          disabled={!level}
          className={`h-14 w-full items-center justify-center rounded-2xl ${
            level ? "bg-primary active:bg-primary-hover" : "bg-slate-200"
          }`}
        >
          <Text
            className={`text-base font-semibold ${
              level ? "text-white" : "text-slate-400"
            }`}
          >
            Continue →
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
