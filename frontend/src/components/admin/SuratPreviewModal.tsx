import { useEffect, useState } from "react";
import {
  FaDownload,
  FaSpinner,
  FaFilePdf,
  FaExclamationTriangle,
  FaFileAlt,
} from "react-icons/fa";

import { type SuratItem, adminSuratApi } from "@/lib/api/admin";
import { formatDateLong } from "@/lib/format";
import { toast } from "@/lib/toast";

import { getSuratIcon } from "./suratShared";

interface SuratPreviewModalProps {
  isOpen: boolean;
  item: SuratItem | null;
  onClose: () => void;
}

export default function SuratPreviewModal({
  isOpen,
  item,
  onClose,
}: SuratPreviewModalProps) {
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !item) return;

    let cancelled = false;
    let createdUrl: string | null = null;

    setPdfLoading(true);
    setPdfError(false);
    setPdfUrl(null);

    (async () => {
      try {
        if (item.file) {
          const blobUrl = await adminSuratApi.fetchFileBlobUrl(
            item.id,
            item.jenis,
          );

          if (cancelled) {
            if (blobUrl) URL.revokeObjectURL(blobUrl);
            return;
          }

          if (blobUrl) {
            createdUrl = blobUrl;
            setPdfUrl(blobUrl);
          } else {
            console.error("File not found or inaccessible:", item.file);
            setPdfError(true);
          }
        } else {
          setPdfError(true);
        }
      } catch (error) {
        console.error("Error preparing file for preview:", error);
        if (!cancelled) setPdfError(true);
      } finally {
        if (!cancelled) setPdfLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [isOpen, item]);

  const handleDownload = async (id: number, jenis: string) => {
    if (!id) {
      toast.info("File tidak tersedia untuk diunduh");
      return;
    }

    try {
      const success = await adminSuratApi.downloadFile(id, jenis);
      if (!success) {
        toast.error("Terjadi kesalahan saat mengunduh file");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Terjadi kesalahan saat mengunduh file");
    }
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-gray-700/30 flex items-center justify-center z-50 transition-all duration-300">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto border border-gray-200 animate-modalFadeIn">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            {getSuratIcon(item.jenis)} {item.perihal}
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

        <div className="border-t border-b border-gray-200 py-4 mb-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Nomor Surat</p>
              <p className="font-medium">{item.nomor}</p>
            </div>
            <div>
              <p className="text-gray-500">Jenis</p>
              <p className="font-medium">{item.jenis}</p>
            </div>
            <div>
              <p className="text-gray-500">
                {item.jenis === "Surat Masuk" ? "Pengirim" : "Penerima"}
              </p>
              <p className="font-medium">{item.pengirim}</p>
            </div>
            <div>
              <p className="text-gray-500">Tanggal</p>
              <p className="font-medium">{formatDateLong(item.tanggal)}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Dokumen Surat
          </h4>
          <div className="bg-gray-50 p-4 rounded-lg text-gray-700 max-w-full overflow-hidden">
            {pdfLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <FaSpinner className="animate-spin text-4xl text-purple-500 mb-4" />
                <p className="text-center">Memuat dokumen...</p>
              </div>
            ) : item.file && pdfUrl ? (
              <div className="flex flex-col gap-4 min-w-0">
                <div className="flex items-center justify-between gap-3 min-w-0">
                  <div className="flex items-center min-w-0 flex-1">
                    <FaFilePdf className="flex-shrink-0 mr-2 text-red-500" />
                    <p
                      className="font-medium truncate min-w-0"
                      title={item.file.split("/").pop() || "Dokumen Surat"}
                    >
                      {item.file.split("/").pop() || "Dokumen Surat"}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDownload(item.id, item.jenis)}
                    className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1 flex-shrink-0 text-sm"
                  >
                    <FaDownload className="text-white w-3 h-3" />
                    <span className="hidden sm:inline">Unduh</span>
                  </button>
                </div>

                <div className="w-full h-[400px] border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <iframe
                    src={pdfUrl}
                    className="w-full h-full"
                    title={`Preview ${item.nomor}`}
                  ></iframe>
                </div>
              </div>
            ) : pdfError ? (
              <div className="flex flex-col items-center justify-center py-8 text-red-500 text-center">
                <FaExclamationTriangle className="text-4xl mb-4" />
                <p className="px-2">Terjadi kesalahan saat memuat dokumen.</p>
                <p className="text-sm mt-2 px-2">
                  File mungkin tidak tersedia atau tidak dapat diakses.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FaFileAlt className="text-4xl mb-4" />
                <p className="text-gray-500 px-2">
                  Dokumen surat tidak tersedia.
                </p>
              </div>
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
        </div>
      </div>
    </div>
  );
}
