import type { LoginFormValues } from "@/schemas/authSchema";
import { Link } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import type { Control } from "react-hook-form";
import { Pressable } from "react-native";
import { FormField } from "./FormField";

export function PasswordField({
  control,
}: {
  control: Control<LoginFormValues>;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <FormField
      control={control}
      name="password"
      label="Password"
      placeholder="••••••••"
      secureTextEntry={!visible}
      labelRight={
        <Link
          href="/(auth)/forgot-password"
          className="text-sm font-semibold text-brand-primary"
        >
          Forgot password?
        </Link>
      }
      rightElement={
        <Pressable
          onPress={() => setVisible((v) => !v)}
          accessibilityLabel="Toggle password visibility"
          className="absolute inset-y-0 end-0 w-12 items-center justify-center"
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
