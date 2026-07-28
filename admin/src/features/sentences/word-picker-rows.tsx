import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { fetchWords } from "@/features/words/api";
import { cn } from "@/lib/utils";
import type { SentenceWordRef } from "@/types";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Check,
  ChevronsUpDown,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import * as React from "react";
import { Controller, useFieldArray, type Control } from "react-hook-form";
import type { SentenceValues } from "./sentence-form-dialog";

function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

function wordLabel(word: Pick<SentenceWordRef, "arabic" | "meaningEn">) {
  return `${word.arabic.text}${word.meaningEn ? ` — ${word.meaningEn}` : ""}`;
}

interface WordSearchComboboxProps {
  value: string;
  onChange: (value: string) => void;
  initialLabel?: string;
  disabledWordIds: Set<string>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

function WordSearchCombobox({
  value,
  onChange,
  initialLabel,
  disabledWordIds,
  isOpen,
  onOpenChange,
}: WordSearchComboboxProps) {
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["words", "search", debouncedSearch],
    queryFn: () => fetchWords({ search: debouncedSearch, limit: 10 }),
    enabled: isOpen, // dialog বন্ধ থাকলে বা popover বন্ধ থাকলে fetch হবে না
    staleTime: 30_000, // ঘন ঘন same query re-fetch এড়ানো
  });

  const selectedWord = data?.items.find((word) => word.id === value);
  const label = selectedWord
    ? wordLabel(selectedWord)
    : (initialLabel ?? (value ? "Selected word" : "Search a word..."));

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            aria-label="Select word"
            className="flex-1 justify-between font-normal"
          >
            <span className="truncate">{label}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        }
      />
      <PopoverContent className="w-[300px] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Type to search database..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {isError && (
              <div className="flex items-center gap-2 p-4 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                Failed to load words. Try again.
              </div>
            )}

            {isLoading && !isError && (
              <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </div>
            )}

            {!isLoading && !isError && data?.items?.length === 0 && (
              <CommandEmpty>No word found in database.</CommandEmpty>
            )}

            {!isLoading && !isError && (
              <CommandGroup>
                {data?.items?.map((word) => {
                  const isDuplicate =
                    disabledWordIds.has(word.id) && word.id !== value;
                  return (
                    <CommandItem
                      key={word.id}
                      value={word.id}
                      disabled={isDuplicate}
                      className={cn(isDuplicate && "opacity-50")}
                      onSelect={() => {
                        if (isDuplicate) return;
                        onChange(word.id);
                        onOpenChange(false);
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
                      {isDuplicate && (
                        <span className="ml-auto text-xs text-muted-foreground">
                          Already added
                        </span>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

interface WordPickerRowsProps {
  control: Control<SentenceValues>;
  existingWords?: SentenceWordRef[];
}

export function WordPickerRows({
  control,
  existingWords = [],
}: WordPickerRowsProps) {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "words",
  });

  // কোন row-এর popover এখন খোলা — একসাথে একটার বেশি open থাকার দরকার নেই,
  // আর এতে "closed popover-ও background-এ query fire করছে" bug আসে না
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  const existingWordsById = React.useMemo(
    () => new Map(existingWords.map((w) => [w.id, w])),
    [existingWords],
  );

  const currentWordIds = React.useMemo(
    () => new Set(fields.map((f) => f.wordId).filter(Boolean)),
    [fields],
  );

  return (
    <div className="space-y-3">
      {fields.map((field, index) => {
        const existingWord = existingWordsById.get(field.wordId);

        return (
          <div key={field.id} className="flex items-center gap-2">
            <div className="flex w-6 shrink-0 flex-col items-center text-xs text-muted-foreground">
              <span>{index + 1}.</span>
            </div>

            <div className="flex shrink-0 flex-col">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-4 w-6"
                disabled={index === 0}
                aria-label="Move up"
                onClick={() => move(index, index - 1)}
              >
                <ArrowUp className="h-3 w-3" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-4 w-6"
                disabled={index === fields.length - 1}
                aria-label="Move down"
                onClick={() => move(index, index + 1)}
              >
                <ArrowDown className="h-3 w-3" />
              </Button>
            </div>

            <Controller
              control={control}
              name={`words.${index}.wordId`}
              render={({ field: selectField }) => (
                <WordSearchCombobox
                  value={selectField.value}
                  onChange={selectField.onChange}
                  initialLabel={
                    existingWord ? wordLabel(existingWord) : undefined
                  }
                  disabledWordIds={currentWordIds}
                  isOpen={openIndex === index}
                  onOpenChange={(next) => setOpenIndex(next ? index : null)}
                />
              )}
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Remove word"
              onClick={() => remove(index)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        );
      })}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append({ wordId: "", position: fields.length })}
      >
        <Plus className="mr-2 h-4 w-4" />
        Add word
      </Button>
    </div>
  );
}
