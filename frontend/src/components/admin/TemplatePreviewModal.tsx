import { useEffect, useState } from "react";
import {
  Download,
  FileText,
  LoaderCircle,
  TriangleAlert,
  X,
} from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900">
              <FileText
                className="size-5 text-red-700"
                aria-hidden="true"
              />
              {item.nama_template}
            </h3>
            <p className="mt-1 text-base text-slate-600">{item.kode}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 min-w-11 font-semibold shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
            aria-label="Tutup pratinjau"
            title="Tutup"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="grid gap-4 border-b border-slate-200 py-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <p className="text-sm font-semibold text-slate-600">Deskripsi</p>
            <p className="mt-1 text-base font-semibold text-slate-900">
              {item.deskripsi || "-"}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-600">File</p>
            <p className="mt-1 text-base font-semibold text-slate-900">
              {item.file_template ? item.file_template.split("/").pop() : "-"}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-600">Status</p>
            <p
              className={`mt-1 text-base font-semibold ${
                item.status === "aktif" ? "text-emerald-700" : "text-slate-600"
              }`}
            >
              {item.status === "aktif" ? "Aktif" : "Nonaktif"}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="text-lg font-semibold text-slate-900">
            Preview Template
          </h4>
          <p className="mt-1 text-sm text-slate-600">
            Pratinjai template surat di bawah ini. Gunakan tombol Unduh untuk
            menyimpan salinan.
          </p>
          <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            {pdfLoading ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <LoaderCircle
                  className="size-5 animate-spin text-[#0b6393]"
                  aria-hidden="true"
                />
                <p className="mt-3 text-base text-slate-600">
                  Memuat template...
                </p>
              </div>
            ) : pdfUrl ? (
              <div className="flex min-w-0 flex-col gap-4">
                <div className="flex min-w-0 items-center justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <FileText
                      className="size-5 shrink-0 text-red-700"
                      aria-hidden="true"
                    />
                    <p className="truncate font-semibold text-slate-900">
                      template-{item.kode || item.id}.pdf
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0b6393] px-4 text-base font-semibold text-white hover:bg-[#0b4f75]"
                  >
                    <Download className="size-5" aria-hidden="true" />
                    Unduh
                  </button>
                </div>

                <div className="h-[420px] w-full overflow-hidden rounded-xl border border-slate-300 bg-white">
                  <iframe
                    src={pdfUrl}
                    className="h-full w-full"
                    title={`Preview template ${item.nama_template}`}
                  ></iframe>
                </div>
                <p className="text-sm text-slate-600">
                  Pratinjau template {item.nama_template}.
                </p>
              </div>
            ) : pdfError ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <TriangleAlert
                  className="size-5 text-red-700"
                  aria-hidden="true"
                />
                <p className="mt-3 text-base font-semibold text-red-700">
                  Terjadi kesalahan saat memuat template.
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  File mungkin tidak tersedia atau tidak dapat dikonversi.
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-6 flex justify-end border-t border-slate-200 pt-5">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-base font-semibold text-slate-700 hover:bg-slate-100"
          >
            <X className="size-5" aria-hidden="true" />
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
