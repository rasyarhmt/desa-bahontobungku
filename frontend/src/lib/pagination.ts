/** Hitung nomor halaman yang ditampilkan (dengan elipsis "..."). */
export const getPaginationNumbers = (
  currentPage: number,
  totalPages: number,
  maxVisiblePages = 3,
): (number | string)[] => {
  const pages: (number | string)[] = [];

  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  pages.push(1);

  let startPage = Math.max(2, currentPage - 1);
  let endPage = Math.min(totalPages - 1, currentPage + 1);

  if (currentPage <= 2) {
    endPage = Math.min(totalPages - 1, 3);
  } else if (currentPage >= totalPages - 1) {
    startPage = Math.max(2, totalPages - 2);
  }

  if (startPage > 2) {
    pages.push("...");
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  if (endPage < totalPages - 1) {
    pages.push("...");
  }

  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
};
