import { ArrowLeft, HelpCircle } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { BrandMark } from "@/components/onboarding/BrandMark";

export type AuthMode = "login" | "register";

type AuthPageHeaderProps = {
  mode: AuthMode;
  onBack: () => void;
  onHelp: () => void;
  onModeChange: (mode: AuthMode) => void;
};

export function AuthPageHeader({
  mode,
  onBack,
  onHelp,
  onModeChange,
}: AuthPageHeaderProps) {
  const isLogin = mode === "login";

  return (
    <View className="px-margin pb-4 pt-2">
      <View className="h-10 flex-row items-center justify-between">
        <Pressable
          onPress={onBack}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="h-10 w-10 items-center justify-center rounded-full border border-outline-variant bg-surface active:bg-surface-container-low"
        >
          <ArrowLeft size={19} color="#171717" strokeWidth={2.2} />
        </Pressable>

        <BrandMark variant="logo" size={30} />

        <Pressable
          onPress={onHelp}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Help and support"
          className="h-10 w-10 items-center justify-center rounded-full border border-outline-variant bg-surface active:bg-surface-container-low"
        >
          <HelpCircle size={19} color="#737373" strokeWidth={2} />
        </Pressable>
      </View>

      <View
        className="mt-4 flex-row rounded-2xl border border-outline-variant/70 bg-surface-container-low p-1"
        accessibilityRole="tablist"
      >
        <Pressable
          onPress={() => onModeChange("login")}
          accessibilityRole="tab"
          accessibilityLabel="Sign in"
          accessibilityState={{ selected: isLogin }}
          className={`flex-1 items-center justify-center rounded-xl py-2.5 ${
            isLogin ? "bg-surface shadow-sm" : "active:opacity-70"
          }`}
        >
          <Text
            className={`font-label-lg text-sm ${
              isLogin ? "font-bold text-primary-strong" : "text-on-surface-variant"
            }`}
          >
            Sign in
          </Text>
        </Pressable>

        <Pressable
          onPress={() => onModeChange("register")}
          accessibilityRole="tab"
          accessibilityLabel="Create account"
          accessibilityState={{ selected: !isLogin }}
          className={`flex-1 items-center justify-center rounded-xl py-2.5 ${
            !isLogin ? "bg-surface shadow-sm" : "active:opacity-70"
          }`}
        >
          <Text
            className={`font-label-lg text-sm ${
              !isLogin ? "font-bold text-primary-strong" : "text-on-surface-variant"
            }`}
          >
            Create account
          </Text>
        </Pressable>
      </View>

      <View className="items-center px-2 pt-5">
        <Text className="font-label-sm text-[10px] font-bold uppercase tracking-[1.4px] text-primary">
          {isLogin ? "YOUR LEARNING, IN SYNC" : "YOUR NEXT CHAPTER"}
        </Text>
        <Text className="mt-2 text-center font-headline-md text-[27px] font-bold leading-tight tracking-tight text-on-surface">
          {isLogin ? "Welcome back" : "Start speaking Arabic"}
        </Text>
        <Text className="mt-1.5 max-w-[310px] text-center font-body-sm text-sm leading-5 text-on-surface-variant">
          {isLogin
            ? "Pick up where you left off. Your Arabic progress is right where you left it."
            : "Create your free account and build confidence for the conversations that matter."}
        </Text>
      </View>
    </View>
  );
}
