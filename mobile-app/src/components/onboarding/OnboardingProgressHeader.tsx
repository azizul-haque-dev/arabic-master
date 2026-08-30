import { ProgressBar } from "@/components/ui/ProgressBar";
import { Text, View } from "react-native";

interface OnboardingProgressHeaderProps {
  step: number;
  totalSteps: number;
}

export function OnboardingProgressHeader({
  step,
  totalSteps,
}: OnboardingProgressHeaderProps) {
  const progress = (step / totalSteps) * 100;

  return (
    <View className="px-6 pt-4">
      <Text className="mb-2 text-right text-xs font-medium text-muted">
        {step} of {totalSteps}
      </Text>

      <ProgressBar
        value={progress}
        trackClassName="bg-slate-100"
        fillClassName="bg-primary"
        heightClassName="h-1.5"
      />
    </View>
  );
}
