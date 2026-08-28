import { Control, FieldPath, FieldValues } from "react-hook-form";
import { FormFieldTextarea } from "./FormFieldTextarea";

interface FormGroupWhenToUseProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  nameEn: FieldPath<TFieldValues>;
  nameBn: FieldPath<TFieldValues>;
}

export function FormGroupWhenToUse<TFieldValues extends FieldValues>({
  control,
  nameEn,
  nameBn,
}: FormGroupWhenToUseProps<TFieldValues>) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormFieldTextarea
        control={control}
        name={nameEn}
        label="When to use (English)"
        rows={2}
        placeholder="When to use this in English..."
      />
      <FormFieldTextarea
        control={control}
        name={nameBn}
        label="When to use (Bangla)"
        rows={2}
        placeholder="বাংলায় কখন ব্যবহার করবেন..."
      />
    </div>
  );
}
