import { FaMoneyBillWave, FaPlus, FaEdit, FaTrash } from "react-icons/fa";

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
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <FaMoneyBillWave className="text-green-500 text-xl" />
            </div>
            <h2 className="font-semibold text-xl text-gray-800">
              Data Pendapatan
            </h2>
          </div>
          <button
            onClick={onAdd}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FaPlus size={16} />
            <span>Tambah Pendapatan</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-gray-600">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 bg-green-50 rounded-tl-lg">
                  ID
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 bg-green-50">
                  Tahun
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 bg-green-50">
                  Bulan
                </th>
                <th className="px-4 py-3 text-right font-medium text-gray-700 bg-green-50">
                  Jumlah
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 bg-green-50">
                  Sumber
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 bg-green-50">
                  Keterangan
                </th>
                <th className="px-4 py-3 text-right font-medium text-gray-700 bg-green-50 rounded-tr-lg">
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
                    <td className="px-4 py-3 text-sm text-green-600 font-mono font-medium text-right">
                      {formatCurrency(Number(item.jumlah ?? 0))}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {item.sumber}
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
                    Tidak ada data pendapatan untuk tahun {selectedYear}
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-3 font-medium text-right bg-green-50 rounded-bl-lg"
                >
                  Total:
                </td>
                <td className="px-4 py-3 font-medium text-right bg-green-50 text-green-600 font-mono">
                  {formatCurrency(totalPendapatan)}
                </td>
                <td
                  colSpan={3}
                  className="px-4 py-3 bg-green-50 rounded-br-lg"
                ></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
