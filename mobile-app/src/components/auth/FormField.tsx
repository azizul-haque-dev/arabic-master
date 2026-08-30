import type { ReactNode } from "react";
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
            <Text className="text-sm font-medium text-text-main">{label}</Text>
            {labelRight}
          </View>

          <View className="relative">
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholderTextColor="#94a3b8"
              className={`h-12 w-full rounded-xl border bg-surface px-4 text-text-main ${
                rightElement ? "pe-12" : ""
              } ${error ? "border-red-500" : "border-border"}`}
              {...inputProps}
            />
            {rightElement}
          </View>

          {error && (
            <Text className="mt-1 text-xs text-red-500">{error.message}</Text>
          )}
        </View>
      )}
    />
  );
}
