import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaSearch,
  FaCalendarAlt,
  FaUser,
  FaSpinner,
  FaCheck,
  FaTimesCircle,
  FaImage,
} from "react-icons/fa";

import { formatDateLong, formatImageUrl } from "@/lib/format";

import { getStatusColor, type BeritaItem } from "./beritaShared";

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
    <div className="bg-white rounded-2xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Daftar Berita</h2>
          <p className="text-gray-600 text-sm">
            Kelola berita dan artikel website desa
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari berita..."
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
            <span>Tambah Berita</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <FaSpinner className="animate-spin text-purple-500 text-4xl mx-auto mb-4" />
          <p className="text-gray-600">Memuat data berita...</p>
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
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 rounded-tl-lg">
                  Judul
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Thumbnail
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Tanggal
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Penulis
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600 rounded-tr-lg">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.length > 0 ? (
                items.map((berita) => (
                  <tr key={berita.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                      {berita.judul}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {berita.foto ? (
                        <img
                          src={formatImageUrl(berita.foto)}
                          alt={berita.judul}
                          className="w-12 h-12 object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                          <FaImage className="text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-gray-400" />
                        {formatDateLong(berita.tanggalTerbit)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      <div className="flex items-center gap-2">
                        <FaUser className="text-gray-400" />
                        {berita.penulis}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            berita.status,
                          )}`}
                        >
                          {berita.status || "Dipublikasi"}
                        </span>
                        <button
                          onClick={() => onToggleStatus(berita.id)}
                          className={`p-1 rounded-full ${
                            berita.status === "Dipublikasi"
                              ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                              : "bg-green-100 text-green-700 hover:bg-green-200"
                          }`}
                          title={
                            berita.status === "Dipublikasi"
                              ? "Ubah ke Draft"
                              : "Publikasikan"
                          }
                        >
                          {berita.status === "Dipublikasi" ? (
                            <FaTimesCircle className="text-xs" />
                          ) : (
                            <FaCheck className="text-xs" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onPreview(berita.id)}
                          className="p-1.5 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
                          title="Lihat Detail"
                        >
                          <FaEye className="text-blue-600" />
                        </button>
                        <button
                          onClick={() => onEdit(berita.id)}
                          className="p-1.5 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                          title="Edit"
                        >
                          <FaEdit className="text-gray-600" />
                        </button>
                        <button
                          onClick={() => onDelete(berita.id)}
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
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Tidak ada data berita yang ditemukan.
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
