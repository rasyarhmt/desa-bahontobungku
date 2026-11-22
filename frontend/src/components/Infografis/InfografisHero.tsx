import { Database, ArrowDownRight } from "lucide-react";

import { CONTAINER_CLASS } from "@/lib/utils";

export type InfografisTab = "demografi" | "apbdes";

const TABS: { id: InfografisTab; label: string }[] = [
  { id: "demografi", label: "Demografi Penduduk" },
  { id: "apbdes", label: "Transparansi APBDes" },
];

interface InfografisHeroProps {
  activeTab: InfografisTab;
  onSelect: (tab: InfografisTab) => void;
}

export default function InfografisHero({
  activeTab,
  onSelect,
}: InfografisHeroProps) {
  const goTo = (tab: InfografisTab) => {
    onSelect(tab);
    document.getElementById(tab)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <section className={`pt-6 pb-10 ${CONTAINER_CLASS}`}>
      <div className="relative overflow-hidden rounded-3xl bg-surface-container-low p-8 shadow-sm lg:p-12">
        <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 size-72 rounded-full bg-tertiary-fixed/20 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-fixed px-3.5 py-1.5 text-xs font-semibold text-on-primary-fixed">
              <Database className="size-4" />
              Transparansi &amp; Data Terbuka
            </span>
            <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-on-surface lg:text-4xl">
              Infografis &amp; Statistik Desa Bahontobungku
            </h1>
            <p className="text-sm leading-relaxed text-on-surface-variant lg:text-base">
              Penyajian data kependudukan dan laporan Anggaran Pendapatan dan
              Belanja Desa yang tersedia di sistem secara terbuka dan akuntabel.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start rounded-full bg-surface-container-lowest p-1.5 shadow-sm lg:self-end">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => goTo(tab.id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary text-on-primary"
                    : "bg-transparent text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {tab.label}
                <ArrowDownRight className="size-3.5" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
