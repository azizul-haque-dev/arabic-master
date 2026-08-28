import { Control, FieldPath, FieldValues } from "react-hook-form";
import { FormFieldSelect } from "./FormFieldSelect";

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "ACTIVE", label: "Active" },
  { value: "DISABLED", label: "Disabled" },
];

interface FormFieldStatusProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
}

export function FormFieldStatus<TFieldValues extends FieldValues>({
  control,
  name,
}: FormFieldStatusProps<TFieldValues>) {
  return (
    <FormFieldSelect
      control={control}
      name={name}
      label="Status"
      options={STATUS_OPTIONS}
      placeholder="Select status"
    />
  );
}
