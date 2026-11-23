import { Search } from "lucide-react";

import VerificationWidget from "@/components/Pelayanan/VerificationWidget";
import { CONTAINER_CLASS } from "@/lib/utils";

interface PelayananHeroProps {
  query: string;
  onQueryChange: (value: string) => void;
}

export default function PelayananHero({
  query,
  onQueryChange,
}: PelayananHeroProps) {
  return (
    <section className={`pt-8 pb-8 md:pt-12 md:pb-12 ${CONTAINER_CLASS}`}>
      <div className="relative overflow-hidden rounded-3xl bg-surface-container-low p-8 shadow-sm lg:p-12">
        <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 size-72 rounded-full bg-tertiary-fixed/30 blur-3xl" />

        <div className="relative grid items-center gap-10 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-full bg-tertiary-fixed px-3.5 py-1.5 text-xs font-semibold text-on-tertiary-fixed shadow-sm">
              <span className="size-2 animate-pulse rounded-full bg-primary" />
              Layanan Administrasi Digital
            </span>

            <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-on-surface lg:text-4xl">
              Pelayanan Mandiri &amp; Pengajuan Surat Online
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-on-surface-variant lg:text-lg">
              Urus berbagai surat keterangan dan pengantar resmi Desa
              Bahontobungku dari rumah. Setiap surat memiliki kode unik dan QR
              untuk memastikan keasliannya.
            </p>

            <div className="max-w-xl pt-2">
              <div className="flex items-center rounded-full bg-surface-container-lowest p-1.5 shadow-md">
                <Search className="ml-4 mr-2 size-5 shrink-0 text-on-surface-variant" />
                <input
                  value={query}
                  onChange={(event) => onQueryChange(event.target.value)}
                  placeholder="Cari layanan surat..."
                  className="w-full bg-transparent py-2.5 pr-4 text-sm text-on-surface placeholder:text-outline focus:outline-none"
                  aria-label="Cari layanan surat"
                />
                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById("katalog-layanan")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="shrink-0 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-on-primary transition-colors hover:bg-primary-container"
                >
                  Cari
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <VerificationWidget />
          </div>
        </div>
      </div>
    </section>
  );
}
