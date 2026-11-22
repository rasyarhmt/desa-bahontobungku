import {
  FaCheck,
  FaEdit,
  FaEye,
  FaImage,
  FaPlus,
  FaTimesCircle,
  FaTrash,
} from "react-icons/fa";

import {
  AdminSearchInput,
  AdminSectionHeader,
  AdminStatusBadge,
  AdminTableShell,
  AdminToolbar,
  adminPrimaryButtonClass,
} from "@/components/admin/admin-ui";
import { formatDateLong, formatImageUrl } from "@/lib/format";

import type { BeritaItem } from "./beritaShared";

interface BeritaTableProps {
  items: BeritaItem[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onRetry: () => void;
  onAdd: () => void;
  onPreview: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number) => void;
}

export default function BeritaTable({
  items,
  isLoading,
  error,
  searchQuery,
  onSearchChange,
  onRetry,
  onAdd,
  onPreview,
  onEdit,
  onDelete,
  onToggleStatus,
}: BeritaTableProps) {
  return (
    <div className="space-y-4">
      <AdminToolbar>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <AdminSectionHeader
            title="Daftar Berita"
            description="Kelola berita dan artikel website desa"
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <AdminSearchInput
              value={searchQuery}
              onChange={onSearchChange}
              placeholder="Cari berita..."
              className="sm:w-72"
            />
            <button
              type="button"
              onClick={onAdd}
              className={adminPrimaryButtonClass}
            >
              <FaPlus />
              Tambah Berita
            </button>
          </div>
        </div>
      </AdminToolbar>

      <AdminTableShell
        loading={isLoading}
        error={error}
        onRetry={onRetry}
        empty={items.length === 0}
        emptyLabel="Tidak ada data berita yang ditemukan."
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead className="bg-surface-container-low text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">Judul</th>
                <th className="px-3 py-3 font-medium">Thumbnail</th>
                <th className="px-3 py-3 font-medium">Tanggal</th>
                <th className="px-3 py-3 font-medium">Penulis</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-6 py-3 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((berita) => (
                <tr
                  key={berita.id}
                  className="transition-colors hover:bg-surface-container-low"
                >
                  <td className="px-6 py-4 text-sm font-medium text-on-surface">
                    {berita.judul}
                  </td>
                  <td className="px-3 py-4">
                    {berita.foto ? (
                      <img
                        src={formatImageUrl(berita.foto)}
                        alt={berita.judul}
                        className="h-12 w-12 rounded-xl border border-border object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container text-muted-foreground">
                        <FaImage />
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-on-surface-variant">
                    {formatDateLong(berita.tanggalTerbit)}
                  </td>
                  <td className="px-3 py-4 text-sm text-on-surface-variant">
                    {berita.penulis}
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-2">
                      <AdminStatusBadge
                        label={berita.status || "Dipublikasi"}
                        tone={
                          berita.status === "Draft" ? "warning" : "success"
                        }
                      />
                      <button
                        type="button"
                        onClick={() => onToggleStatus(berita.id)}
                        aria-label={
                          berita.status === "Dipublikasi"
                            ? `Ubah ${berita.judul} ke draft`
                            : `Publikasikan ${berita.judul}`
                        }
                        title={
                          berita.status === "Dipublikasi"
                            ? "Ubah ke Draft"
                            : "Publikasikan"
                        }
                        className={`inline-flex items-center justify-center rounded-xl p-2 text-xs transition-colors ${
                          berita.status === "Dipublikasi"
                            ? "bg-warning-bg text-warning-fg hover:bg-warning-bg/80"
                            : "bg-success-bg text-success-fg hover:bg-success-bg/80"
                        }`}
                      >
                        {berita.status === "Dipublikasi" ? (
                          <FaTimesCircle />
                        ) : (
                          <FaCheck />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onPreview(berita.id)}
                        aria-label={`Lihat detail ${berita.judul}`}
                        title="Lihat Detail"
                        className="rounded-xl p-2 text-primary transition-colors hover:bg-primary-fixed"
                      >
                        <FaEye />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(berita.id)}
                        aria-label={`Edit ${berita.judul}`}
                        title="Edit"
                        className="rounded-xl p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
                      >
                        <FaEdit />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(berita.id)}
                        aria-label={`Hapus ${berita.judul}`}
                        title="Hapus"
                        className="rounded-xl p-2 text-destructive transition-colors hover:bg-destructive/10"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminTableShell>
    </div>
  );
}
