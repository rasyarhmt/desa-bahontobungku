import { useEffect, useState } from "react";
import {
  Download,
  FileText,
  LoaderCircle,
  TriangleAlert,
  X,
} from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            {getSuratIcon(item.jenis)}
            {item.perihal}
          </h3>
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
          <div>
            <p className="text-sm font-semibold text-slate-600">Nomor Surat</p>
            <p className="mt-1 text-base font-semibold text-slate-900">
              {item.nomor}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-600">Jenis</p>
            <p className="mt-1 text-base font-semibold text-slate-900">
              {item.jenis}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-600">
              {item.jenis === "Surat Masuk" ? "Pengirim" : "Penerima"}
            </p>
            <p className="mt-1 text-base font-semibold text-slate-900">
              {item.pengirim}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-600">Tanggal</p>
            <p className="mt-1 text-base font-semibold text-slate-900">
              {formatDateLong(item.tanggal)}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="text-lg font-semibold text-slate-900">
            Dokumen Surat
          </h4>
          <p className="mt-1 text-sm text-slate-600">
            Pratinjai dokumen di bawah ini. Gunakan tombol Unduh untuk menyimpan
            salinan.
          </p>
          <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            {pdfLoading ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <LoaderCircle
                  className="size-5 animate-spin text-[#0b6393]"
                  aria-hidden="true"
                />
                <p className="mt-3 text-base text-slate-600">
                  Memuat dokumen...
                </p>
              </div>
            ) : item.file && pdfUrl ? (
              <div className="flex min-w-0 flex-col gap-4">
                <div className="flex min-w-0 items-center justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <FileText
                      className="size-5 shrink-0 text-red-700"
                      aria-hidden="true"
                    />
                    <p
                      className="truncate font-semibold text-slate-900"
                      title={item.file.split("/").pop() || "Dokumen Surat"}
                    >
                      {item.file.split("/").pop() || "Dokumen Surat"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDownload(item.id, item.jenis)}
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
                    title={`Preview ${item.nomor}`}
                  ></iframe>
                </div>
                <p className="text-sm text-slate-600">
                  Pratinjau dokumen surat {item.nomor}.
                </p>
              </div>
            ) : pdfError ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <TriangleAlert
                  className="size-5 text-red-700"
                  aria-hidden="true"
                />
                <p className="mt-3 text-base font-semibold text-red-700">
                  Terjadi kesalahan saat memuat dokumen.
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  File mungkin tidak tersedia atau tidak dapat diakses.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <FileText
                  className="size-5 text-slate-600"
                  aria-hidden="true"
                />
                <p className="mt-3 text-base text-slate-600">
                  Dokumen surat tidak tersedia.
                </p>
              </div>
            )}
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
