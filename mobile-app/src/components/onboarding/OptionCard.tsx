import { Check } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

type OptionCardProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  mode?: "radio" | "checkbox";
  detail?: string;
  leading?: ReactNode;
  layout?: "row" | "tile";
};

export function OptionCard({
  label,
  selected,
  onPress,
  mode = "radio",
  detail,
  leading,
  layout = "row",
}: OptionCardProps) {
  const isTile = layout === "tile";

  // Indicator circle on the trailing edge (row) or top-right (tile)
  const indicator = selected ? (
    <View
      className="h-6 w-6 items-center justify-center rounded-full bg-primary"
      accessible={false}
    >
      <Check className="text-on-primary" size={14} strokeWidth={3} />
    </View>
  ) : (
    <View
      className={`rounded-full border-2 border-outline-variant ${
        isTile ? "h-5 w-5 border" : "h-6 w-6"
      }`}
      accessible={false}
    />
  );

  if (isTile) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole={mode}
        accessibilityLabel={label}
        accessibilityState={{ checked: selected }}
        className={`h-28 justify-between rounded-xl p-3.5 border active:opacity-90 ${
          selected
            ? "border-2 border-primary bg-primary-subtle"
            : "border-outline-variant bg-surface-container-lowest"
        }`}
      >
        <View className="flex-row items-start justify-between">
          <View>{leading}</View>
          {indicator}
        </View>
        <Text
          numberOfLines={2}
          className={`font-label-lg text-label-lg font-semibold leading-tight ${
            selected ? "text-primary-strong" : "text-on-surface"
          }`}
        >
          {label}
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={mode}
      accessibilityLabel={detail ? `${label}, ${detail}` : label}
      accessibilityState={{ checked: selected }}
      className={`min-h-14 flex-row items-center justify-between rounded-xl px-4 py-3.5 border active:opacity-90 ${
        selected
          ? "border-2 border-primary bg-primary-subtle"
          : "border-outline-variant bg-surface-container-lowest"
      }`}
    >
      <View className="min-w-0 flex-1 flex-row items-center gap-3.5">
        {leading ? <View>{leading}</View> : null}
        <View className="min-w-0 flex-1">
          <Text
            className={`font-body-md text-base font-semibold leading-snug ${
              selected ? "text-primary-strong" : "text-on-surface"
            }`}
          >
            {label}
          </Text>
          {detail ? (
            <Text className="mt-0.5 font-body-sm text-xs font-normal text-on-surface-variant">
              {detail}
            </Text>
          ) : null}
        </View>
      </View>
      <View className="ml-3 shrink-0">{indicator}</View>
    </Pressable>
  );
}

