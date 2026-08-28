import { Control, FieldPath, FieldValues } from "react-hook-form";
import { FormFieldText } from "./FormFieldText";

interface FormGroupPronunciationProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  nameEn: FieldPath<TFieldValues>;
  nameBn: FieldPath<TFieldValues>;
}

export function FormGroupPronunciation<TFieldValues extends FieldValues>({
  control,
  nameEn,
  nameBn,
}: FormGroupPronunciationProps<TFieldValues>) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormFieldText
        control={control}
        name={nameEn}
        label="Pronunciation (English)"
        placeholder="Enter English pronunciation"
      />
      <FormFieldText
        control={control}
        name={nameBn}
        label="Pronunciation (Bangla)"
        placeholder="বাংলা উচ্চারণ লিখুন"
      />
    </div>
  );
}
