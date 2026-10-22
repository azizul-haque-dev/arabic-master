import {
  BriefcaseBusiness,
  Bus,
  Heart,
  Info,
  MessageCircle,
  Plane,
  ShoppingBag,
  Users,
  Utensils,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { OptionCard } from "@/components/onboarding/OptionCard";
import { useOnboardingStore } from "@/features/onboarding/store";

const goals = [
  { label: "Everyday conversation", Icon: MessageCircle },
  { label: "Work", Icon: BriefcaseBusiness },
  { label: "Shopping", Icon: ShoppingBag },
  { label: "Restaurant & food", Icon: Utensils },
  { label: "Transportation", Icon: Bus },
  { label: "Making friends", Icon: Users },
  { label: "Travel", Icon: Plane },
  { label: "Understanding people around me", Icon: Heart },
];

export default function GoalsScreen() {
  const router = useRouter();
  const selectedGoals = useOnboardingStore((state) => state.goals);
  const toggleGoal = useOnboardingStore((state) => state.toggleGoal);
  const rows = Array.from({ length: Math.ceil(goals.length / 2) }, (_, index) =>
    goals.slice(index * 2, index * 2 + 2),
  );

  return (
    <OnboardingLayout
      step={3}
      title="Why do you want to learn Arabic?"
      subtitle="Choose what you want to use Arabic for."
      onBack={() => router.back()}
      continueDisabled={selectedGoals.length === 0}
      onContinue={() => router.push("/onboarding/practice-time")}
      onSkip={() => router.push("/onboarding/practice-time")}
    >
      <View
        className="gap-3"
        accessibilityLabel="Choose one or more learning goals"
      >
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} className="flex-row gap-3">
            {row.map(({ label, Icon }) => {
              const isSelected = selectedGoals.includes(label);
              return (
                <View key={label} className="flex-1">
                  <OptionCard
                    label={label}
                    selected={isSelected}
                    onPress={() => toggleGoal(label)}
                    mode="checkbox"
                    layout="tile"
                    leading={
                      <View
                        className={`h-9 w-9 items-center justify-center rounded-lg ${
                          isSelected ? "bg-primary/10" : "bg-surface-container"
                        }`}
                      >
                        <Icon
                          className={
                            isSelected ? "text-primary" : "text-on-surface-variant"
                          }
                          size={20}
                          strokeWidth={2}
                        />
                      </View>
                    }
                  />
                </View>
              );
            })}
            {row.length === 1 ? <View className="flex-1" /> : null}
          </View>
        ))}
      </View>

      {/* Helper Note */}
      <View className="mt-4 flex-row items-center gap-1.5">
        <Info className="text-on-surface-variant" size={15} />
        <Text className="font-body-sm text-xs text-on-surface-variant">
          You can select multiple goals.
        </Text>
      </View>
    </OnboardingLayout>
  );
}

