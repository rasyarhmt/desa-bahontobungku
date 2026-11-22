import { FaEdit, FaMoneyBillWave, FaPlus, FaTrash } from "react-icons/fa";

import {
  AdminSectionHeader,
  AdminTableShell,
  adminPrimaryButtonClass,
} from "@/components/admin/admin-ui";
import { formatCurrency, getMonthName } from "@/lib/format";

import type { DanaMasukDisplay } from "./apbdesShared";

interface DanaMasukTableProps {
  items: DanaMasukDisplay[];
  totalPendapatan: number;
  selectedYear: string;
  onAdd: () => void;
  onEdit: (item: DanaMasukDisplay) => void;
  onDelete: (id: number) => void;
}

const actionButtonClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface-container-lowest text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary";

export default function DanaMasukTable({
  items,
  totalPendapatan,
  selectedYear,
  onAdd,
  onEdit,
  onDelete,
}: DanaMasukTableProps) {
  const headerClass =
    "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground";
  const cellClass = "px-4 py-3 text-on-surface";

  return (
    <AdminTableShell
      footer={
        <div className="flex items-center justify-between gap-3 border-t border-border bg-success-bg px-6 py-3 text-sm text-success-fg">
          <span className="font-medium">Total</span>
          <span className="font-semibold tabular-nums">
            {formatCurrency(totalPendapatan)}
          </span>
        </div>
      }
    >
      <div className="p-5 sm:p-6">
        <AdminSectionHeader
          icon={<FaMoneyBillWave />}
          title="Data Pendapatan"
          description={`Rekap dana masuk tahun ${selectedYear}`}
          action={
            <button type="button" onClick={onAdd} className={adminPrimaryButtonClass}>
              <FaPlus /> Tambah Pendapatan
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
                <th className={`${headerClass} text-left`}>Sumber</th>
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
                    Tidak ada data pendapatan untuk tahun {selectedYear}
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
                  <td className={`${cellClass} text-right font-semibold tabular-nums text-success-fg`}>
                    {formatCurrency(Number(item.jumlah ?? 0))}
                  </td>
                  <td className={cellClass}>{item.sumber}</td>
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
