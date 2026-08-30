import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Pressable } from "react-native";

export function BackButton() {
  return (
    <Pressable
      accessibilityLabel="Go back"
      onPress={() => router.back()}
      hitSlop={8}
      className="-ms-3 h-12 w-12 items-center justify-center rounded-full active:bg-slate-100"
    >
      <ChevronLeft size={24} strokeWidth={2.5} color="#64748b" />
    </Pressable>
  );
}
