import { Text, View } from "react-native";

export function Logo() {
  return (
    <View className="items-center">
      <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary">
        <Text className="text-lg font-bold text-white">ع</Text>
      </View>
      <Text className="mt-2 text-sm font-semibold text-text-main">
        Arabic Master
      </Text>
    </View>
  );
}
