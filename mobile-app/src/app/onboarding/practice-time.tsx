import { Clock3, Flame, Info, Sparkles, Target, Zap } from "lucide-react-native";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { OptionCard } from "@/components/onboarding/OptionCard";
import {
  useOnboardingStore,
  type PracticeDuration,
} from "@/features/onboarding/store";

const durations: {
  value: PracticeDuration;
  label: string;
  detail?: string;
  Icon: typeof Clock3;
}[] = [
  { value: "5", label: "5 minutes", detail: "Casual & light", Icon: Zap },
  { value: "10", label: "10 minutes", detail: "Popular choice • Recommended", Icon: Target },
  { value: "15", label: "15 minutes", detail: "Steady progress", Icon: Clock3 },
  { value: "20+", label: "20+ minutes", detail: "Serious learner", Icon: Flame },
];

export default function PracticeTimeScreen() {
  const router = useRouter();
  const selectedDuration = useOnboardingStore(
    (state) => state.practiceDuration,
  );
  const setPracticeDuration = useOnboardingStore(
    (state) => state.setPracticeDuration,
  );

  return (
    <OnboardingLayout
      step={4}
      title="How much time can you practice each day?"
      subtitle="Choose a goal you can comfortably maintain."
      continueLabel="Start Learning"
      onBack={() => router.back()}
      continueDisabled={!selectedDuration}
      onContinue={() => router.push("/onboarding/complete")}
      onSkip={() => router.push("/onboarding/complete")}
    >
      <View
        className="gap-3"
        accessibilityRole="radiogroup"
        accessibilityLabel="Daily practice duration options"
      >
        {durations.map(({ value, label, detail, Icon }) => {
          const isSelected = selectedDuration === value;
          return (
            <OptionCard
              key={value}
              label={label}
              detail={detail}
              selected={isSelected}
              onPress={() => setPracticeDuration(value)}
              leading={
                <View
                  className={`h-10 w-10 items-center justify-center rounded-xl ${
                    isSelected
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container text-on-surface"
                  }`}
                >
                  <Icon
                    className={
                      isSelected ? "text-on-primary" : "text-on-surface-variant"
                    }
                    size={20}
                    strokeWidth={2}
                  />
                </View>
              }
            />
          );
        })}
      </View>

      {/* Helpful Footnote */}
      <View className="mt-5 flex-row items-center gap-1.5">
        <Info className="text-on-surface-variant" size={15} />
        <Text className="font-body-sm text-xs text-on-surface-variant">
          You can change this later in settings.
        </Text>
      </View>
    </OnboardingLayout>
  );
}

