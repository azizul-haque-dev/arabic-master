import { colors } from "@/constants/colors";
import type { LucideIcon } from "lucide-react-native";
import { Check } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

interface CheckboxOptionCardProps {
  icon: LucideIcon;

  label: string;

  selected: boolean;

  onPress: () => void;
}

export function CheckboxOptionCard({
  icon: Icon,
  label,
  selected,
  onPress,
}: CheckboxOptionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{
        checked: selected,
      }}
      className={`mb-3 w-[48%] rounded-2xl border-2 p-4 ${
        selected
          ? "border-primary bg-primary-light/40"
          : "border-border bg-surface"
      }`}
    >
      <View className="flex-row items-start justify-between">
        <View
          className={`h-10 w-10 items-center justify-center rounded-xl ${
            selected ? "bg-primary" : "bg-slate-100"
          }`}
        >
          <Icon size={20} color={selected ? "#ffffff" : colors.muted} />
        </View>

        <View
          className={`h-5 w-5 items-center justify-center rounded-md border-2 ${
            selected ? "border-primary bg-primary" : "border-border bg-surface"
          }`}
        >
          {selected ? (
            <Check size={12} color="#ffffff" strokeWidth={3} />
          ) : null}
        </View>
      </View>

      <Text className="mt-3 text-sm font-semibold text-text-main">{label}</Text>
    </Pressable>
  );
}
