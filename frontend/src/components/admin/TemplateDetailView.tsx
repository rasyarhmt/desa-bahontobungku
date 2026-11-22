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
  AdminStatusBadge,
  adminPrimaryButtonClass,
} from "@/components/admin/admin-ui";
import { adminTemplateApi } from "@/lib/api/admin";
import { type SuratTemplate } from "@/lib/api/schemas";
import { toast } from "@/lib/toast";

interface TemplateDetailViewProps {
  item: SuratTemplate;
  onBack: () => void;
}

export default function TemplateDetailView({
  item,
  onBack,
}: TemplateDetailViewProps) {
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

  return (
    <AdminDetailView
      eyebrow="Preview Template"
      title={item.nama_template || `Template ${item.kode || item.id}`}
      description={item.kode}
      onBack={onBack}
    >
      <AdminDetailGrid>
        <AdminDetailItem label="Kode Template">
          {item.kode || "-"}
        </AdminDetailItem>
        <AdminDetailItem label="Status">
          <AdminStatusBadge
            label={item.status === "aktif" ? "Aktif" : "Nonaktif"}
            tone={item.status === "aktif" ? "primary" : "neutral"}
          />
        </AdminDetailItem>
        <AdminDetailItem label="File">
          {item.file_template ? item.file_template.split("/").pop() : "-"}
        </AdminDetailItem>
        <AdminDetailItem label="Deskripsi">
          {item.deskripsi || "-"}
        </AdminDetailItem>
      </AdminDetailGrid>

      <AdminCard className="mt-6 p-5">
        <AdminSectionHeader
          icon={<FaFilePdf />}
          title="Preview Template"
          description="Dokumen PDF hasil konversi template."
        />

        {pdfLoading ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
            <FaSpinner className="animate-spin text-3xl text-primary" />
            Memuat template...
          </div>
        ) : pdfUrl ? (
          <div className="flex min-w-0 flex-col gap-4">
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <FaFilePdf className="shrink-0 text-destructive" />
                <p className="truncate text-sm font-medium text-on-surface">
                  template-{item.kode || item.id}.pdf
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
                title={`Preview template ${item.nama_template}`}
              />
            </div>
          </div>
        ) : pdfError ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 text-center text-destructive">
            <FaExclamationTriangle className="text-3xl" />
            <p className="text-sm font-medium">
              Terjadi kesalahan saat memuat template.
            </p>
            <p className="text-xs text-muted-foreground">
              File mungkin tidak tersedia atau tidak dapat dikonversi.
            </p>
          </div>
        ) : null}
      </AdminCard>
    </AdminDetailView>
  );
}
