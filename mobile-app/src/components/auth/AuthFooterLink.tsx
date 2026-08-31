import { Link, type Href } from "expo-router";
import { Text, View } from "react-native";

type AuthFooterLinkProps = {
  question: string;
  actionLabel: string;
  href: Href;
};

export function AuthFooterLink({
  question,
  actionLabel,
  href,
}: AuthFooterLinkProps) {
  return (
    <View className="mt-4 flex-row justify-center">
      <Text className="text-on-surface-variant">{question} </Text>
      <Link href={href} className="font-label-md text-label-md">
        <Text className="text-primary underline">{actionLabel}</Text>
      </Link>
    </View>
  );
}
