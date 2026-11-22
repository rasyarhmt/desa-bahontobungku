import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Newspaper,
  PenLine,
  Share2,
} from "lucide-react";
import { Link } from "react-router-dom";

import type { Berita } from "@/lib/api/schemas";
import { formatDateLong, formatDateShort, formatImageUrl } from "@/lib/format";
import { CONTAINER_CLASS } from "@/lib/utils";
import { beritaDetailPath } from "./beritaView";

interface BeritaDetailViewProps {
  item: Berita;
  related: Berita[];
}

function RelatedBeritaItem({ item }: { item: Berita }) {
  return (
    <Link
      to={beritaDetailPath(item.id)}
      className="group flex gap-3 rounded-2xl bg-surface-container-lowest p-3 shadow-sm transition-colors hover:bg-surface-container"
    >
      <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-container">
        {item.foto ? (
          <img
            src={formatImageUrl(item.foto)}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          <Newspaper className="size-6 text-outline-variant" />
        )}
      </div>
      <div className="min-w-0">
        <span className="text-[10px] font-medium text-on-surface-variant">
          {formatDateShort(item.tanggal_terbit)}
        </span>
        <h3 className="mt-0.5 line-clamp-2 text-xs font-bold leading-snug text-on-surface transition-colors group-hover:text-primary">
          {item.judul}
        </h3>
      </div>
    </Link>
  );
}

export default function BeritaDetailView({ item, related }: BeritaDetailViewProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: item.judul, url });
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
    <div className="flex flex-col gap-8 pb-20">
      <section className={`${CONTAINER_CLASS} pt-6`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-[11px] font-medium text-on-surface-variant"
          >
            <Link to="/" className="hover:text-primary">
              Beranda
            </Link>
            <span className="text-outline-variant">/</span>
            <Link to="/Information" className="hover:text-primary">
              Informasi
            </Link>
            <span className="text-outline-variant">/</span>
            <span className="max-w-xs truncate font-semibold text-on-surface md:max-w-md">
              {item.judul}
            </span>
          </nav>

          <Link
            to="/Information"
            className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-high px-3 py-1.5 text-xs font-semibold text-on-surface-variant transition-all hover:text-primary"
          >
            <ArrowLeft className="size-4" />
            Kembali ke Berita
          </Link>
        </div>
      </section>

      <section className={CONTAINER_CLASS}>
        <article className="relative overflow-hidden rounded-3xl bg-surface-container-lowest p-8 shadow-md lg:p-12">
          <div className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-primary-fixed/20 blur-3xl" />
          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1 text-xs font-semibold text-on-primary shadow-sm">
                <Newspaper className="size-3.5" />
                Berita Resmi Desa
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container px-3 py-1 text-xs font-medium text-primary">
                <Check className="size-3.5" />
                Publikasi Resmi
              </span>
            </div>

            <div className="space-y-3">
              <h1 className="font-display text-2xl leading-snug font-bold tracking-tight text-on-surface md:text-4xl">
                {item.judul}
              </h1>
            </div>

            <div className="grid grid-cols-1 gap-4 rounded-2xl bg-surface-container-low px-5 py-4 sm:grid-cols-3">
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-container text-primary">
                  <CalendarDays className="size-5" />
                </span>
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
                    Tanggal Terbit
                  </div>
                  <div className="truncate text-sm font-bold text-on-surface">
                    {formatDateLong(item.tanggal_terbit)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-container text-primary">
                  <PenLine className="size-5" />
                </span>
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
                    Penulis
                  </div>
                  <div className="truncate text-sm font-bold text-on-surface">
                    {item.penulis || "-"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-container text-primary">
                  <Check className="size-5" />
                </span>
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
                    Status Publikasi
                  </div>
                  <div className="truncate text-sm font-bold text-on-surface">
                    {item.status}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => void handleShare()}
                className="inline-flex items-center gap-2 rounded-full bg-surface-container-high px-5 py-3 text-sm font-semibold text-on-surface transition-all hover:bg-surface-container-highest"
              >
                <Share2 className="size-4" />
                {copied ? "Tautan Disalin" : "Bagikan Berita"}
              </button>
            </div>
          </div>
        </article>
      </section>

      <section className={CONTAINER_CLASS}>
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {item.foto ? (
              <img
                src={formatImageUrl(item.foto)}
                alt={item.judul}
                className="max-h-[560px] w-full rounded-3xl bg-surface-container object-cover shadow-md"
              />
            ) : (
              <div className="flex h-72 items-center justify-center rounded-3xl bg-surface-container shadow-md">
                <Newspaper className="size-16 text-outline-variant" />
              </div>
            )}

            <div className="mt-6 rounded-3xl bg-surface-container-lowest p-8 shadow-sm lg:p-10">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                Isi Berita
              </span>
              <div className="mt-4 whitespace-pre-line text-sm leading-8 text-on-surface-variant">
                {item.isi}
              </div>
            </div>
          </div>

          <aside className="lg:col-span-4">
            <div className="rounded-3xl bg-surface-container-low p-6 shadow-sm lg:sticky lg:top-28">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                Arsip Terkini
              </span>
              <h2 className="mt-1 font-display text-xl font-bold text-on-surface">
                Berita Lainnya
              </h2>

              <div className="mt-4 space-y-3">
                {related.length ? (
                  related.map((berita) => (
                    <RelatedBeritaItem key={berita.id} item={berita} />
                  ))
                ) : (
                  <p className="rounded-2xl bg-surface-container-lowest p-5 text-center text-xs text-on-surface-variant">
                    Belum ada berita lain yang dipublikasikan.
                  </p>
                )}
              </div>

              <Link
                to="/Information"
                className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                Lihat semua berita
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
