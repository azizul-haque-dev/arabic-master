import { Image } from "expo-image";
import { Text, View } from "react-native";

type AuthHeaderProps = {
  title: string;
  subtitle: string;
  logoSource: number | { uri: string };
};

export function AuthHeader({ title, subtitle, logoSource }: AuthHeaderProps) {
  return (
    <View className="mb-6 mt-8 items-center px-2">
      <Image
        source={logoSource}
        className="mb-3 h-16 w-16 rounded-lg"
        contentFit="cover"
      />
      <Text className="mb-2 text-center font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
        {title}
      </Text>
      <Text className="text-center font-body-lg text-body-lg text-on-surface-variant opacity-80">
        {subtitle}
      </Text>
    </View>
  );
}
