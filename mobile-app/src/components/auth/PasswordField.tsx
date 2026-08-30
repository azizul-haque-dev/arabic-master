import { Link } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import type { Control, FieldValues, Path } from "react-hook-form";
import { Pressable } from "react-native";
import { FormField } from "./FormField";

interface PasswordFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  disabled?: boolean;
  showForgotPassword?: boolean;
}

export function PasswordField<T extends FieldValues>({
  control,
  name,
  disabled,
  showForgotPassword = true,
}: PasswordFieldProps<T>) {
  const [visible, setVisible] = useState(false);

  return (
    <FormField
      control={control}
      name={name}
      label="Password"
      placeholder="Enter your password"
      secureTextEntry={!visible}
      editable={!disabled}
      labelRight={
        showForgotPassword ? (
          <Link
            href="/(auth)/forgot-password"
            className="text-sm font-semibold text-brand-primary"
          >
            Forgot password?
          </Link>
        ) : undefined
      }
      rightElement={
        <Pressable
          onPress={() => setVisible((v) => !v)}
          accessibilityLabel="Toggle password visibility"
          className="absolute inset-y-0 end-0 w-14 items-center justify-center"
        >
          {visible ? (
            <EyeOff size={20} color="#64748b" />
          ) : (
            <Eye size={20} color="#64748b" />
          )}
        </Pressable>
      }
    />
  );
}
