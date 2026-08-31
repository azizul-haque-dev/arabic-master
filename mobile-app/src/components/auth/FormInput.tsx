import { useState } from "react";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { Text, TextInput, View, type TextInputProps } from "react-native";

type FormInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
} & Omit<TextInputProps, "value" | "onChangeText" | "onBlur">;

export function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  ...inputProps
}: FormInputProps<T>) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <View className="mb-4">
          <Text className="mb-2 font-label-md text-label-md text-on-surface">
            {label}
          </Text>
          <TextInput
            className={`h-14 rounded-lg border bg-surface-container-lowest px-4 font-body-md text-body-md text-on-surface shadow-sm ${
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
            placeholderTextColor="#3d4a3f99"
            autoCapitalize="none"
            {...inputProps}
          />
          {error?.message ? (
            <Text className="mt-1 text-[13px] text-error">{error.message}</Text>
          ) : null}
        </View>
      )}
    />
  );
}
