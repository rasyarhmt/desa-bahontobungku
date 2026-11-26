import { FileSearch, TriangleAlert } from "lucide-react";

import ServiceCard from "@/components/Pelayanan/ServiceCard";
import type { ServiceItem } from "@/components/Pelayanan/pelayananView";
import { CONTAINER_CLASS, INNER_SECTION_CLASS } from "@/lib/utils";

interface ServiceCatalogProps {
  items: ServiceItem[];
  query: string;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

export default function ServiceCatalog({
  items,
  query,
  isLoading,
  error,
  onRetry,
}: ServiceCatalogProps) {
  const normalizedQuery = query.trim().toLowerCase();
  const visibleItems = normalizedQuery
    ? items.filter((item) =>
        `${item.title} ${item.description}`.toLowerCase().includes(normalizedQuery),
      )
    : items;

  return (
    <section
      id="katalog-layanan"
      className={`${INNER_SECTION_CLASS} ${CONTAINER_CLASS}`}
    >
      <div className="mb-10 flex flex-col gap-3 md:mb-12 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            01 / Katalog Administrasi
          </span>
          <h2 className="font-display text-2xl font-bold text-on-surface md:text-3xl">
            Pilih Layanan Surat Online
          </h2>
          <p className="text-sm text-on-surface-variant md:text-base">
            Pilih jenis surat yang tersedia di sistem dan lengkapi data yang
            diminta.
          </p>
        </div>
        <span className="rounded-full bg-surface-container px-3 py-1 text-xs font-semibold text-primary">
          {visibleItems.length} layanan
        </span>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-64 animate-pulse rounded-2xl bg-surface-container/60"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <TriangleAlert className="mx-auto size-8 text-destructive" />
          <p className="mt-3 text-sm font-medium text-destructive">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 rounded-full bg-primary px-5 py-2 text-xs font-semibold text-on-primary transition-colors hover:bg-primary-container"
          >
            Coba Lagi
          </button>
        </div>
      ) : visibleItems.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visibleItems.map((item) => (
            <ServiceCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-surface-container-low py-12 text-center">
          <FileSearch className="mx-auto mb-2 size-12 text-outline" />
          <h3 className="font-display text-lg font-semibold text-on-surface">
            {normalizedQuery ? "Layanan tidak ditemukan" : "Belum ada layanan"}
          </h3>
          <p className="mt-1 text-sm text-on-surface-variant">
            {normalizedQuery
              ? "Coba kata kunci lain untuk mencari layanan."
              : "Layanan akan muncul setelah ditambahkan di sistem."}
          </p>
        </div>
      )}
    </section>
  );
}
