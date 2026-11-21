import { Banknote, Plus, Pencil, Trash2 } from "lucide-react";

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

export default function DanaMasukTable({
  items,
  totalPendapatan,
  selectedYear,
  onAdd,
  onEdit,
  onDelete,
}: DanaMasukTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-2">
              <Banknote aria-hidden="true" className="size-5 text-emerald-700" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">
              Data Pendapatan
            </h2>
          </div>
          <button
            type="button"
            onClick={onAdd}
            className="flex min-h-11 items-center gap-2 rounded-xl bg-[#0b6393] px-4 py-2 text-base font-semibold text-white transition-colors hover:bg-[#0a547d]"
          >
            <Plus aria-hidden="true" className="size-5" />
            <span>Tambah Pendapatan</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="whitespace-nowrap px-4 py-4 text-base font-bold text-slate-900">
                  ID
                </th>
                <th className="whitespace-nowrap px-4 py-4 text-base font-bold text-slate-900">
                  Tahun
                </th>
                <th className="whitespace-nowrap px-4 py-4 text-base font-bold text-slate-900">
                  Bulan
                </th>
                <th className="whitespace-nowrap px-4 py-4 text-right text-base font-bold text-slate-900">
                  Jumlah
                </th>
                <th className="whitespace-nowrap px-4 py-4 text-base font-bold text-slate-900">
                  Sumber
                </th>
                <th className="whitespace-nowrap px-4 py-4 text-base font-bold text-slate-900">
                  Keterangan
                </th>
                <th className="whitespace-nowrap px-4 py-4 text-right text-base font-bold text-slate-900">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items.length > 0 ? (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4 text-base text-slate-800">
                      {item.id}
                    </td>
                    <td className="px-4 py-4 text-base text-slate-800">
                      {item.tahun}
                    </td>
                    <td className="px-4 py-4 text-base font-semibold text-slate-800">
                      {getMonthName(item.bulan ?? 0)}
                    </td>
                    <td className="px-4 py-4 text-right text-base font-semibold text-emerald-700">
                      {formatCurrency(Number(item.jumlah ?? 0))}
                    </td>
                    <td className="px-4 py-4 text-base text-slate-800">
                      {item.sumber}
                    </td>
                    <td className="max-w-xs px-4 py-4 text-base text-slate-800">
                      {item.keterangan}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(item)}
                          title="Edit pendapatan"
                          aria-label={`Edit pendapatan ${item.id}`}
                          className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-slate-100 p-2 text-slate-700 transition-colors hover:bg-slate-200"
                        >
                          <Pencil aria-hidden="true" className="size-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(item.id)}
                          title="Hapus pendapatan"
                          aria-label={`Hapus pendapatan ${item.id}`}
                          className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-red-50 p-2 text-red-700 transition-colors hover:bg-red-100"
                        >
                          <Trash2 aria-hidden="true" className="size-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-base text-slate-600"
                  >
                    Tidak ada data pendapatan untuk tahun {selectedYear}
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t border-slate-200 bg-slate-50">
                <td
                  colSpan={3}
                  className="px-4 py-4 text-right text-base font-bold text-slate-900"
                >
                  Total:
                </td>
                <td className="px-4 py-4 text-right text-base font-bold text-emerald-700">
                  {formatCurrency(totalPendapatan)}
                </td>
                <td colSpan={3} className="px-4 py-4"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
