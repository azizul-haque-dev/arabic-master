import { CategoryMultiSelect } from "@/components/category-multi-select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Control, FieldPath, FieldValues } from "react-hook-form";

interface FormFieldCategoriesProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
}

export function FormFieldCategories<TFieldValues extends FieldValues>({
  control,
  name,
}: FormFieldCategoriesProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Categories</FormLabel>
          <FormControl>
            <CategoryMultiSelect
              value={field.value}
              onChange={field.onChange}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
