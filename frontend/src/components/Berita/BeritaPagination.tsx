import { ChevronLeft, ChevronRight } from "lucide-react";

import { getPaginationNumbers } from "@/lib/pagination";
import { cn } from "@/lib/utils";

interface BeritaPaginationProps {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export default function BeritaPagination({
  currentPage,
  totalPages,
  onChange,
}: BeritaPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Paginasi berita"
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
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
