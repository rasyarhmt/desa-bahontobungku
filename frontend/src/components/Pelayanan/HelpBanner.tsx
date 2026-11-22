import { Clock3, MapPin, MessageCircle } from "lucide-react";

import cs from "@/assets/cs.png";
import type { HomeContact } from "@/content/home";
import { CONTAINER_CLASS } from "@/lib/utils";

export default function HelpBanner({ contact }: { contact?: HomeContact }) {
  return (
    <section className={`py-12 pb-20 ${CONTAINER_CLASS}`}>
      <div className="relative overflow-hidden rounded-3xl bg-inverse-surface p-8 text-inverse-on-surface shadow-xl lg:p-12">
        <div className="grid items-center gap-8 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-on-primary">
              <MessageCircle className="size-4" />
              Bantuan &amp; Loket Fisik
            </span>

            <h2 className="font-display text-2xl font-bold text-inverse-on-surface lg:text-3xl">
              Butuh Bantuan Pengisian atau Pelayanan Tatap Muka?
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-surface-container-high lg:text-base">
              Tim pelayanan Desa Bahontobungku siap membantu apabila Anda
              mengalami kendala saat mengisi formulir atau memverifikasi surat.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-xl bg-surface/10 p-4">
                <Clock3 className="mt-0.5 size-5 shrink-0 text-primary-fixed" />
                <div>
                  <p className="text-xs font-semibold text-inverse-on-surface">
                    Jam Operasional Kantor
                  </p>
                  <p className="mt-0.5 text-xs text-surface-container-high">
                    Senin - Jumat: 08.00 - 15.30 WITA
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-surface/10 p-4">
                <MapPin className="mt-0.5 size-5 shrink-0 text-primary-fixed" />
                <div>
                  <p className="text-xs font-semibold text-inverse-on-surface">
                    Balai Desa Bahontobungku
                  </p>
                  <p className="mt-0.5 text-xs text-surface-container-high">
                    Jl. Trans Sulawesi No. 12, Kec. Bungku Tengah
                  </p>
                </div>
              </div>
            </div>

            <a
              href={contact?.whatsappUrl ?? "https://wa.me/628114567890"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-on-primary shadow-lg transition-colors hover:bg-primary-container"
            >
              <MessageCircle className="size-5" />
              Hubungi Petugas via WhatsApp
            </a>
          </div>

          <div className="lg:col-span-5">
            <div className="flex h-64 items-center justify-center rounded-2xl bg-surface/10 p-6 shadow-lg lg:h-72">
              <img
                src={cs}
                alt="Ilustrasi pelayanan desa"
                className="h-full w-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
