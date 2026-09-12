"use client";

import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
}

export function ContentDataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  selectable,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  renderMobileCard,
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onToggleSelectAll?: () => void;
  renderMobileCard: (row: T) => React.ReactNode;
}) {
  const allSelected = selectable && rows.length > 0 && rows.every((r) => selectedIds?.has(rowKey(r)));

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-lg border border-border bg-white md:block">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 border-b border-border bg-background">
            <tr>
              {selectable ? (
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={onToggleSelectAll}
                    aria-label="Select all rows"
                    className="h-4 w-4 rounded border-border-strong accent-primary"
                  />
                </th>
              ) : null}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted",
                    col.className,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const id = rowKey(row);
              return (
                <tr
                  key={id}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "border-b border-border last:border-0 transition-colors",
                    onRowClick && "cursor-pointer hover:bg-background",
                  )}
                >
                  {selectable ? (
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds?.has(id) ?? false}
                        onChange={() => onToggleSelect?.(id)}
                        aria-label="Select row"
                        className="h-4 w-4 rounded border-border-strong accent-primary"
                      />
                    </td>
                  ) : null}
                  {columns.map((col) => (
                    <td key={col.key} className={cn("px-4 py-3 align-middle", col.className)}>
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="flex flex-col gap-3 md:hidden">
        {rows.map((row) => (
          <li
            key={rowKey(row)}
            onClick={() => onRowClick?.(row)}
            className="rounded-lg border border-border bg-white p-4"
          >
            {renderMobileCard(row)}
          </li>
        ))}
      </ul>
    </>
  );
}
