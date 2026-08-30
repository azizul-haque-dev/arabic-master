// mobile-app/src/components/auth/TermsCheckbox.tsx
import { Link } from "expo-router";
import { Check } from "lucide-react-native";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

interface TermsCheckboxProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
}

export function TermsCheckbox<T extends FieldValues>({
  control,
  name,
}: TermsCheckboxProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <View>
          <Pressable
            onPress={() => onChange(!value)}
            className="flex-row items-start gap-3"
            accessibilityRole="checkbox"
            accessibilityState={{ checked: !!value }}
          >
            <CheckBox checked={!!value} />
            <Text className="flex-1 text-sm text-muted">
              I agree to the{" "}
              <Link
                href="/legal/terms"
                className="font-semibold text-brand-primary"
              >
                Terms
              </Link>{" "}
              &{" "}
              <Link
                href="/legal/privacy"
                className="font-semibold text-brand-primary"
              >
                Privacy Policy
              </Link>
            </Text>
          </Pressable>

          {error && (
            <Text className="ml-8 mt-1 text-xs text-danger">
              {error.message}
            </Text>
          )}
        </View>
      )}
    />
  );
}

function CheckBox({ checked }: { checked: boolean }) {
  const style = useAnimatedStyle(() => ({
    transform: [
      { scale: withSpring(checked ? 1 : 0, { damping: 12, stiffness: 220 }) },
    ],
  }));

  return (
    <View
      className={`mt-0.5 h-5 w-5 items-center justify-center rounded-md border ${
        checked ? "border-primary bg-primary" : "border-border bg-surface"
      }`}
    >
      <Animated.View style={style}>
        <Check size={14} color="#ffffff" strokeWidth={3} />
      </Animated.View>
    </View>
  );
}
