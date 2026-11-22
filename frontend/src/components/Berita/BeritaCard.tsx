import { ArrowRight, CalendarDays, Newspaper, UserRound } from "lucide-react";
import { Link } from "react-router-dom";

import type { Berita } from "@/lib/api/schemas";
import { formatDateLong, formatImageUrl } from "@/lib/format";
import { beritaDetailPath, getBeritaExcerpt } from "./beritaView";

export default function BeritaCard({ item }: { item: Berita }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm transition-all duration-300 hover:shadow-xl">
      <Link
        to={beritaDetailPath(item.id)}
        className="relative block h-52 w-full overflow-hidden bg-surface-container"
      >
        {item.foto ? (
          <img
            src={formatImageUrl(item.foto)}
            alt={item.judul}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-surface-container">
            <Newspaper className="size-14 text-outline-variant" />
          </div>
        )}
        <span className="absolute top-3 left-3 rounded-full bg-surface-container-lowest/90 px-3 py-1 text-[11px] font-bold text-primary shadow-sm backdrop-blur-md">
          Berita
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-on-surface-variant">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5" />
            {formatDateLong(item.tanggal_terbit)}
          </span>
          {item.penulis && (
            <>
              <span className="text-outline-variant">•</span>
              <span className="inline-flex items-center gap-1.5">
                <UserRound className="size-3.5" />
                {item.penulis}
              </span>
            </>
          )}
        </div>

        <Link to={beritaDetailPath(item.id)} className="mt-3">
          <h3 className="line-clamp-2 font-display text-base font-bold leading-snug text-on-surface transition-colors group-hover:text-primary">
            {item.judul}
          </h3>
        </Link>
        <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-on-surface-variant">
          {getBeritaExcerpt(item.isi)}
        </p>

        <Link
          to={beritaDetailPath(item.id)}
          className="mt-6 flex items-center justify-between border-t border-surface-container pt-4 text-xs font-semibold text-primary"
        >
          Baca Selengkapnya
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}
