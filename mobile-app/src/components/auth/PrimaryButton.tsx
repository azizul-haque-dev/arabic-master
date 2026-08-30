import { DURATION } from "@/lib/motion";
import * as Haptics from "expo-haptics";
import { ActivityIndicator, Pressable, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface PrimaryButtonProps {
  label: string;
  loadingLabel?: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PrimaryButton({
  label,
  loadingLabel,
  onPress,
  disabled,
  loading,
}: PrimaryButtonProps) {
  const scale = useSharedValue(1);
  const isInactive = disabled || loading;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (isInactive) return;
    scale.value = withTiming(0.97, { duration: DURATION.fast });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: DURATION.fast });
  };

  const handlePress = () => {
    if (isInactive) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isInactive}
      style={animatedStyle}
      className={`h-14 w-full flex-row items-center justify-center gap-2 rounded-2xl ${
        isInactive ? "bg-slate-200" : "bg-primary shadow-brand-md"
      }`}
    >
      {loading && <ActivityIndicator color={isInactive ? "#94a3b8" : "#fff"} />}
      <Text
        className={`text-base font-semibold ${
          isInactive ? "text-slate-400" : "text-white"
        }`}
      >
        {loading ? (loadingLabel ?? label) : label}
      </Text>
    </AnimatedPressable>
  );
}
