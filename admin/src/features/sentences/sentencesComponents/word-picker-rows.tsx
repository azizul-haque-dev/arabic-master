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
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

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
    queryFn: () =>
      fetchWords({
        search: debouncedSearch,
        limit: 10,
      }),
    enabled: isOpen,
    staleTime: 30_000,
  });

  const selectedWord = data?.items.find((word) => word.id === value);

  const label = selectedWord
    ? wordLabel(selectedWord)
    : (initialLabel ?? (value ? "Selected word" : "Search a word..."));

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          aria-label="Select word"
          className="w-full min-w-0 justify-between font-normal"
        >
          <span className="min-w-0 truncate text-left">{label}</span>

          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[400px] max-w-[calc(100vw-2rem)] p-0"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Type to search database..."
            value={search}
            onValueChange={setSearch}
          />

          <CommandList>
            {isError && (
              <div className="flex items-center gap-2 p-4 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Failed to load words. Try again.</span>
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
                      className={cn(
                        "w-full min-w-0 max-w-full",
                        isDuplicate && "opacity-50",
                      )}
                      onSelect={() => {
                        if (isDuplicate) return;

                        onChange(word.id);
                        onOpenChange(false);
                      }}
                    >
                      <div className="flex w-full min-w-0 max-w-full items-center gap-2">
                        <Check
                          className={cn(
                            "h-4 w-4 shrink-0",
                            value === word.id ? "opacity-100" : "opacity-0",
                          )}
                        />

                        <span
                          dir="rtl"
                          className="min-w-0 max-w-[40%] break-words text-right leading-6"
                        >
                          {word.arabic.text}
                        </span>

                        <span className="min-w-0 flex-1 truncate text-left">
                          {word.meaningEn ? `— ${word.meaningEn}` : ""}
                        </span>

                        {isDuplicate && (
                          <span className="shrink-0 text-xs text-muted-foreground">
                            Already added
                          </span>
                        )}
                      </div>
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

  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  const existingWordsById = React.useMemo(
    () => new Map(existingWords.map((word) => [word.id, word])),
    [existingWords],
  );

  const currentWordIds = React.useMemo(
    () => new Set(fields.map((field) => field.wordId).filter(Boolean)),
    [fields],
  );

  return (
    <div className="w-full min-w-0 max-w-full space-y-3 overflow-hidden">
      {fields.map((field, index) => {
        const existingWord = existingWordsById.get(field.wordId);

        return (
          <div
            key={field.id}
            className="grid w-full min-w-0 max-w-full grid-cols-[24px_32px_minmax(0,1fr)_32px] items-center gap-2"
          >
            {/* Number */}
            <div className="flex w-6 shrink-0 items-center justify-center text-xs text-muted-foreground">
              {index + 1}.
            </div>

            {/* Move buttons */}
            <div className="flex w-8 shrink-0 flex-col items-center">
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

            {/* Word picker */}
            <div className="min-w-0 w-full max-w-full overflow-hidden">
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
            </div>

            {/* Remove button */}
            <div className="flex w-8 shrink-0 items-center justify-center">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                aria-label="Remove word"
                onClick={() => remove(index)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        );
      })}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          append({
            wordId: "",
            position: fields.length,
          })
        }
      >
        <Plus className="mr-2 h-4 w-4" />
        Add word
      </Button>
    </div>
  );
}
