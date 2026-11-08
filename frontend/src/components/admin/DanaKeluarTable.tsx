import { FaMoneyCheckAlt, FaPlus, FaEdit, FaTrash } from "react-icons/fa";

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
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <FaMoneyCheckAlt className="text-red-500 text-xl" />
            </div>
            <h2 className="font-semibold text-xl text-gray-800">
              Data Pengeluaran
            </h2>
          </div>
          <button
            onClick={onAdd}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FaPlus size={16} />
            <span>Tambah Pengeluaran</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-gray-600">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 bg-red-50 rounded-tl-lg">
                  ID
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 bg-red-50">
                  Tahun
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 bg-red-50">
                  Bulan
                </th>
                <th className="px-4 py-3 text-right font-medium text-gray-700 bg-red-50">
                  Jumlah
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 bg-red-50">
                  Kategori
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 bg-red-50">
                  Keterangan
                </th>
                <th className="px-4 py-3 text-right font-medium text-gray-700 bg-red-50 rounded-tr-lg">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.length > 0 ? (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {item.id}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {item.tahun}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                      {getMonthName(item.bulan ?? 0)}
                    </td>
                    <td className="px-4 py-3 text-sm text-red-600 font-mono font-medium text-right">
                      {formatCurrency(Number(item.jumlah ?? 0))}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium">
                        {item.kategori}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800 max-w-xs truncate">
                      {item.keterangan}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onEdit(item)}
                          className="p-1.5 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors shadow-sm"
                          title="Edit"
                        >
                          <FaEdit className="text-blue-600" />
                        </button>
                        <button
                          onClick={() => onDelete(item.id)}
                          className="p-1.5 bg-red-100 rounded-md hover:bg-red-200 transition-colors shadow-sm"
                          title="Hapus"
                        >
                          <FaTrash className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-500 italic"
                  >
                    Tidak ada data pengeluaran untuk tahun {selectedYear}
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-3 font-medium text-right bg-red-50 rounded-bl-lg"
                >
                  Total:
                </td>
                <td className="px-4 py-3 font-medium text-right bg-red-50 text-red-600 font-mono">
                  {formatCurrency(totalPengeluaran)}
                </td>
                <td
                  colSpan={3}
                  className="px-4 py-3 bg-red-50 rounded-br-lg"
                ></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
