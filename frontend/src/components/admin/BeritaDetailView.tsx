import { FaNewspaper, FaSpinner, FaTimesCircle } from "react-icons/fa";

import {
  AdminDetailGrid,
  AdminDetailItem,
  AdminDetailView,
  AdminStatusBadge,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "@/components/admin/admin-ui";
import { formatDateLong, formatImageUrl } from "@/lib/format";

import type { BeritaItem } from "./beritaShared";

interface BeritaDetailViewProps {
  item: BeritaItem;
  onBack: () => void;
  onToggleStatus: (id: number) => void;
  isActionLoading: boolean;
}

export default function BeritaDetailView({
  item,
  onBack,
  onToggleStatus,
  isActionLoading,
}: BeritaDetailViewProps) {
  const actions = (
    <button
      type="button"
      onClick={() => onToggleStatus(item.id)}
      disabled={isActionLoading}
      className={
        item.status === "Draft"
          ? adminPrimaryButtonClass
          : adminSecondaryButtonClass
      }
    >
      {isActionLoading ? (
        <>
          <FaSpinner className="animate-spin" />
          <span>Memproses...</span>
        </>
      ) : item.status === "Draft" ? (
        <>
          <FaNewspaper />
          <span>Publikasikan</span>
        </>
      ) : (
        <>
          <FaTimesCircle />
          <span>Ubah ke Draft</span>
        </>
      )}
    </button>
  );

  return (
    <AdminDetailView
      eyebrow="Pratinjau Konten"
      title="Preview Berita"
      description="Lihat detail berita sebelum melakukan tindakan lanjutan."
      onBack={onBack}
      actions={actions}
    >
      {item.foto ? (
        <img
          src={formatImageUrl(item.foto)}
          alt={item.judul}
          className="mb-6 max-h-80 w-full rounded-3xl border border-border object-cover"
        />
      ) : (
        <div className="mb-6 flex h-56 items-center justify-center rounded-3xl bg-surface-container text-muted-foreground">
          <FaNewspaper className="text-5xl" />
        </div>
      )}

      <AdminDetailGrid>
        <AdminDetailItem label="Judul">{item.judul}</AdminDetailItem>
        <AdminDetailItem label="Tanggal Terbit">
          {item.tanggalTerbit ? formatDateLong(item.tanggalTerbit) : "-"}
        </AdminDetailItem>
        <AdminDetailItem label="Penulis">{item.penulis}</AdminDetailItem>
        <AdminDetailItem label="Status">
          <AdminStatusBadge
            label={item.status || "Dipublikasi"}
            tone={item.status === "Dipublikasi" ? "success" : "warning"}
          />
        </AdminDetailItem>
      </AdminDetailGrid>

      <section className="mt-6 border-t border-border pt-6">
        <h2 className="mb-2 text-sm font-semibold text-on-surface">
          Konten Lengkap:
        </h2>
        {item.isi ? (
          <div className="whitespace-pre-line text-sm leading-relaxed text-on-surface-variant">
            {item.isi}
          </div>
        ) : (
          <p className="text-sm italic text-muted-foreground">
            Konten belum tersedia.
          </p>
        )}
      </section>
    </AdminDetailView>
  );
}
