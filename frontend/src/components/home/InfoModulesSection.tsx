import { Link } from "react-router-dom";
import { ArrowRight, LayoutGrid } from "lucide-react";

import { CONTAINER_CLASS, cn } from "@/lib/utils";
import { INFO_MODULES, type InfoModule } from "@/content/home";
import { SectionHeading } from "./shared";

function InfoModuleCard({ module }: { module: InfoModule }) {
  const Icon = module.icon;

  return (
    <Link
      to={module.to}
      className="group flex flex-col items-center rounded-2xl bg-surface-container-lowest p-7 text-center shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
    >
      <div
        className={cn(
          "mb-5 flex size-16 items-center justify-center rounded-2xl shadow-sm transition-colors",
          module.iconClass,
        )}
      >
        <Icon className="size-8" strokeWidth={1.5} />
      </div>
      <h3 className="font-display text-lg font-bold text-on-surface transition-colors group-hover:text-primary">
        {module.title}
      </h3>
      <p className="mt-2.5 text-sm leading-relaxed text-on-surface-variant">
        {module.description}
      </p>
      <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
        {module.action}
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

export default function InfoModulesSection() {
  return (
    <section className={CONTAINER_CLASS}>
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeading
            eyebrow="Modul Informasi Digital"
            icon={LayoutGrid}
            title="Dapatkan Informasi Terbaru terkait desa"
            description="Desa digital sebagai sarana penunjang kebutuhan informasi dan pelayanan masyarakat secara cepat, transparan, dan terintegrasi dari mana saja."
          >
            <div className="flex items-center gap-4 pt-2">
              <div className="flex -space-x-2 overflow-hidden">
                {["KT", "SEK", "BPD"].map((initials, index) => (
                  <span
                    key={initials}
                    className={cn(
                      "flex size-10 items-center justify-center rounded-full text-xs font-bold ring-2 ring-surface",
                      index === 0 &&
                        "bg-primary-container text-on-primary-container",
                      index === 1 &&
                        "bg-secondary-container text-on-secondary-container",
                      index === 2 &&
                        "bg-surface-container-high text-on-surface",
                    )}
                  >
                    {initials}
                  </span>
                ))}
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-on-surface">
                  Aparatur Siap Melayani
                </p>
                <p className="text-[11px] text-on-surface-variant">
                  Layanan aktif setiap hari kerja (08.00 - 15.30 WITA)
                </p>
              </div>
            </div>
          </SectionHeading>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:col-span-7">
          {INFO_MODULES.map((module) => (
            <InfoModuleCard key={module.title} module={module} />
          ))}
        </div>
      </div>
    </section>
  );
}
