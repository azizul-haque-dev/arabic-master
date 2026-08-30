import { router } from "expo-router";
import {
  Briefcase,
  Car,
  Home,
  ShoppingCart,
  UtensilsCrossed,
} from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CheckboxOptionCard } from "@/components/onboarding/CheckboxOptionCard";
import { OnboardingProgressHeader } from "@/components/onboarding/OnboardingProgressHeader";
import { BackButton } from "@/components/shared/BackButton";

import {
  useOnboardingStore,
  type SituationCode,
} from "@/stores/onboardingStore";

const SITUATION_OPTIONS: Array<{
  code: SituationCode;
  label: string;
  icon: typeof ShoppingCart;
}> = [
  {
    code: "shopping",
    label: "Shopping",
    icon: ShoppingCart,
  },
  {
    code: "restaurant",
    label: "Restaurant",
    icon: UtensilsCrossed,
  },
  {
    code: "work",
    label: "Work",
    icon: Briefcase,
  },
  {
    code: "transportation",
    label: "Transportation",
    icon: Car,
  },
  {
    code: "daily-life",
    label: "Daily Life",
    icon: Home,
  },
];

export default function SituationsOnboardingScreen() {
  const situations = useOnboardingStore((state) => state.situations);

  const toggleSituation = useOnboardingStore((state) => state.toggleSituation);

  const canContinue = situations.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-6 pt-2">
        <BackButton />
      </View>
      <OnboardingProgressHeader step={3} totalSteps={4} />

      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 24,
        }}
      >
        <View className="mt-6">
          <Text className="text-center text-2xl font-bold text-text-main">
            What do you need Arabic for?
          </Text>

          <Text className="mt-2 text-center text-base text-muted">
            Pick all that apply. We'll prioritize these situations first.
          </Text>
        </View>

        <View className="mt-8 flex-row flex-wrap justify-between">
          {SITUATION_OPTIONS.map((option) => (
            <CheckboxOptionCard
              key={option.code}
              icon={option.icon}
              label={option.label}
              selected={situations.includes(option.code)}
              onPress={() => toggleSituation(option.code)}
            />
          ))}
        </View>
      </ScrollView>

      <View className="px-6 pb-8 pt-4">
        <Pressable
          onPress={() => router.push("/(onboarding)/start")}
          disabled={!canContinue}
          className={`h-14 w-full items-center justify-center rounded-2xl ${
            canContinue ? "bg-primary active:bg-primary-hover" : "bg-slate-200"
          }`}
        >
          <Text
            className={`text-base font-semibold ${
              canContinue ? "text-white" : "text-slate-400"
            }`}
          >
            Continue →
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
