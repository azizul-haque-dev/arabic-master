import { DURATION } from "@/lib/motion";
import * as Haptics from "expo-haptics";
import { ActivityIndicator, Pressable, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface SocialButtonProps {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "light" | "dark";
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function SocialButton({
  label,
  icon,
  onPress,
  disabled,
  loading,
  variant = "light",
}: SocialButtonProps) {
  const scale = useSharedValue(1);
  const isInactive = disabled || loading;
  const isDark = variant === "dark";

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (isInactive) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={() =>
        !isInactive &&
        (scale.value = withTiming(0.97, { duration: DURATION.fast }))
      }
      onPressOut={() =>
        (scale.value = withTiming(1, { duration: DURATION.fast }))
      }
      disabled={isInactive}
      style={animatedStyle}
      className={`mt-3 h-12 w-full flex-row items-center justify-center gap-3 rounded-2xl border ${
        isDark
          ? "border-transparent bg-black"
          : "border-border bg-surface shadow-card-sm"
      } disabled:opacity-50`}
    >
      {loading ? (
        <ActivityIndicator color={isDark ? "#fff" : "#166B5F"} />
      ) : (
        icon
      )}
      <Text
        className={`font-semibold ${isDark ? "text-white" : "text-text-main"}`}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}
