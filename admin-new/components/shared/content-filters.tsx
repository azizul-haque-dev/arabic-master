"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ListFilter, Check } from "lucide-react";
import { CONTENT_STATUS_LABEL, type ContentStatus } from "@/lib/types/content";
import { Button } from "@/components/ui/button";

export function ContentStatusFilter({
  selected,
  onChange,
  options,
}: {
  selected: Set<ContentStatus>;
  onChange: (next: Set<ContentStatus>) => void;
  options: ContentStatus[];
}) {
  function toggle(status: ContentStatus) {
    const next = new Set(selected);
    if (next.has(status)) next.delete(status);
    else next.add(status);
    onChange(next);
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="secondary" size="sm">
          <ListFilter className="h-3.5 w-3.5" aria-hidden="true" />
          {selected.size > 0 ? `Filters (${selected.size})` : "Filters"}
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        align="start"
        sideOffset={6}
        className="z-40 min-w-48 rounded-md border border-border bg-white p-1.5 shadow-[0_4px_6px_rgba(15,23,42,0.08),0_2px_4px_rgba(15,23,42,0.04)]"
      >
        {options.map((status) => (
          <DropdownMenu.Item
            key={status}
            onSelect={(e) => {
              e.preventDefault();
              toggle(status);
            }}
            className="flex cursor-pointer items-center justify-between rounded-sm px-2.5 py-2 text-sm text-text outline-none hover:bg-background"
          >
            {CONTENT_STATUS_LABEL[status]}
            {selected.has(status) ? (
              <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            ) : null}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
