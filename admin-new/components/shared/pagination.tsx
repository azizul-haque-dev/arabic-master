"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  itemName?: string;
  isLoading?: boolean;
  siblingCount?: number;
  showQuickJumper?: boolean;
  className?: string;
}

export function generatePaginationRange({
  currentPage,
  totalPages,
  siblingCount = 1,
}: {
  currentPage: number;
  totalPages: number;
  siblingCount?: number;
}): (number | string)[] {
  // Total slots: 1 (first) + 1 (last) + 1 (current) + 2*siblings + 2*ellipsis = 2*siblings + 5
  const totalSlots = siblingCount * 2 + 5;

  if (totalPages <= totalSlots) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

  const firstPageIndex = 1;
  const lastPageIndex = totalPages;

  // Case 1: No left dots, right dots needed
  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftItemCount = 3 + 2 * siblingCount;
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, "...", lastPageIndex];
  }

  // Case 2: Left dots needed, no right dots
  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightItemCount = 3 + 2 * siblingCount;
    const rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => totalPages - rightItemCount + 1 + i,
    );
    return [firstPageIndex, "...", ...rightRange];
  }

  // Case 3: Both left and right dots needed
  if (shouldShowLeftDots && shouldShowRightDots) {
    const middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i,
    );
    return [firstPageIndex, "...", ...middleRange, "...", lastPageIndex];
  }

  return [];
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  itemName = "items",
  isLoading = false,
  siblingCount = 1,
  showQuickJumper = true,
  className,
}: PaginationProps) {
  const [jumpPage, setJumpPage] = useState("");

  if (totalPages <= 1 && (totalItems === undefined || totalItems === 0)) {
    return null;
  }

  const range = generatePaginationRange({
    currentPage,
    totalPages,
    siblingCount,
  });

  const startItem =
    pageSize && totalItems
      ? Math.min((currentPage - 1) * pageSize + 1, totalItems)
      : (currentPage - 1) * (pageSize || 1) + 1;
  const endItem =
    pageSize && totalItems
      ? Math.min(currentPage * pageSize, totalItems)
      : currentPage * (pageSize || 1);

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(jumpPage, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= totalPages && parsed !== currentPage) {
      onPageChange(parsed);
      setJumpPage("");
    }
  };

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn(
        "flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      {/* Items summary */}
      <div className="flex items-center gap-2 text-sm text-text-secondary">
        {isLoading ? (
          <span className="flex items-center gap-1.5 text-xs text-primary font-medium">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Loading...
          </span>
        ) : null}
        <span>
          {typeof totalItems === "number" ? (
            totalItems > 0 ? (
              <>
                Showing <strong className="font-semibold text-text">{startItem}</strong>
                {startItem !== endItem ? (
                  <>
                    –<strong className="font-semibold text-text">{endItem}</strong>
                  </>
                ) : null}{" "}
                of <strong className="font-semibold text-text">{totalItems}</strong> {itemName}
              </>
            ) : (
              `0 ${itemName}`
            )
          ) : (
            <>
              Page <strong className="font-semibold text-text">{currentPage}</strong> of{" "}
              <strong className="font-semibold text-text">{totalPages}</strong>
            </>
          )}
        </span>
      </div>

      {totalPages > 1 ? (
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* First page button */}
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={currentPage <= 1 || isLoading}
            aria-label="First page"
            title="First page"
            className="inline-flex h-9 w-9 items-center justify-center rounded-default border border-border bg-white text-text-secondary transition-colors hover:border-border-strong hover:bg-neutral-bg hover:text-text disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>

          {/* Previous page button */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isLoading}
            aria-label="Previous page"
            className="inline-flex h-9 items-center justify-center gap-1 rounded-default border border-border bg-white px-2.5 sm:px-3 text-sm font-medium text-text-secondary transition-colors hover:border-border-strong hover:bg-neutral-bg hover:text-text disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          {/* Numbered page buttons */}
          <div className="flex items-center gap-1">
            {range.map((item, idx) => {
              if (typeof item === "string") {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="inline-flex h-9 w-8 items-center justify-center text-xs tracking-wider text-text-muted select-none"
                    aria-hidden="true"
                  >
                    •••
                  </span>
                );
              }

              const isActive = item === currentPage;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => onPageChange(item)}
                  disabled={isLoading}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={`Page ${item}`}
                  className={cn(
                    "inline-flex h-9 min-w-9 items-center justify-center rounded-default px-2.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
                    isActive
                      ? "bg-primary text-white font-semibold shadow-xs"
                      : "border border-border bg-white text-text hover:border-border-strong hover:bg-neutral-bg hover:text-text",
                  )}
                >
                  {item}
                </button>
              );
            })}
          </div>

          {/* Next page button */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || isLoading}
            aria-label="Next page"
            className="inline-flex h-9 items-center justify-center gap-1 rounded-default border border-border bg-white px-2.5 sm:px-3 text-sm font-medium text-text-secondary transition-colors hover:border-border-strong hover:bg-neutral-bg hover:text-text disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Last page button */}
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages || isLoading}
            aria-label="Last page"
            title="Last page"
            className="inline-flex h-9 w-9 items-center justify-center rounded-default border border-border bg-white text-text-secondary transition-colors hover:border-border-strong hover:bg-neutral-bg hover:text-text disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>

          {/* Quick jump input for larger page counts */}
          {showQuickJumper && totalPages > 5 ? (
            <form
              onSubmit={handleJumpSubmit}
              className="hidden lg:flex items-center gap-1.5 pl-2 border-l border-border text-xs text-text-muted"
            >
              <span>Go to</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={jumpPage}
                onChange={(e) => setJumpPage(e.target.value)}
                placeholder={String(currentPage)}
                disabled={isLoading}
                aria-label="Go to page number"
                className="h-8 w-14 rounded-default border border-border bg-white px-2 text-center text-xs text-text placeholder:text-text-muted focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !jumpPage.trim()}
                className="h-8 rounded-default border border-border bg-white px-2 text-xs font-medium text-text hover:bg-neutral-bg hover:border-border-strong transition-colors disabled:pointer-events-none disabled:opacity-40"
              >
                Go
              </button>
            </form>
          ) : null}
        </div>
      ) : null}
    </nav>
  );
}
