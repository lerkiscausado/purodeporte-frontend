"use client";

import { Button } from "@/components/ui/button";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
  itemLabel?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  itemLabel = "elementos",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = (current: number, total: number) => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const pages: (number | string)[] = [1];
    if (current > 3) {
      pages.push("...");
    }
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (current < total - 2) {
      pages.push("...");
    }
    pages.push(total);
    return pages;
  };

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-sm border border-border/60 shadow-sm mt-6">
      <span className="text-xs font-semibold text-muted-foreground order-2 sm:order-1">
        Mostrando <strong className="text-foreground font-bold">{startItem}</strong> -{" "}
        <strong className="text-foreground font-bold">{endItem}</strong> de{" "}
        <strong className="text-foreground font-bold">{totalItems}</strong> {itemLabel}
      </span>

      <div className="flex items-center gap-1.5 order-1 sm:order-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="h-8 px-2.5 text-xs font-bold uppercase rounded-sm border-border/60 hover:bg-muted/40 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <FaChevronLeft className="h-2.5 w-2.5 mr-1" />
          Anterior
        </Button>

        <div className="flex items-center gap-1">
          {pageNumbers.map((page, idx) => {
            if (page === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 py-1 text-xs text-muted-foreground font-bold"
                >
                  ...
                </span>
              );
            }
            const isCurrent = page === currentPage;
            return (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page as number)}
                className={cn(
                  "h-8 min-w-8 px-2 flex items-center justify-center rounded-sm text-xs font-bold transition-all cursor-pointer",
                  isCurrent
                    ? "bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/40"
                    : "bg-muted/20 text-muted-foreground border border-border/60 hover:bg-muted/60 hover:text-foreground"
                )}
              >
                {page}
              </button>
            );
          })}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="h-8 px-2.5 text-xs font-bold uppercase rounded-sm border-border/60 hover:bg-muted/40 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Siguiente
          <FaChevronRight className="h-2.5 w-2.5 ml-1" />
        </Button>
      </div>
    </div>
  );
}
