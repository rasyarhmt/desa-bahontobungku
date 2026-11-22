import { Link } from "react-router-dom";
import {
  AtSign,
  Clock3,
  Headset,
  Landmark,
  Mail,
  MapPin,
  MessagesSquare,
  Phone,
  Rss,
  Youtube,
} from "lucide-react";

import { CONTAINER_CLASS } from "@/lib/utils";

const SOCIAL_LINKS = [
  { label: "Portal Pengumuman", to: "/Information", icon: Rss },
  { label: "Pusat Bantuan", to: "/Information", icon: MessagesSquare },
  { label: "Siaran YouTube", to: "/Information", icon: Youtube },
  { label: "Email Publik", to: "/Information", icon: AtSign },
];

export default function HomeFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border bg-surface-container-low text-on-surface-variant">
      <div className={`${CONTAINER_CLASS} py-14`}>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Identitas Desa */}
          <div className="space-y-4 lg:col-span-4 lg:pr-6">
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
          <div className="space-y-4 lg:col-span-3">
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

          {/* Kontak Warga */}
          <div className="space-y-4 lg:col-span-3">
            <h3 className="font-display text-xs font-bold tracking-[0.12em] text-on-surface uppercase">
              Kontak Warga
            </h3>
            <ul className="space-y-3 text-sm leading-relaxed">
              <li>
                <a
                  href="tel:04562110892"
                  className="inline-flex items-start gap-2.5 transition-colors hover:text-primary"
                >
                  <Phone className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>(0456) 2110-892</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:kontak@bahontobungku.desa.id"
                  className="inline-flex items-start gap-2.5 transition-colors hover:text-primary"
                >
                  <Mail className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span className="whitespace-nowrap">
                    kontak@bahontobungku.desa.id
                  </span>
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Headset className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>Hotline Pengaduan Warga 24 Jam</span>
              </li>
            </ul>
          </div>

          {/* Kanal Resmi Desa */}
          <div className="space-y-4 lg:col-span-2">
            <h3 className="font-display text-xs font-bold tracking-[0.12em] text-on-surface uppercase">
              Kanal Resmi
            </h3>
            <p className="text-sm leading-relaxed">
              Ikuti saluran informasi dan publikasi resmi desa:
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {SOCIAL_LINKS.map(({ label, to, icon: Icon }) => (
                <Link
                  key={label}
                  to={to}
                  title={label}
                  aria-label={label}
                  className="flex size-9 items-center justify-center rounded-xl border border-border bg-surface-container text-on-surface-variant transition-colors hover:border-primary/40 hover:bg-primary hover:text-on-primary"
                >
                  <Icon className="size-4" />
                </Link>
              ))}
            </div>
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
