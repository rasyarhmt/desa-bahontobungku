import { Link } from "react-router-dom";
import { ArrowUpRight, CalendarDays, Sparkles } from "lucide-react";

import { mediaUtils } from "@/lib/api/media";
import type { Media } from "@/lib/api/schemas";
import { formatDateLong } from "@/lib/format";
import { CONTAINER_CLASS, SECTION_CLASS } from "@/lib/utils";
import { mediaDetailPath, mediaTypeLabel } from "./mediaShared";

export default function MediaSpotlight({ item }: { item: Media }) {
  const thumbnail = mediaUtils.getVideoThumbnail(item);

  return (
    <section className={`${SECTION_CLASS} ${CONTAINER_CLASS}`}>
      <div className="group relative w-full overflow-hidden rounded-3xl bg-inverse-surface shadow-xl">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url(${thumbnail})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface via-inverse-surface/80 to-transparent" />

        <div className="relative z-10 flex min-h-[420px] max-w-4xl flex-col justify-end space-y-6 p-8 sm:p-12 lg:p-16">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-on-primary shadow-sm">
              <Sparkles className="size-4" />
              Sorotan Media
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-inverse-surface/80 px-3 py-1 text-xs font-medium text-inverse-on-surface backdrop-blur-md">
              {mediaTypeLabel(item.tipe)}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-surface-container-highest">
              <CalendarDays className="size-3.5" />
              {formatDateLong(item.created_at)}
            </span>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-3xl leading-tight font-bold text-on-primary md:text-4xl">
              {item.nama}
            </h2>
            {item.deskripsi && (
              <p className="max-w-2xl text-sm leading-relaxed text-surface-container-high">
                {item.deskripsi}
              </p>
            )}
          </div>

          <Link
            to={mediaDetailPath(item.id)}
            className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-on-primary shadow-lg transition-all hover:bg-tertiary-container hover:text-on-tertiary-container"
          >
            Lihat Detail Media
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
