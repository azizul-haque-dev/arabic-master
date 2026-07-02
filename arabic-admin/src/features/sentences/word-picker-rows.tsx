// Lets an admin build the ordered word list for a sentence: pick an
// existing word for each position via useFieldArray, add/remove rows.
import { useQuery } from "@tanstack/react-query";
import { useFieldArray, Controller, type Control } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchWords } from "@/features/words/api";
import type { SentenceValues } from "./sentence-form-dialog";

interface WordPickerRowsProps {
  control: Control<SentenceValues>;
}

export function WordPickerRows({ control }: WordPickerRowsProps) {
  const { fields, append, remove } = useFieldArray({ control, name: "words" });

  // A generous page size keeps this simple - most word banks are small
  // enough that a plain dropdown beats building a search-as-you-type combobox.
  const { data } = useQuery({
    queryKey: ["words", "picker"],
    queryFn: () => fetchWords({ limit: 100 }),
  });

  return (
    <div className="space-y-2">
      {fields.map((field, index) => (
        <div key={field.id} className="flex items-center gap-2">
          <span className="w-6 shrink-0 text-xs text-muted">{index + 1}.</span>

          <Controller
            control={control}
            name={`words.${index}.wordId`}
            render={({ field: selectField }) => (
              <Select value={selectField.value} onValueChange={selectField.onChange}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Choose a word" />
                </SelectTrigger>
                <SelectContent>
                  {data?.items.map((word) => (
                    <SelectItem key={word.id} value={word.id}>
                      <span className="arabic-text">{word.arabic.text}</span>
                      {word.meaningEn ? ` — ${word.meaningEn}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />

          <Controller
            control={control}
            name={`words.${index}.position`}
            render={({ field: positionField }) => (
              <Input
                type="number"
                className="w-20"
                value={positionField.value}
                onChange={(e) => positionField.onChange(Number(e.target.value))}
              />
            )}
          />

          <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append({ wordId: "", position: fields.length })}
      >
        <Plus className="h-4 w-4" />
        Add word
      </Button>
    </div>
  );
}
