import { useState } from "react";
import { Pressable, Text, View } from "react-native";

type LanguageCode = "en" | "ar" | "bn";
const LANGUAGES: { code: LanguageCode; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "ar", label: "AR" },
  { code: "bn", label: "BN" },
];

export function LanguageSwitcher() {
  // TODO: wire to the real i18n solution instead of local state
  const [active, setActive] = useState<LanguageCode>("en");

  return (
    <View className="absolute right-4 top-4 z-50 flex-row rounded-full border border-border bg-surface p-1 shadow-card-sm">
      {LANGUAGES.map(({ code, label }) => {
        const isActive = active === code;
        return (
          <Pressable
            key={code}
            onPress={() => setActive(code)}
            hitSlop={4}
            className={`rounded-full px-3 py-1.5 ${
              isActive ? "bg-primary" : ""
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                isActive ? "text-white" : "text-muted"
              }`}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
