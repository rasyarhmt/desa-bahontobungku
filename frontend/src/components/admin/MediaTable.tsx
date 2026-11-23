import {
  FaChevronLeft,
  FaChevronRight,
  FaEdit,
  FaEye,
  FaPlus,
  FaSpinner,
  FaTrash,
} from "react-icons/fa";

import { adminMediaUtils } from "@/lib/api/admin";
import { formatDateShort } from "@/lib/format";

import { getMediaIcon, type MediaItem } from "./mediaShared";

export type MediaViewMode = "tabel" | "grid";

interface MediaTableProps {
  items: MediaItem[];
  viewMode: MediaViewMode;
  selectedIds: number[];
  allVisibleSelected: boolean;
  isLoading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onRetry: () => void;
  onAdd: () => void;
  onPreview: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onToggleSelect: (id: number) => void;
  onToggleAll: () => void;
  onPageChange: (page: number) => void;
}

const typeBadgeClass: Record<string, string> = {
  foto: "bg-primary-fixed text-on-primary-fixed",
  video: "bg-secondary-container text-on-secondary-container",
  dokumen: "bg-surface-container-high text-on-surface",
};

const getTypeBadgeClass = (type: string) =>
  typeBadgeClass[type.toLowerCase()] ?? "bg-surface-container text-on-surface-variant";

const getPreviewUrl = (item: MediaItem) => {
  if (item.tipe === "video") {
    return (
      adminMediaUtils.getVideoThumbnail(item) ||
      adminMediaUtils.getMediaUrl(item.file)
    );
  }
  if (item.tipe === "foto") return adminMediaUtils.getMediaUrl(item.file);
  return null;
};

const TypeBadge = ({ type }: { type: string }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getTypeBadgeClass(type)}`}
  >
    {getMediaIcon(type)}
    {type || "-"}
  </span>
);

const RowActions = ({
  item,
  onPreview,
  onEdit,
  onDelete,
}: {
  item: MediaItem;
  onPreview: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}) => (
  <div className="flex items-center justify-end gap-1.5">
    <button
      type="button"
      onClick={() => onPreview(item.id)}
      className="rounded-xl p-2 text-primary transition-colors hover:bg-primary-fixed"
      title="Pratinjau"
      aria-label={`Pratinjau ${item.nama}`}
    >
      <FaEye />
    </button>
    <button
      type="button"
      onClick={() => onEdit(item.id)}
      className="rounded-xl p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
      title="Edit"
      aria-label={`Edit ${item.nama}`}
    >
      <FaEdit />
    </button>
    <button
      type="button"
      onClick={() => onDelete(item.id)}
      className="rounded-xl p-2 text-destructive transition-colors hover:bg-destructive/10"
      title="Hapus"
      aria-label={`Hapus ${item.nama}`}
    >
      <FaTrash />
    </button>
  </div>
);

export default function MediaTable({
  items,
  viewMode,
  selectedIds,
  allVisibleSelected,
  isLoading,
  error,
  page,
  totalPages,
  totalItems,
  pageSize,
  onRetry,
  onAdd,
  onPreview,
  onEdit,
  onDelete,
  onToggleSelect,
  onToggleAll,
  onPageChange,
}: MediaTableProps) {
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-surface-container-lowest shadow-sm">
      <div className="flex flex-col gap-4 border-b border-border px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-on-surface">
            Daftar Media
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Kelola berkas yang tersedia di website desa.
          </p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex w-fit items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary transition-colors hover:bg-primary/90"
        >
          <FaPlus />
          Tambah Media
        </button>
      </div>

      {isLoading ? (
        <div className="flex min-h-[280px] items-center justify-center">
          <div className="text-center">
            <FaSpinner className="mx-auto mb-4 animate-spin text-3xl text-primary" />
            <p className="text-sm text-muted-foreground">Memuat data media...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex min-h-[280px] items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-destructive">{error}</p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary transition-colors hover:bg-primary/90"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="flex min-h-[280px] items-center justify-center px-6 text-center">
          <div>
            <p className="text-sm font-medium text-on-surface">
              Tidak ada media ditemukan.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Coba ubah pencarian atau filter yang aktif.
            </p>
          </div>
        </div>
      ) : viewMode === "tabel" ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-surface-container-low text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="w-12 px-6 py-3">
                  <input
                    type="checkbox"
                    aria-label="Pilih semua media pada halaman ini"
                    checked={allVisibleSelected}
                    onChange={onToggleAll}
                    className="h-4 w-4 accent-primary"
                  />
                </th>
                <th className="px-3 py-3 font-medium">Berkas</th>
                <th className="px-3 py-3 font-medium">Tipe</th>
                <th className="px-3 py-3 font-medium">Dibuat</th>
                <th className="px-6 py-3 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => {
                const previewUrl = getPreviewUrl(item);
                return (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-surface-container-low"
                  >
                    <td className="px-6 py-4 align-middle">
                      <input
                        type="checkbox"
                        aria-label={`Pilih ${item.nama}`}
                        checked={selectedIds.includes(item.id)}
                        onChange={() => onToggleSelect(item.id)}
                        className="h-4 w-4 accent-primary"
                      />
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-container">
                          {previewUrl ? (
                            <img
                              src={previewUrl}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-lg">{getMediaIcon(item.tipe ?? "")}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-on-surface">
                            {item.nama}
                          </p>
                          <p className="mt-0.5 line-clamp-1 max-w-md text-xs text-muted-foreground">
                            {item.deskripsi || "Tanpa deskripsi"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <TypeBadge type={item.tipe ?? ""} />
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-on-surface-variant">
                      {formatDateShort(item.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <RowActions
                        item={item}
                        onPreview={onPreview}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const previewUrl = getPreviewUrl(item);
            return (
              <article
                key={item.id}
                className="overflow-hidden rounded-2xl border border-border bg-surface transition-colors hover:border-primary/40"
              >
                <div className="relative flex h-40 items-center justify-center overflow-hidden bg-surface-container">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl">{getMediaIcon(item.tipe ?? "")}</span>
                  )}
                  <input
                    type="checkbox"
                    aria-label={`Pilih ${item.nama}`}
                    checked={selectedIds.includes(item.id)}
                    onChange={() => onToggleSelect(item.id)}
                    className="absolute left-3 top-3 h-4 w-4 accent-primary"
                  />
                </div>
                <div className="space-y-3 p-4">
                  <div>
                    <p className="truncate text-sm font-semibold text-on-surface">
                      {item.nama}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {item.deskripsi || "Tanpa deskripsi"}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <TypeBadge type={item.tipe ?? ""} />
                    <span className="text-xs text-muted-foreground">
                      {formatDateShort(item.created_at)}
                    </span>
                  </div>
                  <RowActions
                    item={item}
                    onPreview={onPreview}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-6 py-4">
        <p className="text-sm text-muted-foreground">
          Menampilkan <span className="font-medium text-on-surface">{start}</span>–
          <span className="font-medium text-on-surface">{end}</span> dari{" "}
          <span className="font-medium text-on-surface">{totalItems}</span> media
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Halaman sebelumnya"
            className="rounded-xl border border-border p-2 text-on-surface-variant transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FaChevronLeft />
          </button>
          <span className="text-sm font-medium text-on-surface">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Halaman berikutnya"
            className="rounded-xl border border-border p-2 text-on-surface-variant transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
    </section>
  );
}
