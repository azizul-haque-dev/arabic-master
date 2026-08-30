import type { ReactNode } from "react";
import { useState } from "react";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { Text, TextInput, View, type TextInputProps } from "react-native";

interface FormFieldProps<T extends FieldValues> extends TextInputProps {
  control: Control<T>;
  name: Path<T>;
  label: string;
  labelRight?: ReactNode;
  rightElement?: ReactNode;
}

export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  labelRight,
  rightElement,
  ...inputProps
}: FormFieldProps<T>) {
  const [focused, setFocused] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <View>
          <View className="mb-1.5 flex-row items-center justify-between">
            <Text
              className={`text-sm font-medium ${
                focused ? "text-brand-primary" : "text-text-main"
              }`}
            >
              {label}
            </Text>
            {labelRight}
          </View>

          <View className="relative">
            <TextInput
              value={value}
              onChangeText={onChange}
              onFocus={() => setFocused(true)}
              onBlur={() => {
                setFocused(false);
                onBlur();
              }}
              placeholderTextColor="#94a3b8"
              className={`h-14 w-full rounded-2xl border-[1.5px] bg-surface px-5 text-base text-text-main ${
                rightElement ? "pe-14" : ""
              } ${
                error
                  ? "border-danger"
                  : focused
                    ? "border-brand-primary"
                    : "border-border"
              }`}
              {...inputProps}
            />
            {rightElement}
          </View>

          {error && (
            <Text className="mt-1 text-xs text-danger">{error.message}</Text>
          )}
        </View>
      )}
    />
  );
}
