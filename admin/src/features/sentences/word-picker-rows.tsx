import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { fetchWords } from "@/features/words/api";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Loader2, Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { Controller, useFieldArray, type Control } from "react-hook-form";
import type { SentenceValues } from "./sentence-form-dialog";

// 1. Custom Hook: API Spam কমানোর জন্য (ইউজার টাইপ থামানোর ৩০০ms পর কল হবে)
function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

// 2. Searchable Combobox Component
interface WordSearchComboboxProps {
  value: string;
  onChange: (value: string) => void;
}

function WordSearchCombobox({ value, onChange }: WordSearchComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebounce(search, 500);

  // ড্রপডাউন বন্ধ থাকলে সিলেক্ট করা ওয়ার্ড দেখানোর জন্য লোকাল স্টেট
  const [selectedLabel, setSelectedLabel] = React.useState<string | null>(null);

  // ডাটাবেস থেকে সার্চ কুয়েরি অনুযায়ী ডেটা আনা (Ensure your fetchWords API supports searching)
  const { data, isLoading } = useQuery({
    queryKey: ["words", "search", debouncedSearch],
    queryFn: () => fetchWords({ search: debouncedSearch, limit: 10 }),
    enabled: open, // পপওভার ওপেন থাকলেই শুধু API কল হবে
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="flex-1 justify-between font-normal"
          >
            {selectedLabel ? selectedLabel : "Search a word..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        }
      />
      <PopoverContent className="w-[300px] p-0">
        <Command shouldFilter={false}>
          {/* shouldFilter={false} দেওয়া হয়েছে কারণ আমরা Server-side ফিল্টার করছি */}
          <CommandInput
            placeholder="Type to search database..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {isLoading && (
              <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </div>
            )}

            {!isLoading && data?.items?.length === 0 && (
              <CommandEmpty>No word found in database.</CommandEmpty>
            )}

            {!isLoading && (
              <CommandGroup>
                {data?.items?.map((word) => (
                  <CommandItem
                    key={word.id}
                    value={word.id}
                    onSelect={(currentValue) => {
                      onChange(currentValue);
                      setSelectedLabel(
                        `${word.arabic.text}${word.meaningEn ? ` — ${word.meaningEn}` : ""}`,
                      );
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === word.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <span className="arabic-text">{word.arabic.text}</span>
                    {word.meaningEn ? ` — ${word.meaningEn}` : ""}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// 3. Updated Main Component
interface WordPickerRowsProps {
  control: Control<SentenceValues>;
}

export function WordPickerRows({ control }: WordPickerRowsProps) {
  const { fields, append, remove } = useFieldArray({ control, name: "words" });

  return (
    <div className="space-y-3">
      {fields.map((field, index) => (
        <div key={field.id} className="flex items-center gap-2">
          <span className="w-6 shrink-0 text-xs text-muted-foreground">
            {index + 1}.
          </span>

          {/* নতুন সার্চ কম্বোবক্স */}
          <Controller
            control={control}
            name={`words.${index}.wordId`}
            render={({ field: selectField }) => (
              <WordSearchCombobox
                value={selectField.value}
                onChange={selectField.onChange}
              />
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

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => remove(index)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append({ wordId: "", position: fields.length + 1 })}
      >
        <Plus className="mr-2 h-4 w-4" />
        Add word
      </Button>
    </div>
  );
}
