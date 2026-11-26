import { AlertTriangle, Loader2, Newspaper } from "lucide-react";

import { INNER_SECTION_CLASS } from "@/lib/utils";

export function BeritaLoading() {
  return (
    <div className={`flex justify-center ${INNER_SECTION_CLASS}`}>
      <Loader2 className="size-10 animate-spin text-primary" />
    </div>
  );
}

export function BeritaError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className={`flex flex-col items-center ${INNER_SECTION_CLASS} text-center`}>
      <AlertTriangle className="mb-3 size-10 text-tertiary-container" />
      <p className="text-sm text-on-surface-variant">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-on-primary transition-colors hover:bg-tertiary-container"
      >
        Coba Lagi
      </button>
    </div>
  );
}

export function BeritaEmpty({ query = "" }: { query?: string }) {
  return (
    <div className="rounded-3xl bg-surface-container-lowest p-16 text-center shadow-sm">
      <Newspaper className="mx-auto mb-4 size-12 text-outline-variant" />
      <p className="text-sm font-semibold text-on-surface">
        {query ? "Tidak ada berita yang cocok" : "Belum ada berita"}
      </p>
      <p className="mt-1 text-xs text-on-surface-variant">
        {query
          ? "Coba kata kunci lain atau lihat seluruh arsip berita."
          : "Berita yang dipublikasikan akan tampil di halaman ini."}
      </p>
    </div>
  );
}
