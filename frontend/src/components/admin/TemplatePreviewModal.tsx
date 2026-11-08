import { useEffect, useState } from "react";
import {
  FaDownload,
  FaSpinner,
  FaFilePdf,
  FaExclamationTriangle,
  FaTimes,
} from "react-icons/fa";

import { type SuratTemplate } from "@/lib/api/schemas";
import { adminTemplateApi } from "@/lib/api/admin";
import { toast } from "@/lib/toast";

interface TemplatePreviewModalProps {
  isOpen: boolean;
  item: SuratTemplate | null;
  onClose: () => void;
}

export default function TemplatePreviewModal({
  isOpen,
  item,
  onClose,
}: TemplatePreviewModalProps) {
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
        const blob = await adminTemplateApi.previewTemplate(item.id);
        if (cancelled) return;

        createdUrl = URL.createObjectURL(
          new Blob([blob], { type: "application/pdf" }),
        );
        setPdfUrl(createdUrl);
      } catch (error) {
        console.error("Error preparing template for preview:", error);
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

  const handleDownload = async () => {
    if (!item) return;
    try {
      const blob = await adminTemplateApi.previewTemplate(item.id);
      const blobUrl = URL.createObjectURL(
        new Blob([blob], { type: "application/pdf" }),
      );
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `template-${item.kode || item.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading template:", error);
      toast.error("Terjadi kesalahan saat mengunduh template.");
    }
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-gray-700/30 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-5xl max-h-2xl overflow-y-auto border border-gray-200 animate-modalFadeIn">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FaFilePdf className="text-red-500" /> {item.nama_template}
            </h3>
            <p className="text-sm text-gray-500">{item.kode}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            title="Tutup"
          >
            <FaTimes className="text-gray-600" />
          </button>
        </div>

        <div className="border-t border-b border-gray-200 py-4 mb-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="col-span-2">
              <p className="text-gray-500">Deskripsi</p>
              <p className="font-medium">{item.deskripsi || "-"}</p>
            </div>
            <div>
              <p className="text-gray-500">File</p>
              <p className="font-medium">
                {item.file_template ? item.file_template.split("/").pop() : "-"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Status</p>
              <p className="font-medium">
                {item.status === "aktif" ? "Aktif" : "Nonaktif"}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Preview Template
          </h4>
          <div className="bg-gray-50 p-4 rounded-lg text-gray-700 max-w-full overflow-hidden">
            {pdfLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <FaSpinner className="animate-spin text-4xl text-indigo-500 mb-4" />
                <p className="text-center">Memuat template...</p>
              </div>
            ) : pdfUrl ? (
              <div className="flex flex-col gap-4 min-w-0">
                <div className="flex items-center justify-between gap-3 min-w-0">
                  <div className="flex items-center min-w-0 flex-1">
                    <FaFilePdf className="flex-shrink-0 mr-2 text-red-500" />
                    <p className="font-medium truncate min-w-0">
                      template-{item.kode || item.id}.pdf
                    </p>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1 flex-shrink-0 text-sm"
                  >
                    <FaDownload className="w-3 h-3" />
                    <span className="hidden sm:inline">Unduh</span>
                  </button>
                </div>

                <div className="w-full h-[400px] border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <iframe
                    src={pdfUrl}
                    className="w-full h-full"
                    title={`Preview template ${item.nama_template}`}
                  ></iframe>
                </div>
              </div>
            ) : pdfError ? (
              <div className="flex flex-col items-center justify-center py-8 text-red-500 text-center">
                <FaExclamationTriangle className="text-4xl mb-4" />
                <p className="px-2">Terjadi kesalahan saat memuat template.</p>
                <p className="text-sm mt-2 px-2">
                  File mungkin tidak tersedia atau tidak dapat dikonversi.
                </p>
              </div>
            ) : null}
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
