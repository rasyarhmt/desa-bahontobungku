import { Quote, Sparkles } from "lucide-react";

import { SectionHeading } from "@/components/home/shared";
import { CONTAINER_CLASS, SECTION_CLASS } from "@/lib/utils";

export default function VisiMisiDesa() {
  return (
    <section className={`bg-surface ${SECTION_CLASS}`}>
      <div className={`${CONTAINER_CLASS}`}>
        <SectionHeading
          eyebrow="Identitas Desa"
          icon={Sparkles}
          title="Visi & Misi"
          description="Landasan pembangunan dan arah pembangunan Desa Bahontobungku."
        />

        <div className="relative mt-10 overflow-hidden rounded-3xl border border-surface-container bg-white p-8 shadow-sm md:mt-12 md:p-10">
          <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#006948_0%,#85f8c4_100%)]" />

          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary-container text-on-primary-container">
              <Quote className="size-5" />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                Visi & Misi Desa
              </p>
              <p className="text-xs text-on-surface-variant">
                Cita-cita dan arah pembangunan
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 md:gap-10">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                Visi
              </p>
              <h3 className="mt-3 font-display text-2xl font-bold leading-snug text-on-surface md:text-3xl">
                Bahontobungku Unggul, Masyarakat Sejahtera
              </h3>
            </div>

            <div className="md:border-l md:border-surface-container md:pl-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                Misi
              </p>
              <p className="mt-3 text-sm leading-relaxed text-on-surface-variant md:text-base">
                Mewujudkan desa yang unggul dengan masyarakat yang sejahtera
                melalui pembangunan berkelanjutan dan partisipatif.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
