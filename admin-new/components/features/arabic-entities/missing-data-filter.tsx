"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ENTITY_MISSING_FIELDS = [
  { value: "meaningEnglish", label: "English meaning" },
  { value: "meaningBangla", label: "Bangla meaning" },
  { value: "pronunciationEnglish", label: "English pronunciation" },
  { value: "pronunciationBangla", label: "Bangla pronunciation" },
] as const;

export type EntityMissingField = (typeof ENTITY_MISSING_FIELDS)[number]["value"];

export function MissingDataFilter({
  selected,
  onChange,
}: {
  selected: EntityMissingField[];
  onChange: (next: EntityMissingField[]) => void;
}) {
  function toggle(field: EntityMissingField) {
    onChange(
      selected.includes(field)
        ? selected.filter((item) => item !== field)
        : [...selected, field],
    );
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="secondary" size="sm" aria-label="Filter by missing entity data">
          <ListFilter className="h-3.5 w-3.5" aria-hidden="true" />
          {selected.length > 0 ? `Missing data (${selected.length})` : "Missing data"}
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        align="start"
        sideOffset={6}
        className="z-40 min-w-56 rounded-md border border-border bg-white p-1.5 shadow-[0_4px_6px_rgba(15,23,42,0.08),0_2px_4px_rgba(15,23,42,0.04)]"
      >
        <p className="px-2.5 py-2 text-xs text-text-muted">
          Show entities missing any selected field
        </p>
        {ENTITY_MISSING_FIELDS.map(({ value, label }) => (
          <DropdownMenu.Item
            key={value}
            onSelect={(event) => {
              event.preventDefault();
              toggle(value);
            }}
            className="flex cursor-pointer items-center justify-between rounded-sm px-2.5 py-2 text-sm text-text outline-none hover:bg-background"
          >
            {label}
            {selected.includes(value) ? (
              <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            ) : null}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
