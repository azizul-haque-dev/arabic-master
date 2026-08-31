import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

type SocialButtonProps = {
  label: string;
  icon: ReactNode;
  onPress: () => void;
  disabled?: boolean;
};

export function SocialButton({
  label,
  icon,
  onPress,
  disabled = false,
}: SocialButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="h-14 w-full rounded-lg border border-surface-container-highest bg-surface active:bg-surface-variant"
      style={({ pressed }) => ({
        opacity: disabled ? 0.5 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      {/* Exact center container */}
      <View
        className="absolute inset-0 flex-row items-center justify-center"
        pointerEvents="none"
      >
        {/* Apple icon */}
        <View className="items-center justify-center">{icon}</View>

        {/* Label */}
        <Text className="ml-2 font-label-md text-base text-on-surface">
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
