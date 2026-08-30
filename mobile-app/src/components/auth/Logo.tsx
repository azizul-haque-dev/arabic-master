import { Image, View } from "react-native";

export function Logo() {
  return (
    <View className="items-center">
      <View className="h-32 bg-background w-48 items-center justify-center overflow-hidden rounded-2xl">
        <Image
          source={require("../../../assets/images/myImages/logo.png")}
          className="h-full w-full rounded-2xl"
          resizeMode="cover"
        />
      </View>
      {/* <Text className="mt-3 text-sm font-semibold tracking-wide text-text-main">
        LEARN - PRACTICE - SPEAK
      </Text> */}
    </View>
  );
}
