import { router } from "expo-router";
import { Languages } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { OnboardingProgressHeader } from "@/components/onboarding/OnboardingProgressHeader";
import { RadioOptionCard } from "@/components/onboarding/RadioOptionCard";
// import { colors } from "@/constants/colors";
import { colors } from "@/constants/colors";
import { useLanguageStore, type LanguageCode } from "@/stores/languageStore";
import { SafeAreaView } from "react-native-safe-area-context";

const LANGUAGE_OPTIONS: Array<{
  code: LanguageCode;
  flag: string;
  title: string;
  titleFontClassName: string;
  subtitle: string;
}> = [
  {
    code: "bn",
    flag: "🇧🇩",
    title: "বাংলা",
    titleFontClassName: "font-bangla",
    subtitle: "Learn Arabic with Bangla explanations",
  },
  {
    code: "en",
    flag: "🇬🇧",
    title: "English",
    titleFontClassName: "font-sans",
    subtitle: "Learn Arabic with English explanations",
  },
];

export default function LanguageOnboardingScreen() {
  const language = useLanguageStore((state) => state.language);

  const setLanguage = useLanguageStore((state) => state.setLanguage);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <OnboardingProgressHeader step={1} totalSteps={4} />

      <View className="flex-1 px-6">
        <View className="mt-8 items-center">
          <View className="h-16 w-16 items-center justify-center rounded-2xl bg-primary-light">
            <Languages size={28} color={colors.primary} />
          </View>

          <Text className="mt-6 text-center text-2xl font-bold text-text-main">
            Choose your language
          </Text>

          <Text className="mt-2 text-center text-base text-muted">
            We'll use this language to guide you while you learn Arabic.
          </Text>
        </View>

        <View className="mt-8 gap-4">
          {LANGUAGE_OPTIONS.map((option) => (
            <RadioOptionCard
              key={option.code}
              icon={<Text className="text-3xl">{option.flag}</Text>}
              title={option.title}
              titleFontClassName={option.titleFontClassName}
              subtitle={option.subtitle}
              selected={language === option.code}
              onPress={() => setLanguage(option.code)}
            />
          ))}
        </View>
      </View>

      <View className="px-6 pb-8 pt-4">
        <Pressable
          onPress={() => router.push("/(onboarding)/level")}
          className="h-14 w-full items-center justify-center rounded-2xl bg-primary active:bg-primary-hover"
        >
          <Text className="text-base font-semibold text-white">Continue →</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
