import { AlertCircle } from "lucide-react-native";
import { Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <Animated.View entering={FadeInDown.duration(200)}>
      <View
        className="mt-4 flex-row items-center gap-2 rounded-xl bg-danger-50 px-3 py-2.5"
        accessibilityLiveRegion="polite"
      >
        <AlertCircle size={16} color="#E5484D" />
        <Text className="flex-1 text-sm text-danger">{message}</Text>
      </View>
    </Animated.View>
  );
}
