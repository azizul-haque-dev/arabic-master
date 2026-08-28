import { Control, FieldPath, FieldValues } from "react-hook-form";
import { FormFieldText } from "./FormFieldText";

interface FormGroupMeaningProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  nameEn: FieldPath<TFieldValues>;
  nameBn: FieldPath<TFieldValues>;
}

export function FormGroupMeaning<TFieldValues extends FieldValues>({
  control,
  nameEn,
  nameBn,
}: FormGroupMeaningProps<TFieldValues>) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormFieldText
        control={control}
        name={nameEn}
        label="Meaning (English)"
        placeholder="Enter English meaning"
      />
      <FormFieldText
        control={control}
        name={nameBn}
        label="Meaning (Bangla)"
        placeholder="বাংলা অর্থ লিখুন"
      />
    </div>
  );
}
