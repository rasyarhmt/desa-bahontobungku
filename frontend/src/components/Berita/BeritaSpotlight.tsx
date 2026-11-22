import { useEffect, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Newspaper, UserRound } from "lucide-react";
import { Link } from "react-router-dom";

import type { Berita } from "@/lib/api/schemas";
import { formatDateLong, formatImageUrl } from "@/lib/format";
import { CONTAINER_CLASS, cn } from "@/lib/utils";
import { beritaDetailPath, getBeritaExcerpt } from "./beritaView";

export default function BeritaSpotlight({ items }: { items: Berita[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [items.length]);

  if (!items.length) return null;

  const active = items[index % items.length];

  return (
    <section className={`${CONTAINER_CLASS} pt-12`}>
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
            Sorotan Terbaru
          </span>
          <h2 className="mt-1 font-display text-xl font-bold text-on-surface md:text-2xl">
            Berita Pilihan
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIndex((value) => (value - 1 + items.length) % items.length)}
            aria-label="Sorotan sebelumnya"
            className="flex size-9 items-center justify-center rounded-full bg-surface-container-lowest text-on-surface shadow-sm transition-colors hover:bg-primary hover:text-on-primary"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => setIndex((value) => (value + 1) % items.length)}
            aria-label="Sorotan berikutnya"
            className="flex size-9 items-center justify-center rounded-full bg-surface-container-lowest text-on-surface shadow-sm transition-colors hover:bg-primary hover:text-on-primary"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>

      <Link
        to={beritaDetailPath(active.id)}
        className="group relative block h-[340px] overflow-hidden rounded-3xl bg-inverse-surface shadow-md sm:h-[400px] lg:h-[460px]"
      >
        {active.foto ? (
          <img
            src={formatImageUrl(active.foto)}
            alt={active.judul}
            className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-surface-container">
            <Newspaper className="size-20 text-outline-variant" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/90 via-inverse-surface/25 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-6 text-inverse-on-surface lg:p-10">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-on-primary">
              <CalendarDays className="size-3.5" />
              {formatDateLong(active.tanggal_terbit)}
            </span>
            {active.penulis && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-lowest/15 px-3 py-1 text-[11px] font-medium backdrop-blur-sm">
                <UserRound className="size-3.5" />
                {active.penulis}
              </span>
            )}
          </div>
          <h3 className="line-clamp-2 font-display text-2xl font-bold leading-snug lg:text-4xl">
            {active.judul}
          </h3>
          <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-relaxed text-surface-container-high lg:text-base">
            {getBeritaExcerpt(active.isi, 170)}
          </p>
        </div>
      </Link>

      <div className="mt-4 flex justify-center gap-2">
        {items.map((item, dotIndex) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setIndex(dotIndex)}
            aria-label={`Tampilkan sorotan ${dotIndex + 1}`}
            className={cn(
              "h-2 rounded-full transition-all",
              dotIndex === index % items.length
                ? "w-7 bg-primary"
                : "w-2 bg-surface-container-highest hover:bg-outline",
            )}
          />
        ))}
      </div>
    </section>
  );
}
