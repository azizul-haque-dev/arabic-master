import { Link } from "expo-router";
import { Check } from "lucide-react-native";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { Pressable, Text, View } from "react-native";

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
            <View
              className={`mt-0.5 h-5 w-5 items-center justify-center rounded-md border ${
                value ? "border-primary bg-primary" : "border-border bg-surface"
              }`}
            >
              {value && <Check size={14} color="#ffffff" strokeWidth={3} />}
            </View>

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
            <Text className="ml-8 mt-1 text-xs text-red-500">
              {error.message}
            </Text>
          )}
        </View>
      )}
    />
  );
}
