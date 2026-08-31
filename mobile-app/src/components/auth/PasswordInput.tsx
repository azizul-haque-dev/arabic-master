import { Link } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { Pressable, Text, TextInput, View } from "react-native";

type PasswordInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  showForgotPassword?: boolean;
};

export function PasswordInput<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  showForgotPassword = false,
}: PasswordInputProps<T>) {
  const [isFocused, setIsFocused] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <View className="mb-4">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="font-label-md text-label-md text-on-surface">
              {label}
            </Text>
            {showForgotPassword ? (
              <Link
                href="/(auth)/forgot-password"
                className="font-label-md text-label-md text-primary"
              >
                <Text className="text-primary underline">Forgot password?</Text>
              </Link>
            ) : null}
          </View>
          <View className="relative justify-center">
            <TextInput
              className={`h-14 rounded-lg border bg-surface-container-lowest pl-4 pr-12 font-body-md text-body-md text-on-surface shadow-sm ${
                error
                  ? "border-error"
                  : isFocused
                    ? "border-primary"
                    : "border-surface-container-highest"
              }`}
              value={value}
              onChangeText={onChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                setIsFocused(false);
                onBlur();
              }}
              placeholder={placeholder}
              placeholderTextColor="#3d4a3f99"
              secureTextEntry={!isVisible}
              autoCapitalize="none"
              autoComplete="password"
            />
            <Pressable
              onPress={() => setIsVisible((prev) => !prev)}
              hitSlop={8}
              className="absolute right-3 h-8 w-8 items-center justify-center"
            >
              {isVisible ? (
                <EyeOff size={20} color="#3d4a3f" />
              ) : (
                <Eye size={20} color="#3d4a3f" />
              )}
            </Pressable>
          </View>
          {error?.message ? (
            <Text className="mt-1 text-[13px] text-error">{error.message}</Text>
          ) : null}
        </View>
      )}
    />
  );
}
