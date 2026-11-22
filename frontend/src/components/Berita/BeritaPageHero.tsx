import { CalendarDays, Newspaper, PenLine, Search } from "lucide-react";
import { Link } from "react-router-dom";

import { formatDateShort } from "@/lib/format";
import { CONTAINER_CLASS } from "@/lib/utils";

interface BeritaPageHeroProps {
  total: number;
  penulis: number;
  terbaru: string | null;
  query: string;
  onQueryChange: (value: string) => void;
}

export default function BeritaPageHero({
  total,
  penulis,
  terbaru,
  query,
  onQueryChange,
}: BeritaPageHeroProps) {
  const stats = [
    { value: String(total), label: "Total Berita" },
    { value: String(penulis), label: "Penulis" },
    { value: formatDateShort(terbaru), label: "Terbit Terakhir" },
  ];

  return (
    <section className="relative w-full overflow-hidden bg-surface-container-low pb-12 pt-6">
      <div className="pointer-events-none absolute -top-24 -right-20 size-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-1/3 size-80 rounded-full bg-tertiary-fixed/20 blur-2xl" />

      <div className={`relative z-10 ${CONTAINER_CLASS}`}>
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center gap-2 text-xs font-semibold text-on-surface-variant"
        >
          <Link to="/" className="inline-flex items-center gap-1 hover:text-primary">
            Beranda
          </Link>
          <span className="text-outline-variant">/</span>
          <span className="text-primary">Informasi</span>
        </nav>

        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <span className="size-2 animate-pulse rounded-full bg-primary" />
              Kabar Resmi Pemerintah Desa
            </span>
            <h1 className="font-display text-3xl font-bold tracking-tight text-on-surface md:text-4xl">
              Informasi &amp; Berita Desa
            </h1>
            <p className="text-sm leading-relaxed text-on-surface-variant md:text-base">
              Arsip pemberitaan resmi seputar kegiatan, pembangunan, dan
              pengumuman Desa Bahontobungku yang diterbitkan melalui portal ini.
            </p>
          </div>

          <div className="grid shrink-0 grid-cols-3 gap-2 rounded-2xl bg-surface-container-lowest p-3 shadow-sm">
            {stats.map((stat) => (
              <div key={stat.label} className="px-3 py-2 text-center">
                <div className="truncate font-display text-base font-bold text-primary lg:text-xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-on-surface-variant lg:text-[10px]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex max-w-2xl items-center rounded-full bg-surface-container-lowest p-1.5 shadow-sm">
          <Search className="ml-4 mr-2 size-5 shrink-0 text-outline" />
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Cari judul, isi, atau penulis berita..."
            aria-label="Cari berita"
            className="w-full bg-transparent py-2.5 pr-4 text-sm text-on-surface outline-none placeholder:text-outline focus:outline-none"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] text-on-surface-variant">
          <span className="inline-flex items-center gap-1.5">
            <Newspaper className="size-3.5 text-primary" />
            Seluruh berita bersumber dari administrasi desa.
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5 text-primary" />
            Diurutkan berdasarkan tanggal terbit.
          </span>
          <span className="inline-flex items-center gap-1.5">
            <PenLine className="size-3.5 text-primary" />
            Penulis mengikuti data yang tercatat.
          </span>
        </div>
      </div>
    </section>
  );
}
