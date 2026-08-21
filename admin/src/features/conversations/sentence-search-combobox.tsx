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
import { fetchSentences } from "@/features/sentences/api";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  Check,
  ChevronsUpDown,
  Loader2,
} from "lucide-react";
import * as React from "react";

function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

interface SentenceSearchComboboxProps {
  value: string;
  onChange: (id: string, label: string) => void;
  initialLabel?: string;
}

export function SentenceSearchCombobox({
  value,
  onChange,
  initialLabel,
}: SentenceSearchComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebounce(search);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["sentences", "search", debouncedSearch],
    queryFn: () => fetchSentences({ search: debouncedSearch, limit: 10 }),
    enabled: open,
    staleTime: 30_000,
  });

  const selected = data?.items.find((s) => s.id === value);
  const label = selected
    ? selected.arabic.text
    : (initialLabel ?? (value ? "Selected sentence" : "Search a sentence…"));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select sentence"
            className="w-full justify-between font-normal"
          >
            <span className="arabic-text truncate">{label}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        }
      />
      <PopoverContent className="w-[320px] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search Arabic or meaning…"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {isError && (
              <div className="flex items-center gap-2 p-4 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                Failed to load sentences. Try again.
              </div>
            )}

            {isLoading && !isError && (
              <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </div>
            )}

            {!isLoading && !isError && data?.items?.length === 0 && (
              <CommandEmpty>No sentence found.</CommandEmpty>
            )}

            {!isLoading && !isError && (
              <CommandGroup>
                {data?.items?.map((sentence) => (
                  <CommandItem
                    key={sentence.id}
                    value={sentence.id}
                    onSelect={() => {
                      onChange(sentence.id, sentence.arabic.text);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === sentence.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <div className="min-w-0">
                      <p className="arabic-text truncate">{sentence.arabic.text}</p>
                      {sentence.meaningEn && (
                        <p className="truncate text-xs text-muted-foreground">
                          {sentence.meaningEn}
                        </p>
                      )}
                    </div>
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
