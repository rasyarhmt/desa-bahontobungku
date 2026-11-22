import { Link } from "react-router-dom";
import { ArrowRight, MousePointerClick } from "lucide-react";

import { CONTAINER_CLASS, cn } from "@/lib/utils";
import type { SelfServiceItem } from "@/content/home";
import { SectionHeading } from "./shared";

function ServiceCard({ service }: { service: SelfServiceItem }) {
  const Icon = service.icon;
  const ProcessingIcon = service.processingIcon;

  return (
    <div className="flex flex-col justify-between rounded-2xl bg-surface-container-lowest p-6 shadow-sm transition-shadow hover:shadow-md">
      <div>
        <div
          className={cn(
            "mb-4 flex size-12 items-center justify-center rounded-xl",
            service.iconClass,
          )}
        >
          <Icon className="size-6" />
        </div>
        <h4 className="mt-1 font-display text-lg font-bold text-on-surface">
          {service.title}
        </h4>
        <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
          {service.description}
        </p>
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-surface-container pt-4">
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
          <ProcessingIcon className="size-3.5" />
          {service.processing}
        </span>
        <ButtonLink to={service.to}>Ajukan</ButtonLink>
      </div>
    </div>
  );
}

function ButtonLink({ to }: { to: string }) {
  return (
    <Link
      to={to}
      className="rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-on-primary transition-colors hover:bg-tertiary-container"
    >
      Ajukan
    </Link>
  );
}

export default function SelfServiceSection({
  services,
  total,
}: {
  services: SelfServiceItem[];
  total: number;
}) {
  return (
    <section className="w-full bg-surface-container-low py-20">
      <div className={CONTAINER_CLASS}>
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="Layanan Mandiri Warga"
            icon={MousePointerClick}
            title="Urus Dokumen Desa Langsung dari Ponsel"
            description="Pilih jenis surat pengantar yang Anda butuhkan, isi formulir online, dan ambil surat yang sudah ditandatangani secara elektronik."
            className="max-w-xl"
          />
          <Link
            to="/Pelayanan"
            className="inline-flex items-center gap-1.5 self-start rounded-full bg-surface-container-lowest px-5 py-2.5 text-xs font-semibold text-primary shadow-sm transition-all hover:bg-primary hover:text-on-primary md:self-auto"
          >
            Semua Layanan ({total} Jenis)
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {services.length ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.to} service={service} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl bg-surface-container-lowest p-10 text-center text-sm text-on-surface-variant">
            Belum ada layanan aktif yang tersedia.
          </p>
        )}
      </div>
    </section>
  );
}
