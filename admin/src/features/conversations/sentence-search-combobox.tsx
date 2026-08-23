import { fetchSentences } from "@/features/sentences/api";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  Check,
  ChevronsUpDown,
  Loader2,
  Search,
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
  const [selectedLabel, setSelectedLabel] = React.useState(initialLabel ?? "");
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!value) {
      setSelectedLabel(initialLabel ?? "");
    }
  }, [initialLabel, value]);

  const label =
    selectedLabel || (value ? "Selected sentence" : "Search a sentence…");

  // Use state (not ref) so the query re-renders after the first open.
  const [hasOpened, setHasOpened] = React.useState(false);

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ["sentences", "search", debouncedSearch],
    queryFn: () => fetchSentences({ search: debouncedSearch, limit: 10 }),
    enabled: hasOpened,
    staleTime: 30_000,
  });

  React.useEffect(() => {
    if (!open) return;

    function handleDocumentMouseDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setSearch("");
      }
    }

    document.addEventListener("mousedown", handleDocumentMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleDocumentMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function handleOpen() {
    setOpen((currentOpen) => !currentOpen);
    if (!hasOpened) setHasOpened(true);
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls="sentence-search-list"
        aria-label="Select sentence"
        onClick={handleOpen}
        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm font-normal shadow-xs outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <span className="arabic-text truncate">{label}</span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </button>

      {open && (
        <div
          id="sentence-search-list"
          role="listbox"
          className="absolute z-50 mt-1 w-full min-w-[280px] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
        >
          <div className="flex h-8 items-center gap-2 rounded-md border border-input/30 bg-input/30 px-2">
            <Search className="h-4 w-4 shrink-0 opacity-50" />
            <input
              autoFocus
              type="search"
              placeholder="Search Arabic or meaning…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="max-h-72 overflow-y-auto py-1">
            {isError && (
              <div className="flex items-center gap-2 p-4 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                Failed to load sentences. Try again.
              </div>
            )}

            {(isLoading || isFetching) && !isError && (
              <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </div>
            )}

            {!isLoading &&
              !isFetching &&
              !isError &&
              data?.items?.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No sentence found.
                </p>
              )}

            {!isLoading && !isFetching && !isError && (
              <div>
                {data?.items?.map((sentence) => (
                  <button
                    key={sentence.id}
                    type="button"
                    role="option"
                    aria-selected={value === sentence.id}
                    onClick={() => {
                      setSelectedLabel(sentence.arabic.text);
                      onChange(sentence.id, sentence.arabic.text);
                      setOpen(false);
                      setSearch("");
                    }}
                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-none hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 shrink-0",
                        value === sentence.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <div className="min-w-0">
                      <p className="arabic-text truncate">
                        {sentence.arabic.text}
                      </p>
                      {sentence.meaningEn && (
                        <p className="truncate text-xs text-muted-foreground">
                          {sentence.meaningEn}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
