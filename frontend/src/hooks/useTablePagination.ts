import { useEffect, useMemo, useState } from "react";

export const TABLE_PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100];

export interface UseTablePaginationOptions {
  initialPageSize?: number;
  resetKey?: string | number;
}

export function useTablePagination<T>(
  items: T[],
  { initialPageSize = 10, resetKey }: UseTablePaginationOptions = {},
) {
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [page, setPage] = useState(1);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const pageItems = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize],
  );

  useEffect(() => {
    setPage(1);
  }, [resetKey]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const setPageSize = (size: number) => {
    setPageSizeState(size);
    setPage(1);
  };

  return {
    page,
    setPage,
    pageSize,
    setPageSize,
    pageItems,
    totalItems,
    totalPages,
    rangeStart: totalItems === 0 ? 0 : (page - 1) * pageSize + 1,
    rangeEnd: Math.min(page * pageSize, totalItems),
  };
}
