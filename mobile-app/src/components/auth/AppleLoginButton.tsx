import { Platform, Pressable, Text, View } from "react-native";

interface AppleLoginButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export function AppleLoginButton({ onPress, disabled }: AppleLoginButtonProps) {
  // Android/web-এ Apple Sign-In দেখানোর দরকার নেই — App Store guideline-এর
  // জন্য শুধু iOS-এ বাধ্যতামূলক যেহেতু Google login আছে
  if (Platform.OS !== "ios") return null;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="mt-3 h-12 w-full flex-row items-center justify-center gap-3 rounded-2xl bg-black active:opacity-90 disabled:opacity-50"
    >
      {/* প্রকৃত Apple logo mark ব্যবহার করুন — এটা placeholder glyph */}
      <View className="h-4 w-4 items-center justify-center">
        <Text className="text-base text-white"></Text>
      </View>
      <Text className="font-semibold text-white">Continue with Apple</Text>
    </Pressable>
  );
}
