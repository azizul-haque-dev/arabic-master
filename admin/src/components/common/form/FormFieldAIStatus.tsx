import { Control, FieldPath, FieldValues } from "react-hook-form";
import { FormFieldSelect } from "./FormFieldSelect";

const AI_STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "COMPLETED", label: "Completed" },
  { value: "FAILED", label: "Failed" },
];

interface FormFieldAIStatusProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
}

export function FormFieldAIStatus<TFieldValues extends FieldValues>({
  control,
  name,
}: FormFieldAIStatusProps<TFieldValues>) {
  return (
    <div className="space-y-1.5">
      <FormFieldSelect
        control={control}
        name={name}
        label="AI status"
        options={AI_STATUS_OPTIONS}
        placeholder="Select AI status"
      />
      <p className="text-xs text-muted">
        Normally set automatically by the AI worker — only override if you need
        to force a state.
      </p>
    </div>
  );
}
