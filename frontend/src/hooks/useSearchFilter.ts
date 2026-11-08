import { useState } from "react";

/**
 * Kelola state pencarian + hasil filter.
 *
 * @param items    Daftar sumber yang akan difilter.
 * @param matches  Predikat (item, query) => boolean. Terima `query` agar tidak
 *                 perlu menutup (close over) state di call site.
 */
export function useSearchFilter<T>(
  items: T[],
  matches: (item: T, query: string) => boolean,
  initialQuery = "",
) {
  const [query, setQuery] = useState(initialQuery);
  const filtered = items.filter((item) => matches(item, query));

  return { query, setQuery, filtered };
}
