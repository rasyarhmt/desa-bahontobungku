import { CircleUserRound } from "lucide-react";

import { CONTAINER_CLASS, cn } from "@/lib/utils";
import type { ApparatusItem } from "@/content/home";
import { SectionHeading } from "./shared";

function ApparatusCard({ item }: { item: ApparatusItem }) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-surface-container-lowest p-6 text-center shadow-sm transition-all hover:shadow-md">
      <div
        className={cn(
          "mb-4 flex size-24 items-center justify-center overflow-hidden rounded-full text-2xl font-bold shadow-sm",
          item.avatarClass,
        )}
      >
        {item.image ? (
          <img src={item.image} alt={item.name} className="size-full object-cover" />
        ) : (
          item.initials
        )}
      </div>
      <h4 className="font-display text-lg font-bold text-on-surface">{item.name}</h4>
      <p className="text-xs font-semibold text-primary">{item.role}</p>
      {item.description && (
        <p className="mt-3 text-[11px] leading-relaxed text-on-surface-variant">
          {item.description}
        </p>
      )}
      {item.tag && (
        <span className="mt-4 rounded-full bg-surface-container px-3 py-1 text-[11px] text-on-surface">
          {item.tag}
        </span>
      )}
    </div>
  );
}

export default function ApparatusSection({ items }: { items: ApparatusItem[] }) {
  return (
    <section className={`${CONTAINER_CLASS} py-20`}>
      <SectionHeading
        eyebrow="Aparatur Pemerintah Desa"
        icon={CircleUserRound}
        title="Pelayan Masyarakat Bahontobungku"
        description="Kenali jajaran pimpinan dan staf pemerintah desa yang berdedikasi mengawal kemajuan desa kita bersama."
        className="mx-auto mb-14 max-w-2xl text-center"
      />
      {items.length ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <ApparatusCard key={`${item.name}-${item.role}`} item={item} />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl bg-surface-container-lowest p-10 text-center text-sm text-on-surface-variant">
          Belum ada data aparatur yang tersedia.
        </p>
      )}
    </section>
  );
}
