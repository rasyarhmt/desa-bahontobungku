import { Link } from "react-router-dom";
import { Clock3, Landmark, MapPin } from "lucide-react";

import { CONTAINER_CLASS } from "@/lib/utils";

export default function HomeFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border bg-surface-container-low text-on-surface-variant">
      <div className={`${CONTAINER_CLASS} py-14`}>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Identitas Desa */}
          <div className="space-y-4 lg:col-span-6 lg:pr-6">
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary shadow-sm">
                <Landmark className="size-5" />
              </span>
              <span className="flex flex-col">
                <span className="font-display text-sm font-bold tracking-wide text-on-surface uppercase">
                  Desa Bahontobungku
                </span>
                <span className="text-xs text-on-surface-variant">
                  Kec. Bungku Tengah, Kab. Morowali
                </span>
              </span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed">
              Portal Satu Data dan Pelayanan Administrasi Digital Terpadu
              Pemerintah Desa Bahontobungku untuk tata kelola desa yang
              transparan, profesional, dan akuntabel.
            </p>
          </div>

          {/* Alamat Kantor */}
          <div className="space-y-4 lg:col-span-6">
            <h3 className="font-display text-xs font-bold tracking-[0.12em] text-on-surface uppercase">
              Alamat Kantor
            </h3>
            <ul className="space-y-3 text-sm leading-relaxed">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>
                  Jl. Trans Sulawesi No. 12, Bahontobungku, Kec. Bungku Tengah,
                  Kab. Morowali, Sulawesi Tengah 94973
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock3 className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>Senin – Jumat, 08:00 – 15:30 WITA</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={`${CONTAINER_CLASS} border-t border-border bg-surface-container py-4`}>
        <div className="flex flex-col items-center justify-between gap-2 text-center text-xs md:flex-row md:text-left">
          <span>
            © {currentYear} Pemerintah Desa Bahontobungku. Hak cipta dilindungi.
          </span>
          <div className="flex items-center gap-3">
            <Link
              to="/Information"
              className="transition-colors hover:text-on-surface"
            >
              Kebijakan Privasi
            </Link>
            <span aria-hidden="true">•</span>
            <Link
              to="/Information"
              className="transition-colors hover:text-on-surface"
            >
              Keterbukaan Informasi Publik
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
