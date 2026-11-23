import Pagination from "@/components/Pagination";
import { TABLE_PAGE_SIZE_OPTIONS } from "@/hooks/useTablePagination";

interface AdminTablePaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  label?: string;
}

export default function AdminTablePagination({
  page,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
  onPageSizeChange,
  label = "data",
}: AdminTablePaginationProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-6 py-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <span>
          Menampilkan{" "}
          <span className="font-medium text-on-surface">
            {totalItems === 0 ? 0 : (page - 1) * pageSize + 1}
          </span>
          –<span className="font-medium text-on-surface">
            {Math.min(page * pageSize, totalItems)}
          </span>{" "}
          dari <span className="font-medium text-on-surface">{totalItems}</span>{" "}
          {label}
        </span>
        <label className="flex items-center gap-2">
          Tampilkan
          <select
            aria-label="Jumlah data per halaman"
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="rounded-lg border border-border bg-surface-container-lowest px-2 py-1 text-sm text-on-surface outline-none transition focus:border-primary"
          >
            {TABLE_PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          per halaman
        </label>
      </div>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onChange={onPageChange}
        ariaLabel="Paginasi tabel admin"
      />
    </div>
  );
}
