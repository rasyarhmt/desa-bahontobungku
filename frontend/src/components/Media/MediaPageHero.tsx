import { Link } from "react-router-dom";
import { ChevronRight, Home, Radio } from "lucide-react";

import { CONTAINER_CLASS } from "@/lib/utils";

export interface MediaStats {
  total: number;
  foto: number;
  video: number;
  dokumen: number;
}

export default function MediaPageHero({ stats }: { stats: MediaStats }) {
  const items = [
    { value: stats.total, label: "Total Media" },
    { value: stats.foto, label: "Arsip Foto" },
    { value: stats.video, label: "Video Warta" },
    { value: stats.dokumen, label: "Dokumen" },
  ];

  return (
    <section className="relative w-full overflow-hidden bg-surface-container-low pb-12 pt-8 md:pt-12">
      <div className="pointer-events-none absolute -top-24 -right-20 size-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-1/3 size-80 rounded-full bg-tertiary-fixed/20 blur-2xl" />

      <div className={`relative z-10 ${CONTAINER_CLASS}`}>
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center gap-2 text-xs font-semibold text-on-surface-variant"
        >
          <Link to="/" className="inline-flex items-center gap-1 hover:text-primary">
            <Home className="size-4" />
            Beranda
          </Link>
          <ChevronRight className="size-3.5 text-outline" />
          <span className="text-primary">Media Desa</span>
        </nav>

        <div className="flex flex-col justify-between gap-6 pb-4 lg:flex-row lg:items-end">
          <div className="max-w-3xl space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <span className="size-2 animate-pulse rounded-full bg-primary" />
              Kanal Informasi Resmi Desa Bahontobungku
            </span>
            <h1 className="font-display text-3xl font-bold tracking-tight text-on-surface md:text-4xl">
              Pusat Media &amp; Dokumentasi Desa
            </h1>
            <p className="text-base leading-relaxed text-on-surface-variant">
              Dokumentasi kegiatan pembangunan, liputan kemasyarakatan, arsip
              foto, video, dan dokumen resmi Pemerintah Desa Bahontobungku.
            </p>
          </div>

          <div className="grid shrink-0 grid-cols-2 gap-2 rounded-2xl bg-surface-container-lowest p-3 shadow-sm sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {items.map((item) => (
              <div key={item.label} className="px-4 py-2 text-center">
                <div className="font-display text-xl font-bold text-primary">
                  {item.value}
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 inline-flex items-center gap-2 text-[11px] text-on-surface-variant">
          <Radio className="size-3.5 text-primary" />
          Seluruh berkas bersumber dari administrasi media desa.
        </div>
      </div>
    </section>
  );
}
