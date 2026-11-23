import { ChevronRight, Home, QrCode, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

import { CONTAINER_CLASS } from "@/lib/utils";

export default function VerificationHero() {
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
          <Link to="/Pelayanan" className="hover:text-primary">
            Pelayanan
          </Link>
          <ChevronRight className="size-3.5 text-outline" />
          <span className="text-primary">Verifikasi Surat</span>
        </nav>

        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <span className="size-2 animate-pulse rounded-full bg-primary" />
              Layanan Verifikasi Publik
            </span>
            <h1 className="font-display text-3xl font-bold tracking-tight text-on-surface md:text-4xl">
              Verifikasi Keaslian Surat Desa
            </h1>
            <p className="text-sm leading-relaxed text-on-surface-variant md:text-base">
              Pastikan keaslian surat Pemerintah Desa Bahontobungku melalui kode
              unik atau QR yang tercetak pada dokumen.
            </p>
          </div>

          <div className="grid shrink-0 grid-cols-2 gap-2 rounded-2xl bg-surface-container-lowest p-3 shadow-sm">
            <div className="flex flex-col items-center gap-2 px-5 py-3 text-center">
              <ShieldCheck className="size-6 text-primary" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
                Datenya dari sistem desa
              </span>
            </div>
            <div className="flex flex-col items-center gap-2 px-5 py-3 text-center">
              <QrCode className="size-6 text-primary" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
                Kode unik / QR surat
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
