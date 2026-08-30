import { Text, View } from "react-native";

export function Divider({ label }: { label: string }) {
  return (
    <View className="relative my-8 flex-row items-center">
      <View className="h-px flex-1 bg-border" />
      <Text className="bg-background px-4 text-sm font-medium text-muted">
        {label}
      </Text>
      <View className="h-px flex-1 bg-border" />
    </View>
  );
}
