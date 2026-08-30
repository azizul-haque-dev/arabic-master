import * as Haptics from "expo-haptics";
import { Platform, Pressable, Text } from "react-native";
import Svg, { Path } from "react-native-svg";

function AppleMark() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="#ffffff">
      <Path d="M16.365 1.43c0 1.14-.415 2.19-1.15 2.98-.83.9-2.19 1.6-3.32 1.51-.14-1.11.42-2.27 1.14-3.02.82-.86 2.22-1.5 3.33-1.47zM20.94 17.19c-.53 1.23-.79 1.78-1.47 2.86-.95 1.51-2.29 3.4-3.95 3.42-1.47.02-1.85-.96-3.84-.95-1.99.01-2.41.97-3.88.95-1.66-.02-2.93-1.72-3.88-3.23C1.6 16.86.86 12.94 2.24 10.3c.98-1.87 2.75-3.05 4.67-3.08 1.5-.03 2.91.99 3.84.99.93 0 2.65-1.23 4.47-1.05.76.03 2.9.31 4.27 2.31-.11.07-2.55 1.49-2.52 4.44.03 3.52 3.09 4.69 3.12 4.71-.03.09-.49 1.67-1.15 3.55z" />
    </Svg>
  );
}

interface AppleLoginButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export function AppleLoginButton({ onPress, disabled }: AppleLoginButtonProps) {
  // Apple Sign-In is required by App Store guidelines whenever a third-party
  // login (Google) is offered — Android/web don't need it.
  if (Platform.OS !== "ios") return null;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      className="mt-3 h-12 w-full flex-row items-center justify-center gap-3 rounded-2xl bg-black active:scale-[0.98] active:opacity-90 disabled:opacity-50"
    >
      <AppleMark />
      <Text className="font-semibold text-white">Continue with Apple</Text>
    </Pressable>
  );
}
