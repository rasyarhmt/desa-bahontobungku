import { Link } from "react-router-dom";
import { ChevronRight, Landmark } from "lucide-react";

import { CONTAINER_CLASS } from "@/lib/utils";

export default function ProfileHero() {
  return (
    <section className={`relative overflow-hidden bg-[linear-gradient(120deg,#0b1c30_0%,#0d3a35_55%,#006948_100%)] py-12 text-white md:py-16 ${CONTAINER_CLASS}`}>
      <div className="pointer-events-none absolute -top-24 -right-20 size-80 rounded-full border border-white/10" />
      <div className="pointer-events-none absolute -bottom-32 right-1/4 size-72 rounded-full bg-primary-fixed/10 blur-2xl" />

      <div className="relative space-y-4">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-primary-fixed ring-1 ring-white/20">
          <Landmark className="size-3.5" />
          Portal Resmi Pemerintah Desa
        </span>

        <div className="flex items-center gap-2 text-xs text-surface-container-high">
          <Link to="/" className="transition-colors hover:text-white">
            Home
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="text-primary-fixed">Profil Desa</span>
        </div>

        <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
          Profil Desa
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-surface-container-high md:text-base">
          Mengenal Desa Bahontobungku lebih dekat melalui visi misi, struktur
          organisasi aparatur, serta kondisi geografis dan demografinya.
        </p>
      </div>
    </section>
  );
}
