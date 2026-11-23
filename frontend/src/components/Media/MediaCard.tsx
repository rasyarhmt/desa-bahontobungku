import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Download,
  FileText,
  PlayCircle,
} from "lucide-react";

import { mediaUtils } from "@/lib/api/media";
import type { Media } from "@/lib/api/schemas";
import { formatDateLong } from "@/lib/format";
import {
  mediaDetailPath,
  mediaTypeIcon,
  mediaTypeLabel,
} from "./mediaShared";

export default function MediaCard({ item, featured = false }: { item: Media; featured?: boolean }) {
  const TypeIcon = mediaTypeIcon(item.tipe);
  const thumbnail = mediaUtils.getVideoThumbnail(item);

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm transition-all duration-300 hover:shadow-xl ${
        featured ? "md:col-span-2 lg:col-span-3" : ""
      }`}
    >
      <Link
        to={mediaDetailPath(item.id)}
        className="relative block h-56 w-full overflow-hidden bg-surface-container"
      >
        {item.tipe === "foto" ? (
          <img
            src={mediaUtils.getMediaUrl(item.file) || thumbnail}
            alt={item.nama}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : item.tipe === "video" ? (
          <>
            <img
              src={thumbnail}
              alt=""
              className="size-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
            />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex size-16 items-center justify-center rounded-full bg-surface-container-lowest/80 text-primary shadow-lg transition-transform group-hover:scale-110">
                <PlayCircle className="size-8" />
              </span>
            </span>
          </>
        ) : (
          <span className="flex size-full flex-col items-center justify-center gap-2 text-on-surface-variant">
            <FileText className="size-14" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Dokumen
            </span>
          </span>
        )}

        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-surface-container-lowest/90 px-3 py-1 text-xs font-bold text-primary shadow-sm backdrop-blur-md">
          <TypeIcon className="size-3.5" />
          {mediaTypeLabel(item.tipe)}
        </span>
      </Link>

      <div className="flex flex-1 flex-col justify-between space-y-4 p-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[11px] text-outline">
            <CalendarDays className="size-3.5" />
            {formatDateLong(item.created_at)}
          </div>
          <Link to={mediaDetailPath(item.id)}>
            <h3 className="line-clamp-2 font-display text-base font-bold leading-snug text-on-surface transition-colors group-hover:text-primary">
              {item.nama}
            </h3>
          </Link>
          <p className="line-clamp-2 text-sm text-on-surface-variant">
            {item.deskripsi || "Dokumentasi ini tidak memiliki deskripsi tambahan."}
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-surface-container pt-4">
          <Link
            to={mediaDetailPath(item.id)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-transform group-hover:translate-x-1"
          >
            Lihat Detail
            <ArrowRight className="size-4" />
          </Link>
          <a
            href={mediaUtils.getMediaUrl(item.file)}
            download={item.nama}
            aria-label={`Unduh ${item.nama}`}
            className="text-outline transition-colors hover:text-primary"
          >
            <Download className="size-4" />
          </a>
        </div>
      </div>
    </article>
  );
}
