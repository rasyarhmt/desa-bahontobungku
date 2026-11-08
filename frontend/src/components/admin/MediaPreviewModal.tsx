import { useEffect, useState } from "react";
import {
  FaSpinner,
  FaDownload,
  FaTimesCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

import { adminMediaUtils } from "@/lib/api/admin";
import { formatDateLong } from "@/lib/format";
import { toast } from "@/lib/toast";

import { getMediaIcon, type MediaItem } from "./mediaShared";

interface MediaPreviewModalProps {
  isOpen: boolean;
  item: MediaItem | null;
  onClose: () => void;
}

export default function MediaPreviewModal({
  isOpen,
  item,
  onClose,
}: MediaPreviewModalProps) {
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaError, setMediaError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMediaLoading(true);
      setMediaError(false);
    }
  }, [isOpen, item]);

  const handleDownload = (
    e: React.MouseEvent,
    fileUrl: string,
    filename?: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = filename || "download";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download error:", err);
      toast.info("Gagal mengunduh file. Silakan coba lagi.");
    }
  };

  const renderMediaContent = () => {
    if (!item) return null;

    const mediaUrl = adminMediaUtils.getMediaUrl(item.file);

    const mediaTypeMap: Record<string, React.JSX.Element> = {
      foto: (
        <div className="flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
          {mediaLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-10">
              <FaSpinner className="animate-spin text-4xl text-white" />
            </div>
          )}
          <img
            src={mediaUrl || "/placeholder.svg?height=600&width=800"}
            alt={item.nama}
            className="max-w-full max-h-[70vh] object-contain"
            onLoad={() => setMediaLoading(false)}
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              setMediaLoading(false);
              setMediaError(true);
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/placeholder.svg?height=600&width=800";
            }}
          />
        </div>
      ),
      video: (
        <div className="relative bg-black rounded-lg overflow-hidden">
          {mediaLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-10">
              <FaSpinner className="animate-spin text-4xl text-white" />
            </div>
          )}
          <video
            src={mediaUrl}
            controls
            autoPlay
            className="w-full max-h-[70vh]"
            poster={adminMediaUtils.getVideoThumbnail(item)}
            onLoadedData={() => setMediaLoading(false)}
            onError={() => {
              setMediaLoading(false);
              setMediaError(true);
            }}
          >
            Browser Anda tidak mendukung pemutaran video.
          </video>
          {mediaError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
              <FaExclamationTriangle className="text-red-500 text-5xl mb-4" />
              <p className="text-gray-700 mb-4">Video tidak dapat dimuat</p>
              <div className="flex gap-2">
                <button
                  onClick={() => window.open(mediaUrl, "_blank")}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Buka di Tab Baru
                </button>
              </div>
            </div>
          )}
        </div>
      ),
      dokumen: (
        <div className="relative bg-gray-100 rounded-lg overflow-hidden">
          {mediaLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-10">
              <FaSpinner className="animate-spin text-4xl text-white" />
            </div>
          )}
          <iframe
            src={mediaUrl}
            className="w-full h-[70vh]"
            title={item.nama}
            onLoad={() => setMediaLoading(false)}
            onError={() => {
              setMediaLoading(false);
              setMediaError(true);
            }}
          />
          {mediaError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
              <FaExclamationTriangle className="text-red-500 text-5xl mb-4" />
              <p className="text-gray-700 mb-4">Dokumen tidak dapat dimuat</p>
              <div className="flex gap-2">
                <button
                  onClick={() => window.open(mediaUrl, "_blank")}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Buka di Tab Baru
                </button>
              </div>
            </div>
          )}
        </div>
      ),
    };

    return (
      mediaTypeMap[item.tipe ?? ""] || (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-lg">
          <FaExclamationTriangle className="text-yellow-500 text-5xl mb-4" />
          <p className="text-gray-700">Format media tidak didukung</p>
        </div>
      )
    );
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto py-8">
      <div
        className="fixed inset-0 backdrop-blur-sm bg-gray-700/30"
        onClick={onClose}
      ></div>

      <div
        className="relative w-full max-w-5xl mx-4 bg-white rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
          <h3 className="text-xl font-bold text-gray-800 truncate">
            {getMediaIcon(item.tipe ?? "")} {item.nama}
          </h3>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          >
            <FaTimesCircle className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6 overflow-auto">
          <div className="mb-4">{renderMediaContent()}</div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 mb-4">{item.deskripsi}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Tipe</p>
                <p className="font-medium">{item.tipe}</p>
              </div>
              <div>
                <p className="text-gray-500">Tanggal Dibuat</p>
                <p className="font-medium">
                  {item.created_at ? formatDateLong(item.created_at) : "-"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto p-4 border-t bg-white sticky bottom-0">
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Tutup
            </button>
            <button
              onClick={(e) =>
                handleDownload(
                  e,
                  adminMediaUtils.getMediaUrl(item.file),
                  item.file.split("/").pop(),
                )
              }
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
            >
              <FaDownload />
              <span>Unduh</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
