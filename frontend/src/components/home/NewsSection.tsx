import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Newspaper } from "lucide-react";

import { CONTAINER_CLASS, cn, SECTION_CLASS } from "@/lib/utils";
import type { NewsItem } from "@/content/home";
import { SectionHeading } from "./shared";

function NewsCard({ item }: { item: NewsItem }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm transition-all duration-300 hover:shadow-lg">
      <div className="relative h-48 overflow-hidden">
        <img
          src={item.image}
          alt={item.title}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span
          className={cn(
            "absolute top-3 left-3 rounded-full px-2.5 py-1 text-[11px] font-semibold",
            item.categoryClass,
          )}
        >
          {item.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] text-on-surface-variant">
            <CalendarDays className="size-3.5" />
            <span>{item.date}</span>
            <span>•</span>
            <span>{item.author}</span>
          </div>
          <h3 className="line-clamp-2 font-display text-lg font-bold text-on-surface transition-colors group-hover:text-primary">
            {item.title}
          </h3>
          <p className="mt-2.5 line-clamp-3 text-sm text-on-surface-variant">
            {item.excerpt}
          </p>
        </div>
        <Link
          to={item.to}
          className="mt-6 flex items-center justify-between border-t border-surface-container pt-4 text-xs font-semibold text-primary"
        >
          Baca Selengkapnya
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}

export default function NewsSection({ items }: { items: NewsItem[] }) {
  return (
    <section className={`w-full bg-surface-container-low ${SECTION_CLASS}`}>
      <div className={CONTAINER_CLASS}>
        <div className="mb-10 flex flex-col justify-between gap-6 md:mb-12 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="Kabar Desa Terkini"
            icon={Newspaper}
            title="Berita & Agenda Bahontobungku"
            description="Pemberitaan resmi seputar kegiatan warga, pembangunan infrastruktur, dan kemajuan desa."
          />
          <Link
            to="/Information"
            className="inline-flex items-center gap-1.5 self-start rounded-full bg-surface-container-lowest px-5 py-2.5 text-xs font-semibold text-on-surface shadow-sm transition-all hover:bg-primary hover:text-on-primary md:self-auto"
          >
            Arsip Berita Lengkap
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {items.length ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {items.map((item) => (
              <NewsCard key={item.to} item={item} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl bg-surface-container-lowest p-10 text-center text-sm text-on-surface-variant">
            Belum ada berita yang dipublikasikan.
          </p>
        )}
      </div>
    </section>
  );
}
