import { Image } from "expo-image";
import { BookOpen } from "lucide-react-native";
import { Text, View } from "react-native";

type BrandMarkProps = {
  variant?: "logo" | "emblem" | "compact";
  size?: number;
};

export function BrandMark({ variant = "logo", size }: BrandMarkProps) {
  if (variant === "logo") {
    return (
      <View className="items-center justify-center py-1" accessible={false}>
        <Image
          source={require("@/assets/images/myImages/logo.png")}
          style={{ width: size ? size * 3 : 150, height: size || 50 }}
          contentFit="contain"
          accessibilityLabel="Arabic Master logo"
        />
      </View>
    );
  }

  if (variant === "emblem") {
    const boxSize = size || 80;
    return (
      <View className="items-center justify-center" accessible={false}>
        <View
          style={{ width: boxSize, height: boxSize }}
          className="relative items-center justify-center rounded-2xl bg-primary shadow-sm"
        >
          <Text className="font-arabic-display text-2xl font-bold tracking-wider text-on-primary">
            ا ب ت
          </Text>
          {/* Subtle speech tail */}
          <View
            style={{ width: 12, height: 12 }}
            className="absolute -bottom-1.5 left-7 rotate-45 rounded-xs bg-primary"
          />
        </View>
        <View className="relative -mt-2 flex-row items-center justify-center">
          <BookOpen className="text-primary-strong" size={38} strokeWidth={2.2} />
        </View>
        <Text className="mt-space-xs font-headline-sm text-headline-sm font-bold text-primary-strong">
          Arabic Master
        </Text>
      </View>
    );
  }

  // Compact variant for navigation headers
  return (
    <View className="flex-row items-center gap-space-xs" accessible={false}>
      <View className="h-7 w-7 items-center justify-center rounded-md bg-primary">
        <Text className="text-xs font-bold text-on-primary">ا ب ت</Text>
      </View>
      <Text className="font-label-lg text-label-lg font-bold text-primary-strong">
        Arabic Master
      </Text>
    </View>
  );
}

