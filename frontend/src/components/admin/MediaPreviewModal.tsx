import { useEffect, useState, type MouseEvent } from "react";
import {
  FaDownload,
  FaExclamationTriangle,
  FaExternalLinkAlt,
  FaSpinner,
  FaTimes,
} from "react-icons/fa";

import { adminMediaUtils } from "@/lib/api/admin";
import { formatDateLong } from "@/lib/format";

import ModalPortal from "./ModalPortal";
import { getMediaIcon, type MediaItem } from "./mediaShared";

interface MediaPreviewModalProps {
  isOpen: boolean;
  item: MediaItem | null;
  onClose: () => void;
}

const fieldClass =
  "rounded-2xl border border-border bg-surface-container-low px-4 py-3";

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

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const mediaUrl = adminMediaUtils.getMediaUrl(item.file);
  const thumbnailUrl = adminMediaUtils.getVideoThumbnail(item);

  const handleDownload = (event: MouseEvent) => {
    event.preventDefault();
    try {
      const link = document.createElement("a");
      link.href = mediaUrl;
      link.download = item.file.split("/").pop() || item.nama;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      window.open(mediaUrl, "_blank");
    }
  };

  const renderMediaContent = () => {
    if (!mediaUrl) {
      return (
        <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl bg-surface-container text-center">
          <FaExclamationTriangle className="mb-3 text-2xl text-muted-foreground" />
          <p className="text-sm font-medium text-on-surface">
            Berkas media tidak tersedia.
          </p>
        </div>
      );
    }

    if (item.tipe === "video") {
      return (
        <div className="relative overflow-hidden rounded-2xl bg-black">
          {mediaLoading && !mediaError && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-inverse-surface/50">
              <FaSpinner className="animate-spin text-3xl text-white" />
            </div>
          )}
          <video
            src={mediaUrl}
            poster={thumbnailUrl || undefined}
            controls
            autoPlay
            className="max-h-[55vh] w-full"
            onLoadedData={() => setMediaLoading(false)}
            onError={() => {
              setMediaLoading(false);
              setMediaError(true);
            }}
          >
            Browser Anda tidak mendukung pemutaran video.
          </video>
          {mediaError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface-container text-center">
              <FaExclamationTriangle className="text-3xl text-destructive" />
              <p className="text-sm font-medium text-on-surface">
                Video tidak dapat dimuat.
              </p>
              <button
                type="button"
                onClick={() => window.open(mediaUrl, "_blank")}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary"
              >
                <FaExternalLinkAlt />
                Buka di Tab Baru
              </button>
            </div>
          )}
        </div>
      );
    }

    if (item.tipe === "dokumen") {
      return (
        <div className="relative overflow-hidden rounded-2xl bg-surface-container-low">
          {mediaLoading && !mediaError && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-inverse-surface/50">
              <FaSpinner className="animate-spin text-3xl text-white" />
            </div>
          )}
          <iframe
            src={mediaUrl}
            title={item.nama}
            className="h-[55vh] w-full"
            onLoad={() => setMediaLoading(false)}
            onError={() => {
              setMediaLoading(false);
              setMediaError(true);
            }}
          />
          {mediaError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface-container text-center">
              <FaExclamationTriangle className="text-3xl text-destructive" />
              <p className="text-sm font-medium text-on-surface">
                Dokumen tidak dapat dimuat.
              </p>
              <button
                type="button"
                onClick={() => window.open(mediaUrl, "_blank")}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary"
              >
                <FaExternalLinkAlt />
                Buka di Tab Baru
              </button>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="flex min-h-[280px] items-center justify-center overflow-hidden rounded-2xl bg-surface-container p-4">
        {mediaLoading && (
          <div className="absolute flex items-center justify-center">
            <FaSpinner className="animate-spin text-3xl text-primary" />
          </div>
        )}
        <img
          src={mediaUrl}
          alt={item.nama}
          className="max-h-[55vh] w-full object-contain"
          onLoad={() => setMediaLoading(false)}
          onError={() => {
            setMediaLoading(false);
            setMediaError(true);
          }}
        />
        {mediaError && (
          <div className="absolute flex flex-col items-center gap-2 rounded-2xl bg-surface-container-lowest px-6 py-4 text-center shadow-lg">
            <FaExclamationTriangle className="text-2xl text-destructive" />
            <p className="text-sm font-medium text-on-surface">
              Gambar tidak dapat dimuat.
            </p>
          </div>
        )}
      </div>
    );
  };

  const metadata = [
    { label: "ID Media", value: `#${item.id}` },
    {
      label: "Tipe",
      value: item.tipe
        ? item.tipe.charAt(0).toUpperCase() + item.tipe.slice(1)
        : "-",
    },
    { label: "Dibuat", value: formatDateLong(item.created_at) },
    ...(item.updated_at
      ? [{ label: "Diperbarui", value: formatDateLong(item.updated_at) }]
      : []),
  ];

  return (
    <ModalPortal>
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 z-[70] bg-inverse-surface/50 backdrop-blur-sm"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="media-preview-title"
        className="fixed left-1/2 top-1/2 z-[80] flex max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-3xl border border-border bg-surface-container-lowest shadow-2xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Detail Media
            </p>
            <h2
              id="media-preview-title"
              className="mt-1 truncate text-xl font-semibold text-on-surface"
            >
              {item.nama}
            </h2>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              {getMediaIcon(item.tipe ?? "")}
              <span className="capitalize">{item.tipe || "-"}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="rounded-xl p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
          >
            <FaTimes />
          </button>
        </div>

        <div className="scrollbar-hide flex-1 space-y-6 overflow-y-auto px-6 py-6">
          {renderMediaContent()}

          {item.deskripsi && (
            <section>
              <h3 className="mb-2 text-sm font-semibold text-on-surface">
                Deskripsi
              </h3>
              <p className="whitespace-pre-line rounded-2xl border border-border bg-surface-container-low px-4 py-3 text-sm leading-relaxed text-on-surface-variant">
                {item.deskripsi}
              </p>
            </section>
          )}

          <section>
            <h3 className="mb-3 text-sm font-semibold text-on-surface">
              Informasi Berkas
            </h3>
            <dl className="grid gap-3 sm:grid-cols-2">
              {metadata.map((row) => (
                <div key={row.label} className={fieldClass}>
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {row.label}
                  </dt>
                  <dd className="mt-1 truncate text-sm font-medium text-on-surface">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <footer className="shrink-0 border-t border-border bg-surface-container-lowest px-6 py-4">
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={!mediaUrl}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaDownload />
              Unduh Berkas
            </button>
          </div>
        </footer>
      </aside>
    </ModalPortal>
  );
}
