import * as Haptics from "expo-haptics";
import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

interface BottomCTAProps {
  onSubmit: () => void;
  disabled: boolean;
  loading: boolean;
}

export function BottomCTA({ onSubmit, disabled, loading }: BottomCTAProps) {
  const isInactive = disabled || loading;

  const handleSubmit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSubmit();
  };

  return (
    <View className="px-6 pb-8 pt-10">
      <Pressable
        onPress={handleSubmit}
        disabled={isInactive}
        className={`h-14 w-full items-center justify-center rounded-2xl active:scale-[0.98] ${
          isInactive ? "bg-slate-200" : "bg-primary shadow-brand-sm"
        }`}
      >
        <Text
          className={`text-base font-semibold ${
            isInactive ? "text-slate-400" : "text-white"
          }`}
        >
          {loading ? "Logging in..." : "Log in"}
        </Text>
      </Pressable>

      <View className="mt-4 flex-row justify-center">
        <Text className="text-sm text-muted">Don't have an account? </Text>
        <Link
          href="/(auth)/register"
          className="text-sm font-semibold text-brand-primary"
        >
          Sign up
        </Link>
      </View>
    </View>
  );
}
