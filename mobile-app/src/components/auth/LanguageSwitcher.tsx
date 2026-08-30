import { useState } from "react";
import { Pressable, Text, View } from "react-native";

type LanguageCode = "en" | "ar" | "bn";
const LANGUAGES: LanguageCode[] = ["en", "ar", "bn"];

export function LanguageSwitcher() {
  // TODO: wire to the real i18n solution instead of local state
  const [active, setActive] = useState<LanguageCode>("en");

  return (
    <View className="absolute right-4 top-4 z-50 flex-row gap-2">
      {LANGUAGES.map((lang) => (
        <Pressable
          key={lang}
          onPress={() => setActive(lang)}
          className={`rounded-lg border border-border bg-surface px-2.5 py-1 ${
            active === lang ? "border-brand-primary" : ""
          }`}
        >
          <Text
            className={`text-xs font-semibold ${
              active === lang ? "text-brand-primary" : "text-muted"
            }`}
          >
            {lang.toUpperCase()}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
