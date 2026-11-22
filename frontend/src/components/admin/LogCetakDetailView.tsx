import { useEffect, useState } from "react";
import {
  FaDownload,
  FaExclamationTriangle,
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
import { adminLogCetakApi } from "@/lib/api/admin";
import { formatDateTime } from "@/lib/format";
import { type LogCetakSurat } from "@/lib/api/schemas";
import { toast } from "@/lib/toast";

interface LogCetakDetailViewProps {
  item: LogCetakSurat;
  onBack: () => void;
}

export default function LogCetakDetailView({
  item,
  onBack,
}: LogCetakDetailViewProps) {
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
        const blob = await adminLogCetakApi.downloadFile(item.id);
        if (cancelled) return;

        createdUrl = URL.createObjectURL(
          new Blob([blob], { type: "application/pdf" }),
        );
        setPdfUrl(createdUrl);
      } catch (error) {
        console.error("Error preparing surat for preview:", error);
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

  const handleDownload = async () => {
    try {
      const blob = await adminLogCetakApi.downloadFile(item.id);
      const blobUrl = URL.createObjectURL(
        new Blob([blob], { type: "application/pdf" }),
      );
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `surat-${item.kode_unik}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading surat:", error);
      toast.error("Terjadi kesalahan saat mengunduh surat.");
    }
  };

  return (
    <AdminDetailView
      eyebrow="Detail Surat"
      title={`Surat ${item.kode_unik}`}
      description={`${item.nama_layanan || "-"} · ${
        item.nama_template || "-"
      }`}
      onBack={onBack}
    >
      <AdminDetailGrid>
        <AdminDetailItem label="Pemohon">
          {item.nama_pemohon}
        </AdminDetailItem>
        <AdminDetailItem label="NIK">{item.nik_pemohon || "-"}</AdminDetailItem>
        <AdminDetailItem label="Nomor Surat">
          {item.nomor_surat || "Belum ada"}
        </AdminDetailItem>
        <AdminDetailItem label="Tanggal">
          {formatDateTime(item.created_at)}
        </AdminDetailItem>
      </AdminDetailGrid>

      <AdminCard className="mt-6 p-5">
        <AdminSectionHeader
          icon={<FaFilePdf />}
          title="Dokumen Surat"
          description="Pratinjau surat yang telah dicetak."
        />

        {pdfLoading ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
            <FaSpinner className="animate-spin text-3xl text-primary" />
            Memuat dokumen...
          </div>
        ) : pdfUrl ? (
          <div className="flex min-w-0 flex-col gap-4">
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <FaFilePdf className="shrink-0 text-destructive" />
                <p className="truncate text-sm font-medium text-on-surface">
                  surat-{item.kode_unik}.pdf
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleDownload()}
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
                title={`Preview surat ${item.kode_unik}`}
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
        ) : null}
      </AdminCard>
    </AdminDetailView>
  );
}
