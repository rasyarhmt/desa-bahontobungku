import type { ReactNode } from "react";
import { FaEdit, FaMoneyCheckAlt, FaPlus, FaTrash } from "react-icons/fa";

import {
  AdminSectionHeader,
  AdminStatusBadge,
  AdminTableShell,
  adminPrimaryButtonClass,
} from "@/components/admin/admin-ui";
import { formatCurrency, getMonthName } from "@/lib/format";

import type { DanaKeluarDisplay } from "./apbdesShared";

interface DanaKeluarTableProps {
  items: DanaKeluarDisplay[];
  totalPengeluaran: number;
  selectedYear: string;
  onAdd: () => void;
  onEdit: (item: DanaKeluarDisplay) => void;
  onDelete: (id: number) => void;
  footer?: ReactNode;
}

const actionButtonClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface-container-lowest text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary";

export default function DanaKeluarTable({
  items,
  totalPengeluaran,
  selectedYear,
  onAdd,
  onEdit,
  onDelete,
  footer,
}: DanaKeluarTableProps) {
  const headerClass =
    "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground";
  const cellClass = "px-4 py-3 text-on-surface";

  return (
    <AdminTableShell
      footer={
        <>
          <div className="flex items-center justify-between gap-3 border-t border-border bg-destructive/10 px-6 py-3 text-sm text-destructive">
            <span className="font-medium">Total</span>
            <span className="font-semibold tabular-nums">
              {formatCurrency(totalPengeluaran)}
            </span>
          </div>
          {footer}
        </>
      }
    >
      <div className="p-5 sm:p-6">
        <AdminSectionHeader
          icon={<FaMoneyCheckAlt />}
          title="Data Pengeluaran"
          description={`Rekap dana keluar tahun ${selectedYear}`}
          action={
            <button type="button" onClick={onAdd} className={adminPrimaryButtonClass}>
              <FaPlus /> Tambah Pengeluaran
            </button>
          }
        />

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-on-surface-variant">
            <thead>
              <tr className="border-b border-border bg-surface-container-low">
                <th className={`${headerClass} text-left`}>ID</th>
                <th className={`${headerClass} text-left`}>Tahun</th>
                <th className={`${headerClass} text-left`}>Bulan</th>
                <th className={`${headerClass} text-right`}>Jumlah</th>
                <th className={`${headerClass} text-left`}>Kategori</th>
                <th className={`${headerClass} text-left`}>Keterangan</th>
                <th className={`${headerClass} text-right`}>Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    Tidak ada data pengeluaran untuk tahun {selectedYear}
                  </td>
                </tr>
              )}
              {items.map((item) => (
                <tr key={item.id} className="transition-colors hover:bg-surface-container-low">
                  <td className={cellClass}>{item.id}</td>
                  <td className={cellClass}>{item.tahun}</td>
                  <td className={`${cellClass} font-medium`}>
                    {getMonthName(item.bulan ?? 0)}
                  </td>
                  <td className={`${cellClass} text-right font-semibold tabular-nums text-destructive`}>
                    {formatCurrency(Number(item.jumlah ?? 0))}
                  </td>
                  <td className={cellClass}>
                    <AdminStatusBadge label={item.kategori ?? "-"} />
                  </td>
                  <td className={`${cellClass} max-w-xs truncate`}>
                    {item.keterangan}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className={actionButtonClass}
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        className={`${actionButtonClass} hover:text-destructive`}
                        title="Hapus"
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
      </div>
    </AdminTableShell>
  );
}
