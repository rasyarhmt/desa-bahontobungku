import {
  CalendarDays,
  CircleX,
  LoaderCircle,
  Newspaper,
  UserRound,
  X,
} from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <Newspaper aria-hidden="true" className="size-5 text-[#0b6393]" />
            Preview Berita
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup preview"
            title="Tutup preview"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>

        <div className="mb-6">
          {item?.foto ? (
            <>
              <img
                src={formatImageUrl(item.foto)}
                alt={item.judul}
                className="mb-2 h-64 w-full rounded-xl bg-slate-100 object-cover"
              />
              <p className="mb-4 text-base font-medium text-slate-600">
                Gambar: {item.judul}
              </p>
            </>
          ) : (
            <>
              <div className="mb-2 flex aspect-video items-center justify-center rounded-xl bg-slate-100">
                <Newspaper
                  aria-hidden="true"
                  className="size-12 text-slate-400"
                />
              </div>
              <p className="mb-4 text-base font-medium text-slate-600">
                Thumbnail belum tersedia.
              </p>
            </>
          )}

          <h2 className="mb-2 text-2xl font-bold text-slate-900">
            {item?.judul}
          </h2>

          <div className="mb-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-base font-medium text-slate-700">
              <CalendarDays aria-hidden="true" className="size-5" />
              {item?.tanggalTerbit && formatDateLong(item.tanggalTerbit)}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-base font-medium text-slate-700">
              <UserRound aria-hidden="true" className="size-5" />
              {item?.penulis}
            </span>
            <span
              className={`rounded-full px-3 py-1.5 text-base font-semibold ${getStatusColor(
                item?.status,
              )}`}
            >
              {item?.status || "Dipublikasi"}
            </span>
          </div>

          <div className="px-4 text-base text-slate-800">
            <p className="mb-2 font-semibold text-slate-900">Konten Lengkap:</p>
            {item?.isi ? (
              <div className="prose max-w-none text-base">{item.isi}</div>
            ) : (
              <p className="italic text-slate-600">Konten belum tersedia.</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="min-h-11 rounded-xl border border-slate-300 bg-white px-5 py-2 font-semibold text-slate-700 transition-colors hover:bg-slate-100"
          >
            Tutup
          </button>
          {item?.status === "Draft" ? (
            <button
              onClick={() => item && onToggleStatus(item.id)}
              className="flex min-h-11 items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2 font-semibold text-white transition-colors hover:bg-emerald-800"
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <>
                  <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <Newspaper aria-hidden="true" className="size-5" />
                  <span>Publikasikan</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => item && onToggleStatus(item.id)}
              className="flex min-h-11 items-center gap-2 rounded-xl bg-amber-700 px-5 py-2 font-semibold text-white transition-colors hover:bg-amber-800"
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <>
                  <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <CircleX aria-hidden="true" className="size-5" />
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
