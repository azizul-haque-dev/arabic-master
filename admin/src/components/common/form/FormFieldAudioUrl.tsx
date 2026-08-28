import { Control, FieldPath, FieldValues } from "react-hook-form";
import { FormFieldText } from "./FormFieldText";

interface FormFieldAudioUrlProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
}

export function FormFieldAudioUrl<TFieldValues extends FieldValues>({
  control,
  name,
}: FormFieldAudioUrlProps<TFieldValues>) {
  return (
    <FormFieldText
      control={control}
      name={name}
      label="Audio URL (optional)"
      placeholder="https://…"
    />
  );
}
