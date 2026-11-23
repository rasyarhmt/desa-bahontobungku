import type { ReactNode } from "react";
import { FaEdit, FaEye, FaPlus, FaTrash } from "react-icons/fa";

import {
  AdminSearchInput,
  AdminStatusBadge,
  AdminTableShell,
  AdminToolbar,
  adminPrimaryButtonClass,
} from "@/components/admin/admin-ui";
import { type SuratItem } from "@/lib/api/admin";
import { formatDateShort } from "@/lib/format";

interface SuratTableProps {
  items: SuratItem[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onRetry: () => void;
  onAdd: () => void;
  onPreview: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  footer?: ReactNode;
}

const thClass =
  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground";
const tdClass = "px-4 py-3.5 text-sm text-on-surface-variant";
const iconButtonClass =
  "rounded-xl p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface";

export default function SuratTable({
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
  footer,
}: SuratTableProps) {
  return (
    <div className="space-y-4">
      <AdminToolbar>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-on-surface">
              Daftar Arsip Surat
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Kelola arsip surat masuk dan keluar di sistem
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <AdminSearchInput
              value={searchQuery}
              onChange={onSearchChange}
              placeholder="Cari nomor, perihal, atau pengirim..."
              className="sm:w-72"
            />
            <button
              type="button"
              onClick={onAdd}
              className={adminPrimaryButtonClass}
            >
              <FaPlus />
              Tambah Surat
            </button>
          </div>
        </div>
      </AdminToolbar>

      <AdminTableShell
        loading={isLoading}
        error={error}
        onRetry={onRetry}
        empty={items.length === 0}
        emptyLabel="Tidak ada data surat yang ditemukan."
        footer={footer}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface-container-low">
                <th className={thClass}>No. Surat</th>
                <th className={thClass}>Jenis</th>
                <th className={thClass}>Perihal</th>
                <th className={thClass}>Pengirim/Penerima</th>
                <th className={thClass}>Tanggal</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((surat) => (
                <tr key={surat.id} className="transition-colors hover:bg-surface-container-low/60">
                  <td className={`${tdClass} font-medium text-on-surface`}>
                    {surat.nomor}
                  </td>
                  <td className={tdClass}>
                    <AdminStatusBadge
                      label={surat.jenis}
                      tone={surat.jenis === "Surat Masuk" ? "info" : "neutral"}
                    />
                  </td>
                  <td className={tdClass}>{surat.perihal}</td>
                  <td className={tdClass}>{surat.pengirim}</td>
                  <td className={tdClass}>{formatDateShort(surat.tanggal)}</td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onPreview(surat.id)}
                        className={iconButtonClass}
                        title="Lihat Detail"
                        aria-label={`Lihat detail surat ${surat.nomor}`}
                      >
                        <FaEye />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(surat.id)}
                        className={iconButtonClass}
                        title="Edit"
                        aria-label={`Edit surat ${surat.nomor}`}
                      >
                        <FaEdit />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(surat.id)}
                        className="rounded-xl p-2 text-on-surface-variant transition-colors hover:bg-destructive/10 hover:text-destructive"
                        title="Hapus"
                        aria-label={`Hapus surat ${surat.nomor}`}
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
