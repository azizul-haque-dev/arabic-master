import { Languages } from "lucide-react-native";
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
  routeLabel: string;
  tag?: string;
  script: string;
}[] = [
  {
    id: "bn",
    label: "আমি বাংলা থেকে আরবি শিখতে চাই",
    detail: "সহজ বাংলা ব্যাখ্যা, উচ্চারণ ও প্রয়োজনীয় শব্দভাণ্ডার",
    routeLabel: "বাংলা → العربية",
    tag: "★ সবচেয়ে জনপ্রিয়",
    script: "অ",
  },
  {
    id: "en",
    label: "I want to learn English to Arabic",
    detail: "English medium with clear phonetics, grammar & phrases",
    routeLabel: "English → العربية",
    tag: "Global Standard",
    script: "Aa",
  },
];

export default function LanguageScreen() {
  const router = useRouter();
  const selectedLanguage = useOnboardingStore((state) => state.language);
  const setLanguage = useOnboardingStore((state) => state.setLanguage);

  return (
    <OnboardingLayout
      step={1}
      headerContent={
        <View className="items-center">
          <BrandMark variant="logo" size={44} />
          <View className="mt-3 flex-row items-center gap-2 rounded-full bg-surface-container px-3.5 py-1 border border-outline-variant">
            <View className="h-1.5 w-1.5 rounded-full bg-primary" />
            <Text className="font-label-sm text-xs font-semibold text-on-surface-variant tracking-wider uppercase">
              Step 1 of 4 • Language Choice
            </Text>
          </View>
        </View>
      }
      title="Choose the language you are most comfortable with"
      subtitle="যে ভাষায় আপনি সবচেয়ে স্বাচ্ছন্দ্য বোধ করেন তা বেছে নিন"
      continueDisabled={!selectedLanguage}
      onContinue={() => router.push("/onboarding/country")}
      onSkip={() => router.push("/onboarding/country")}
    >
      <View
        className="gap-4"
        accessibilityRole="radiogroup"
        accessibilityLabel="Choose your primary language"
      >
        {languages.map((language) => (
          <OptionCard
            key={language.id}
            size="large"
            label={language.label}
            detail={language.detail}
            routeLabel={language.routeLabel}
            tag={language.tag}
            selected={selectedLanguage === language.id}
            onPress={() => setLanguage(language.id)}
            leading={
              <View
                className={`h-14 w-14 items-center justify-center rounded-2xl border ${
                  selectedLanguage === language.id
                    ? "bg-primary border-primary"
                    : "bg-surface-container border-outline-variant"
                }`}
              >
                <Text
                  className={`text-2xl font-bold ${
                    selectedLanguage === language.id
                      ? "text-white"
                      : "text-on-surface"
                  }`}
                >
                  {language.script}
                </Text>
              </View>
            }
          />
        ))}
      </View>

      {/* Trust & Flexibility Reassurance Note */}
      <View className="mt-6 flex-row items-start gap-3 rounded-2xl border border-outline-variant bg-surface-container-low p-4">
        <View className="mt-0.5 h-8 w-8 items-center justify-center rounded-xl bg-primary-subtle border border-primary/20">
          <Languages size={17} color="#15803d" strokeWidth={2.2} />
        </View>
        <View className="flex-1">
          <Text className="font-semibold text-xs text-on-surface">
            Change anytime in Settings
          </Text>
          <Text className="mt-0.5 text-xs text-on-surface-variant leading-relaxed">
            Don’t worry, you can always switch your learning language later from your profile settings.
          </Text>
        </View>
      </View>
    </OnboardingLayout>
  );
}

