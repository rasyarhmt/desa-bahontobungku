import {
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSpinner,
} from "react-icons/fa";

import { getMediaIcon, type MediaItem } from "./mediaShared";

interface MediaTableProps {
  items: MediaItem[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onAdd: () => void;
  onPreview: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function MediaTable({
  items,
  isLoading,
  error,
  onRetry,
  onAdd,
  onPreview,
  onEdit,
  onDelete,
}: MediaTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Daftar Media</h2>
          <p className="text-gray-600 text-sm">
            Kelola media yang tersedia di website desa
          </p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          <FaPlus className="text-white" />
          <span>Tambah Media</span>
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <FaSpinner className="animate-spin text-purple-500 text-4xl mx-auto mb-4" />
          <p className="text-gray-600">Memuat data media...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">
          <p>{error}</p>
          <button
            onClick={onRetry}
            className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="pl-4 py-3 text-left text-sm font-medium text-gray-600 rounded-tl-lg">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Nama
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Tipe
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Deskripsi
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600 rounded-tr-lg">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.length > 0 ? (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="pl-4 py-3 text-sm text-gray-800">
                      {item.id}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      <span>{item.nama}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      <div className="flex items-center gap-2">
                        {getMediaIcon(item.tipe ?? "")}
                        {(item.tipe ?? "").charAt(0).toUpperCase() +
                          (item.tipe ?? "").slice(1)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800 truncate max-w-xs">
                      {item.deskripsi}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onPreview(item.id)}
                          className="p-1.5 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
                          title="Pratinjau"
                        >
                          <FaEye className="text-blue-600" />
                        </button>
                        <button
                          onClick={() => onEdit(item.id)}
                          className="p-1.5 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                          title="Edit"
                        >
                          <FaEdit className="text-gray-600" />
                        </button>
                        <button
                          onClick={() => onDelete(item.id)}
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
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    Tidak ada data media yang ditemukan.
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
