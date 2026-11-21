import { Wallet, Plus, Pencil, Trash2 } from "lucide-react";

import { formatCurrency, getMonthName } from "@/lib/format";

import type { DanaKeluarDisplay } from "./apbdesShared";

interface DanaKeluarTableProps {
  items: DanaKeluarDisplay[];
  totalPengeluaran: number;
  selectedYear: string;
  onAdd: () => void;
  onEdit: (item: DanaKeluarDisplay) => void;
  onDelete: (id: number) => void;
}

export default function DanaKeluarTable({
  items,
  totalPengeluaran,
  selectedYear,
  onAdd,
  onEdit,
  onDelete,
}: DanaKeluarTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-50 p-2">
              <Wallet aria-hidden="true" className="size-5 text-red-700" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">
              Data Pengeluaran
            </h2>
          </div>
          <button
            type="button"
            onClick={onAdd}
            className="flex min-h-11 items-center gap-2 rounded-xl bg-[#0b6393] px-4 py-2 text-base font-semibold text-white transition-colors hover:bg-[#0a547d]"
          >
            <Plus aria-hidden="true" className="size-5" />
            <span>Tambah Pengeluaran</span>
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
                  Kategori
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
                    <td className="px-4 py-4 text-right text-base font-semibold text-red-700">
                      {formatCurrency(Number(item.jumlah ?? 0))}
                    </td>
                    <td className="px-4 py-4 text-base text-slate-800">
                      <span className="inline-flex rounded-lg bg-slate-100 px-3 py-1 text-base font-semibold text-slate-700">
                        {item.kategori}
                      </span>
                    </td>
                    <td className="max-w-xs px-4 py-4 text-base text-slate-800">
                      {item.keterangan}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(item)}
                          title="Edit pengeluaran"
                          aria-label={`Edit pengeluaran ${item.id}`}
                          className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-slate-100 p-2 text-slate-700 transition-colors hover:bg-slate-200"
                        >
                          <Pencil aria-hidden="true" className="size-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(item.id)}
                          title="Hapus pengeluaran"
                          aria-label={`Hapus pengeluaran ${item.id}`}
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
                    Tidak ada data pengeluaran untuk tahun {selectedYear}
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
                <td className="px-4 py-4 text-right text-base font-bold text-red-700">
                  {formatCurrency(totalPengeluaran)}
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
