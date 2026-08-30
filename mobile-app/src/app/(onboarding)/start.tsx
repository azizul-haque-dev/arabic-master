import { AxiosError } from "axios";
import { Rocket } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/constants/colors";

import { BackButton } from "@/components/shared/BackButton";

import { OnboardingProgressHeader } from "@/components/onboarding/OnboardingProgressHeader";

import { useCompleteOnboarding } from "@/hooks/useCompleteOnboarding";

import { useLanguageStore } from "@/stores/languageStore";

import { useOnboardingStore } from "@/stores/onboardingStore";

function getErrorMessage(error: unknown): string | null {
  if (!error) {
    return null;
  }

  if (error instanceof AxiosError && !error.response) {
    return "Couldn't connect. Check your internet and try again.";
  }

  return "Something went wrong. Please try again.";
}

export default function StartOnboardingScreen() {
  const language = useLanguageStore((state) => state.language);

  const level = useOnboardingStore((state) => state.level);

  const situations = useOnboardingStore((state) => state.situations);

  const { mutate: complete, isPending, error } = useCompleteOnboarding();

  const errorMessage = getErrorMessage(error);

  const handleStart = () => {
    // Runtime safety check
    if (!level) {
      return;
    }

    complete({
      language,
      level,
      situations,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-6 pt-2">
        <BackButton />
      </View>
      <OnboardingProgressHeader step={4} totalSteps={4} />

      <View className="flex-1 items-center justify-center px-8">
        <View className="h-20 w-20 items-center justify-center rounded-3xl bg-primary-light">
          <Rocket size={32} color={colors.primary} />
        </View>

        <Text className="mt-8 text-center text-3xl font-bold leading-tight text-text-main">
          Learn Arabic for real life.
        </Text>

        <Text className="mt-3 text-center text-base text-muted">
          Start with the situations you actually face.
        </Text>

        {errorMessage ? (
          <Text
            className="mt-4 text-center text-sm text-red-500"
            accessibilityLiveRegion="polite"
          >
            {errorMessage}
          </Text>
        ) : null}
      </View>

      <View className="px-6 pb-8 pt-4">
        <Pressable
          onPress={handleStart}
          disabled={isPending}
          className={`h-14 w-full items-center justify-center rounded-2xl ${
            isPending ? "bg-slate-200" : "bg-primary active:bg-primary-hover"
          }`}
        >
          <Text
            className={`text-base font-semibold ${
              isPending ? "text-slate-400" : "text-white"
            }`}
          >
            {isPending ? "Starting..." : "Start Learning →"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
