import {
  FaNewspaper,
  FaCalendarAlt,
  FaUser,
  FaSpinner,
  FaTimesCircle,
} from "react-icons/fa";

import { formatDateLong, formatImageUrl } from "@/lib/format";

import { getStatusColor, type BeritaItem } from "./beritaShared";

interface BeritaPreviewModalProps {
  isOpen: boolean;
  item: BeritaItem | null;
  onClose: () => void;
  onToggleStatus: (id: number) => void;
  isActionLoading: boolean;
}

export default function BeritaPreviewModal({
  isOpen,
  item,
  onClose,
  onToggleStatus,
  isActionLoading,
}: BeritaPreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-gray-700/30 flex items-center justify-center z-50 transition-all duration-300">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-200 animate-modalFadeIn">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            <FaNewspaper className="inline-block mr-2 text-purple-500" />
            Preview Berita
          </h3>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          {item?.foto ? (
            <img
              src={formatImageUrl(item.foto)}
              alt={item.judul}
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
          ) : (
            <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
              <FaNewspaper className="text-gray-300 text-5xl" />
            </div>
          )}

          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {item?.judul}
          </h2>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              <FaCalendarAlt className="inline-block mr-1" />
              {item?.tanggalTerbit && formatDateLong(item.tanggalTerbit)}
            </span>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              <FaUser className="inline-block mr-1" />
              {item?.penulis}
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                item?.status,
              )}`}
            >
              {item?.status || "Dipublikasi"}
            </span>
          </div>

          <div className="text-gray-700 px-4">
            <p className="font-medium mb-2">Konten Lengkap:</p>
            {item?.isi ? (
              <div className="prose max-w-none">{item.isi}</div>
            ) : (
              <p className="text-gray-500 italic">Konten belum tersedia.</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Tutup
          </button>
          {item?.status === "Draft" ? (
            <button
              onClick={() => item && onToggleStatus(item.id)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <FaNewspaper className="text-white" />
                  <span>Publikasikan</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => item && onToggleStatus(item.id)}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2"
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <FaTimesCircle className="text-white" />
                  <span>Ubah ke Draft</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
