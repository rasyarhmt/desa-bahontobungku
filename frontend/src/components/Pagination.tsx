import { ChevronLeft, ChevronRight } from "lucide-react";

import { getPaginationNumbers } from "@/lib/pagination";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
  ariaLabel?: string;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  onChange,
  ariaLabel = "Paginasi",
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label={ariaLabel}
      className={cn(
        "flex flex-wrap items-center justify-center gap-2",
        className ?? "mt-10",
      )}
    >
      <button
        type="button"
        onClick={() => onChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Halaman sebelumnya"
        className={cn(
          "flex size-9 items-center justify-center rounded-full text-sm font-semibold transition-colors",
          currentPage === 1
            ? "cursor-not-allowed bg-surface-container text-outline-variant"
            : "bg-surface-container text-on-surface hover:bg-primary hover:text-on-primary",
        )}
      >
        <ChevronLeft className="size-4" />
      </button>

      {getPaginationNumbers(currentPage, totalPages).map((page, index) =>
        typeof page === "number" ? (
          <button
            key={`page-${page}`}
            type="button"
            onClick={() => onChange(page)}
            aria-current={page === currentPage ? "page" : undefined}
            className={cn(
              "size-9 rounded-full text-xs font-semibold transition-colors",
              page === currentPage
                ? "bg-primary text-on-primary shadow-sm"
                : "bg-surface-container text-on-surface hover:bg-surface-container-high",
            )}
          >
            {page}
          </button>
        ) : (
          <span
            key={`ellipsis-${index}`}
            className="flex size-9 items-center justify-center text-xs text-outline"
          >
            {page}
          </span>
        ),
      )}

      <button
        type="button"
        onClick={() => onChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Halaman berikutnya"
        className={cn(
          "flex size-9 items-center justify-center rounded-full text-sm font-semibold transition-colors",
          currentPage === totalPages
            ? "cursor-not-allowed bg-surface-container text-outline-variant"
            : "bg-surface-container text-on-surface hover:bg-primary hover:text-on-primary",
        )}
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}
