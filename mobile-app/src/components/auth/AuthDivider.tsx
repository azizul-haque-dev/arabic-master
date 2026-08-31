import { Text, View } from "react-native";

type AuthDividerProps = {
  label: string;
};

export function AuthDivider({ label }: AuthDividerProps) {
  return (
    <View className="mb-4 flex-row items-center">
      <View className="h-[1px] flex-1 bg-surface-container-highest" />
      <Text className="px-4 text-[14px] text-on-surface-variant opacity-60">
        {label}
      </Text>
      <View className="h-[1px] flex-1 bg-surface-container-highest" />
    </View>
  );
}
