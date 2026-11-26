import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Download,
  FileText,
  Hash,
  PlayCircle,
  Share2,
} from "lucide-react";

import { mediaUtils } from "@/lib/api/media";
import type { Media } from "@/lib/api/schemas";
import { formatDateLong } from "@/lib/format";
import { CONTAINER_CLASS } from "@/lib/utils";
import MediaCard from "./MediaCard";
import { mediaTypeIcon, mediaTypeLabel } from "./mediaShared";

interface MediaDetailViewProps {
  item: Media;
  related: Media[];
}

function MediaViewer({ item }: { item: Media }) {
  const fileUrl = mediaUtils.getMediaUrl(item.file);

  if (item.tipe === "video") {
    return (
      <video
        key={item.id}
        controls
        className="h-full w-full bg-black object-contain"
        poster={mediaUtils.getVideoThumbnail(item)}
      >
        <source src={fileUrl} />
        Browser Anda tidak mendukung pemutaran video.
      </video>
    );
  }

  if (item.tipe === "dokumen") {
    return (
      <iframe
        key={item.id}
        src={fileUrl}
        title={item.nama}
        className="h-full w-full bg-surface-container-lowest"
      />
    );
  }

  const imgSrc = fileUrl || mediaUtils.getVideoThumbnail(item);

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-neutral-900">
      {/* Latar belakang blur dari gambar yang sama */}
      <img
        src={imgSrc}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl"
      />
      {/* Gambar utama tetap utuh dan menempel rapi atas-bawah */}
      <img
        key={item.id}
        src={imgSrc}
        alt={item.nama}
        className="relative z-10 h-full w-auto max-w-full object-contain shadow-lg"
      />
    </div>
  );
}

export default function MediaDetailView({ item, related }: MediaDetailViewProps) {
  const [copied, setCopied] = useState(false);
  const TypeIcon = mediaTypeIcon(item.tipe);
  const fileUrl = mediaUtils.getMediaUrl(item.file);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: item.nama, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-8 md:gap-8 md:pb-10">
      <section className={CONTAINER_CLASS}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-[11px] font-medium text-on-surface-variant"
          >
            <Link to="/" className="hover:text-primary">
              Beranda
            </Link>
            <span className="text-outline-variant">/</span>
            <Link to="/Media" className="hover:text-primary">
              Media &amp; Galeri
            </Link>
            <span className="text-outline-variant">/</span>
            <span className="max-w-xs truncate font-semibold text-on-surface md:max-w-md">
              {item.nama}
            </span>
          </nav>
          <Link
            to="/Media"
            className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-high px-3 py-1.5 text-xs font-semibold text-on-surface-variant transition-all hover:text-primary"
          >
            <ArrowLeft className="size-4" />
            Kembali ke Media
          </Link>
        </div>
      </section>

      <section className={CONTAINER_CLASS}>
        <div className="relative overflow-hidden rounded-3xl bg-surface-container-lowest p-8 shadow-md lg:p-12">
          <div className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-primary-fixed/20 blur-3xl" />
          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1 text-xs font-semibold text-on-primary shadow-sm">
                <TypeIcon className="size-3.5" />
                {mediaTypeLabel(item.tipe)}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container px-3 py-1 text-xs font-medium text-primary">
                <Check className="size-3.5" />
                Arsip Resmi Pemdes
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="font-display text-2xl leading-snug font-bold tracking-tight text-on-surface md:text-4xl">
                {item.nama}
              </h1>
              {item.deskripsi && (
                <p className="max-w-4xl text-sm leading-relaxed text-on-surface-variant md:text-base">
                  {item.deskripsi}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 rounded-2xl bg-surface-container-low px-5 py-4 lg:grid-cols-3">
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-container text-primary">
                  <CalendarDays className="size-5" />
                </span>
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
                    Tanggal Arsip
                  </div>
                  <div className="truncate text-sm font-bold text-on-surface">
                    {formatDateLong(item.created_at)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-container text-primary">
                  <FileText className="size-5" />
                </span>
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
                    Jenis Media
                  </div>
                  <div className="truncate text-sm font-bold text-on-surface">
                    {mediaTypeLabel(item.tipe)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-container text-primary">
                  <Hash className="size-5" />
                </span>
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
                    Kode Arsip
                  </div>
                  <div className="truncate text-sm font-bold text-on-surface">
                    MED-{item.id}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={fileUrl}
                download={item.nama}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-on-primary shadow-md transition-all hover:bg-tertiary-container hover:text-on-tertiary-container"
              >
                <Download className="size-4" />
                Unduh Berkas
              </a>
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-2 rounded-full bg-surface-container-high px-5 py-3 text-sm font-semibold text-on-surface transition-all hover:bg-surface-container-highest"
              >
                <Share2 className="size-4" />
                {copied ? "Tautan Disalin" : "Bagikan"}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className={CONTAINER_CLASS}>
        <div className="relative overflow-hidden rounded-3xl bg-inverse-surface shadow-xl">
          <div className="flex h-[380px] items-center justify-center bg-neutral-900 lg:h-[560px]">
            <MediaViewer item={item} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5 text-inverse-on-surface lg:px-10">
            <div className="flex items-center gap-2 text-xs font-medium text-surface-container-high">
              {item.tipe === "video" ? (
                <PlayCircle className="size-4 text-primary-fixed" />
              ) : (
                <TypeIcon className="size-4 text-primary-fixed" />
              )}
              {item.nama}
            </div>
            <span className="text-[11px] text-surface-container-high">
              {formatDateLong(item.created_at)}
            </span>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className={CONTAINER_CLASS}>
          <div className="mb-10 flex items-end justify-between gap-4 md:mb-12">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                Arsip Terkait
              </span>
              <h2 className="mt-1 font-display text-xl font-bold text-on-surface md:text-2xl">
                Dokumentasi Lainnya
              </h2>
            </div>
            <Link
              to="/Media"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Lihat Semua
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {related.map((media) => (
              <MediaCard key={media.id} item={media} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
