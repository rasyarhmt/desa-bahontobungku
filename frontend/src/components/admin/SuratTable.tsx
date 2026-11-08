import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaSearch,
  FaSpinner,
} from "react-icons/fa";

import { type SuratItem } from "@/lib/api/admin";
import { formatDateShort } from "@/lib/format";

import { getSuratIcon } from "./suratShared";

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
}

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
}: SuratTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Daftar Arsip Surat</h2>
          <p className="text-gray-600 text-sm">
            Kelola arsip surat masuk dan keluar di sistem
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari surat..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 w-64"
            />
          </div>
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            <FaPlus className="text-white" />
            <span>Tambah Surat</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <FaSpinner className="animate-spin text-4xl text-purple-500 mx-auto mb-4" />
          <p className="mt-2 text-gray-600">Memuat data...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">
          <p>{error}</p>
          <button
            onClick={onRetry}
            className="mt-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 rounded-tl-lg">
                  No. Surat
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Jenis
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Perihal
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Pengirim/Penerima
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Tanggal
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600 rounded-tr-lg">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.length > 0 ? (
                items.map((surat, index) => (
                  <tr key={surat.id || index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                      {surat.nomor}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      <div className="flex items-center gap-2">
                        {getSuratIcon(surat.jenis)}
                        <span>{surat.jenis}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {surat.perihal}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {surat.pengirim}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {formatDateShort(surat.tanggal)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onPreview(surat.id)}
                          className="p-1.5 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
                          title="Lihat Detail"
                        >
                          <FaEye className="text-blue-600" />
                        </button>
                        <button
                          onClick={() => onEdit(surat.id)}
                          className="p-1.5 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                          title="Edit"
                        >
                          <FaEdit className="text-gray-600" />
                        </button>
                        <button
                          onClick={() => onDelete(surat.id)}
                          className="p-1.5 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
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
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Tidak ada data surat yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
