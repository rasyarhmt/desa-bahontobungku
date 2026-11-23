import { useEffect, useState } from "react";
import {
  FaDownload,
  FaExclamationTriangle,
  FaFileAlt,
  FaFilePdf,
  FaSpinner,
} from "react-icons/fa";

import {
  AdminCard,
  AdminDetailGrid,
  AdminDetailItem,
  AdminDetailView,
  AdminSectionHeader,
  adminPrimaryButtonClass,
} from "@/components/admin/admin-ui";
import { type SuratItem, adminSuratApi } from "@/lib/api/admin";
import { formatDateLong } from "@/lib/format";
import { toast } from "@/lib/toast";

import { getSuratIcon } from "./suratShared";

interface SuratDetailViewProps {
  item: SuratItem;
  onBack: () => void;
}

export default function SuratDetailView({ item, onBack }: SuratDetailViewProps) {
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
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
  }, [item]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onBack();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onBack]);

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

  return (
    <AdminDetailView
      eyebrow="Detail Surat"
      title={item.perihal}
      description={`${item.jenis} · ${item.nomor}`}
      onBack={onBack}
    >
      <AdminDetailGrid>
        <AdminDetailItem label="Nomor Surat">{item.nomor}</AdminDetailItem>
        <AdminDetailItem label="Jenis">{item.jenis}</AdminDetailItem>
        <AdminDetailItem
          label={item.jenis === "Surat Masuk" ? "Pengirim" : "Penerima"}
        >
          {item.pengirim}
        </AdminDetailItem>
        <AdminDetailItem label="Tanggal">
          {formatDateLong(item.tanggal)}
        </AdminDetailItem>
      </AdminDetailGrid>

      <AdminCard className="mt-6 p-5">
        <AdminSectionHeader
          icon={getSuratIcon(item.jenis)}
          title="Dokumen Surat"
          description="Pratinjau berkas surat yang tersimpan."
        />

        {pdfLoading ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
            <FaSpinner className="animate-spin text-3xl text-primary" />
            Memuat dokumen...
          </div>
        ) : item.file && pdfUrl ? (
          <div className="flex min-w-0 flex-col gap-4">
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <FaFilePdf className="shrink-0 text-destructive" />
                <p
                  className="truncate text-sm font-medium text-on-surface"
                  title={item.file.split("/").pop() || "Dokumen Surat"}
                >
                  {item.file.split("/").pop() || "Dokumen Surat"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleDownload(item.id, item.jenis)}
                className={adminPrimaryButtonClass}
              >
                <FaDownload />
                Unduh
              </button>
            </div>
            <div className="h-[400px] w-full overflow-hidden rounded-2xl border border-border bg-surface-container-lowest">
              <iframe
                src={pdfUrl}
                className="h-full w-full"
                title={`Preview ${item.nomor}`}
              />
            </div>
          </div>
        ) : pdfError ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 text-center text-destructive">
            <FaExclamationTriangle className="text-3xl" />
            <p className="text-sm font-medium">
              Terjadi kesalahan saat memuat dokumen.
            </p>
            <p className="text-xs text-muted-foreground">
              File mungkin tidak tersedia atau tidak dapat diakses.
            </p>
          </div>
        ) : (
          <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 text-center text-muted-foreground">
            <FaFileAlt className="text-3xl" />
            <p className="text-sm">Dokumen surat tidak tersedia.</p>
          </div>
        )}
      </AdminCard>
    </AdminDetailView>
  );
}
