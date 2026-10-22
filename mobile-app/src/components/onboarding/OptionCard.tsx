import { Check } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

type OptionCardProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  mode?: "radio" | "checkbox";
  detail?: string;
  tag?: string;
  routeLabel?: string;
  leading?: ReactNode;
  layout?: "row" | "tile";
  size?: "default" | "large";
};

export function OptionCard({
  label,
  selected,
  onPress,
  mode = "radio",
  detail,
  tag,
  routeLabel,
  leading,
  layout = "row",
  size = "default",
}: OptionCardProps) {
  const isTile = layout === "tile";
  const isLarge = size === "large";

  // Indicator circle on the trailing edge (row) or top-right (tile)
  const indicator = selected ? (
    <View
      className={`${
        isLarge ? "h-7 w-7" : "h-6 w-6"
      } items-center justify-center rounded-full bg-primary`}
      accessible={false}
    >
      <Check
        color="#ffffff"
        size={isLarge ? 16 : 14}
        strokeWidth={3}
      />
    </View>
  ) : (
    <View
      className={`rounded-full border-2 border-outline-variant ${
        isTile ? "h-5 w-5 border" : isLarge ? "h-7 w-7" : "h-6 w-6"
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
      className={`${
        isLarge
          ? "rounded-2xl p-5 border-2"
          : "min-h-14 rounded-xl px-4 py-3.5 border"
      } active:opacity-90 ${
        selected
          ? "border-primary bg-primary-subtle"
          : "border-outline-variant bg-surface-container-lowest"
      }`}
    >
      {/* Top Header Chips for Large Cards */}
      {isLarge && (tag || routeLabel) ? (
        <View className="mb-3.5 flex-row items-center justify-between">
          {routeLabel ? (
            <View
              className={`rounded-full px-2.5 py-0.5 ${
                selected
                  ? "bg-primary"
                  : "bg-surface-container"
              }`}
            >
              <Text
                className={`text-[11px] font-bold tracking-wider uppercase ${
                  selected ? "text-white" : "text-on-surface-variant"
                }`}
              >
                {routeLabel}
              </Text>
            </View>
          ) : (
            <View />
          )}
          {tag ? (
            <View
              className={`rounded-full px-2.5 py-0.5 ${
                selected
                  ? "bg-primary-strong"
                  : "bg-secondary-subtle"
              }`}
            >
              <Text
                className={`text-[11px] font-bold ${
                  selected ? "text-white" : "text-on-secondary-subtle"
                }`}
              >
                {tag}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      <View
        className={`min-w-0 flex-1 flex-row items-center justify-between ${
          isLarge ? "gap-4" : "gap-3.5"
        }`}
      >
        <View className="min-w-0 flex-1 flex-row items-center gap-3.5">
          {leading ? <View className="shrink-0">{leading}</View> : null}
          <View className="min-w-0 flex-1">
            <Text
              className={`${
                isLarge
                  ? "text-[17px] font-bold leading-snug"
                  : "font-body-md text-base font-semibold leading-snug"
              } ${selected ? "text-primary-strong" : "text-on-surface"}`}
            >
              {label}
            </Text>
            {detail ? (
              <Text
                className={`${
                  isLarge ? "mt-1.5 text-sm font-normal" : "mt-0.5 text-xs font-normal"
                } font-body-sm text-on-surface-variant leading-relaxed`}
              >
                {detail}
              </Text>
            ) : null}
          </View>
        </View>
        <View className="ml-3 shrink-0">{indicator}</View>
      </View>
    </Pressable>
  );
}

