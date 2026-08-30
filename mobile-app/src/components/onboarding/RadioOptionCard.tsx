import { Check } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

interface RadioOptionCardProps {
  icon: ReactNode;

  title: string;

  titleFontClassName?: string;

  subtitle?: string;

  selected: boolean;

  onPress: () => void;
}

export function RadioOptionCard({
  icon,
  title,
  titleFontClassName = "font-sans",
  subtitle,
  selected,
  onPress,
}: RadioOptionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{
        selected,
      }}
      className={`min-h-[76px] flex-row items-center rounded-2xl border-2 p-5 ${
        selected
          ? "border-primary bg-primary-light/40"
          : "border-border bg-surface"
      }`}
    >
      {icon}

      <View className="ml-4 flex-1">
        <Text
          className={`text-lg font-bold text-text-main ${titleFontClassName}`}
        >
          {title}
        </Text>

        {subtitle ? (
          <Text className="mt-0.5 text-sm text-muted">{subtitle}</Text>
        ) : null}
      </View>

      <View
        className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
          selected ? "border-primary bg-primary" : "border-border bg-surface"
        }`}
      >
        {selected ? <Check size={14} color="#ffffff" strokeWidth={3} /> : null}
      </View>
    </Pressable>
  );
}
