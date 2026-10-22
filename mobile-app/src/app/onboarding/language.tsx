import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { BrandMark } from "@/components/onboarding/BrandMark";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { OptionCard } from "@/components/onboarding/OptionCard";
import {
  useOnboardingStore,
  type LearningLanguage,
} from "@/features/onboarding/store";

const languages: {
  id: LearningLanguage;
  label: string;
  detail: string;
  script: string;
}[] = [
  { id: "bn", label: "বাংলা", detail: "Bengali", script: "অ" },
  { id: "en", label: "English", detail: "English", script: "Aa" },
];

export default function LanguageScreen() {
  const router = useRouter();
  const selectedLanguage = useOnboardingStore((state) => state.language);
  const setLanguage = useOnboardingStore((state) => state.setLanguage);

  return (
    <OnboardingLayout
      step={1}
      headerContent={
        <View className="mb-6 items-center">
          <BrandMark variant="logo" size={42} />
          <View className="mt-1 items-center space-y-0.5">
            <Text className="text-center font-body-sm text-xs text-on-surface-variant">
              Practical Arabic for real life.
            </Text>
            <Text className="text-center font-body-sm text-xs text-on-surface-variant">
              Your journey starts here.
            </Text>
          </View>
        </View>
      }
      title="How would you like to learn?"
      subtitle="Choose the language you’re most comfortable with."
      continueDisabled={!selectedLanguage}
      onContinue={() => router.push("/onboarding/country")}
      onSkip={() => router.push("/onboarding/country")}
    >
      <View
        className="gap-3.5"
        accessibilityRole="radiogroup"
        accessibilityLabel="Choose your primary language"
      >
        {languages.map((language) => (
          <OptionCard
            key={language.id}
            label={language.label}
            detail={language.detail}
            selected={selectedLanguage === language.id}
            onPress={() => setLanguage(language.id)}
            leading={
              <View
                className={`h-11 w-11 items-center justify-center rounded-full ${
                  language.id === "bn"
                    ? "bg-primary-subtle text-primary"
                    : "bg-surface-container text-on-surface"
                }`}
              >
                <Text
                  className={`text-lg font-bold ${
                    language.id === "bn"
                      ? "text-primary font-bold"
                      : "text-on-surface font-semibold"
                  }`}
                >
                  {language.script}
                </Text>
              </View>
            }
          />
        ))}
      </View>
    </OnboardingLayout>
  );
}

