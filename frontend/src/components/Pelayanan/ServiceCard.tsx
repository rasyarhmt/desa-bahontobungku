import { Link } from "react-router-dom";
import { ArrowRight, Phone } from "lucide-react";

import type { ServiceItem } from "@/components/Pelayanan/pelayananView";

export default function ServiceCard({ item }: { item: ServiceItem }) {
  const actionClass =
    "flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold transition-colors";

  return (
    <article className="group flex flex-col justify-between rounded-2xl bg-surface-container-lowest p-6 shadow-sm transition-all duration-300 hover:shadow-xl">
      <div>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div
            className={`flex size-12 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${item.iconClass}`}
          >
            <item.icon className="size-6" />
          </div>
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-semibold ${item.statusClass}`}
          >
            {item.statusLabel}
          </span>
        </div>

        <h3 className="mb-2 font-display text-lg font-semibold text-on-surface">
          {item.title}
        </h3>
        <p className="text-sm leading-relaxed text-on-surface-variant">
          {item.description}
        </p>
      </div>

      <div className="mt-6">
        {item.to ? (
          <Link
            to={item.to}
            className={`${actionClass} bg-surface-container text-primary hover:bg-primary hover:text-on-primary`}
          >
            Ajukan Surat
            <ArrowRight className="size-4" />
          </Link>
        ) : (
          <div
            className={`${actionClass} bg-surface-container text-on-surface-variant`}
          >
            <Phone className="size-4" />
            Hubungi Kantor Desa
          </div>
        )}
      </div>
    </article>
  );
}
