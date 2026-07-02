// Simple checkbox-list multi-select for tagging a word/sentence with
// one or more categories. Deliberately not a fancy combobox - the
// category count is small and this stays predictable and accessible.
import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "@/features/categories/api";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";

interface CategoryMultiSelectProps {
  value: string[];
  onChange: (ids: string[]) => void;
}

export function CategoryMultiSelect({ value, onChange }: CategoryMultiSelectProps) {
  const { data: categories, isLoading } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-2/3" />
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return <p className="text-sm text-muted">No categories yet - create one first.</p>;
  }

  function toggle(id: string) {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  }

  return (
    <div className="grid max-h-40 grid-cols-2 gap-2 overflow-y-auto rounded-md border border-border p-3">
      {categories.map((category) => (
        <label key={category.id} className="flex cursor-pointer items-center gap-2 text-sm">
          <Checkbox checked={value.includes(category.id)} onCheckedChange={() => toggle(category.id)} />
          {category.nameEn}
        </label>
      ))}
    </div>
  );
}
