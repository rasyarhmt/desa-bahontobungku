import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Compass,
  MapPin,
  Mountain,
  Navigation,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import Bg from "@/assets/Background.jpg";
import { SectionHeading } from "@/components/home/shared";
import type { PendudukSummary } from "@/lib/api/penduduk";
import { CONTAINER_CLASS, SECTION_CLASS } from "@/lib/utils";

interface GeographySectionProps {
  summary: PendudukSummary;
  isLoading: boolean;
  error: string | null;
}

interface InfoRowProps {
  label: string;
  value: string;
}

interface InfoCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  iconClass: string;
}

interface StatCardProps {
  label: string;
  value: string;
  unit: string;
  icon: LucideIcon;
  iconClass: string;
}

const numberFormat = new Intl.NumberFormat("id-ID");

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-surface-container py-3 last:border-0">
      <dt className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">
        {label}
      </dt>
      <dd className="text-right text-sm font-semibold text-on-surface">{value}</dd>
    </div>
  );
}

function InfoCard({ icon: Icon, title, description, iconClass }: InfoCardProps) {
  return (
    <div className="rounded-2xl border border-surface-container bg-white p-5 shadow-sm">
      <div className={`flex size-9 items-center justify-center rounded-xl ${iconClass}`}>
        <Icon className="size-5" />
      </div>
      <h4 className="mt-3 font-display text-sm font-bold text-on-surface">{title}</h4>
      <p className="mt-1.5 text-xs leading-relaxed text-on-surface-variant">
        {description}
      </p>
    </div>
  );
}

function StatCard({ label, value, unit, icon: Icon, iconClass }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-surface-container bg-surface-container-low p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
          {label}
        </span>
        <Icon className={`size-4 ${iconClass}`} />
      </div>
      <p className="mt-2 font-display text-2xl font-bold text-on-surface">
        {value}{" "}
        <span className="text-xs font-normal text-on-surface-variant">{unit}</span>
      </p>
    </div>
  );
}

export default function GeographySection({
  summary,
  isLoading,
  error,
}: GeographySectionProps) {
  const display = (value: number) =>
    isLoading ? "..." : numberFormat.format(value);

  return (
    <section
      id="geografis"
      className={`scroll-mt-40 bg-surface-container-low/60 ${SECTION_CLASS}`}
    >
      <div className={`space-y-10 md:space-y-12 ${CONTAINER_CLASS}`}>
        <SectionHeading
          eyebrow="Wilayah & Kependudukan"
          icon={MapPin}
          title="Kondisi Geografis & Demografi"
          description="Letak administratif, batas wilayah, serta gambaran kependudukan Desa Bahontobungku berdasarkan data yang tersedia."
        />

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="overflow-hidden rounded-3xl border border-surface-container bg-white shadow-sm lg:col-span-7">
            <div className="relative h-72 md:h-96">
              <img
                src={Bg}
                alt="Peta wilayah administrasi Desa Bahontobungku"
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/85 via-inverse-surface/10 to-transparent" />

              <span className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-surface/90 px-3 py-1.5 text-xs font-semibold text-primary shadow-sm backdrop-blur">
                <Compass className="size-3.5" />
                Peta Wilayah Desa
              </span>

              <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-end justify-between gap-3 text-white">
                <div className="space-y-1">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <Navigation className="size-4 text-primary-fixed" />
                    Titik Koordinat Desa
                  </p>
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    <span className="rounded-full bg-black/35 px-2.5 py-1 backdrop-blur">
                      121° 956690" BT
                    </span>
                    <span className="rounded-full bg-black/35 px-2.5 py-1 backdrop-blur">
                      -2,649603" LS
                    </span>
                  </div>
                </div>
                <Link
                  to="/Map"
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-on-primary transition-colors hover:bg-tertiary-container"
                >
                  Lihat Peta Lengkap
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
            </div>

            <div className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-relaxed text-on-surface-variant">
                Desa Bahontobungku berada dalam wilayah administrasi Kecamatan
                Bungku Tengah, Kabupaten Morowali, Sulawesi Tengah.
              </p>
              <span className="shrink-0 rounded-full bg-surface-container px-3 py-1 text-center text-[11px] font-semibold text-primary">
                Kec. Bungku Tengah
              </span>
            </div>
          </div>

          <div className="space-y-4 lg:col-span-5">
            <div className="rounded-3xl border border-surface-container bg-white p-6 shadow-sm">
              <h3 className="font-display text-lg font-bold text-on-surface">
                Informasi Wilayah
              </h3>
              <dl className="mt-3">
                <InfoRow
                  label="Lokasi"
                  value="Kab. Morowali, Sulawesi Tengah"
                />
                <InfoRow label="Kode Pos" value="94973" />
                <InfoRow label="Bujur Timur" value={'121° 956690"'} />
                <InfoRow label="Lintang Selatan" value={'-2,649603"'} />
              </dl>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InfoCard
                icon={Compass}
                title="Batas Administrasi"
                description="Utara: Kec. Bungku Utara. Timur: Teluk Bungku. Selatan: Kec. Bungku Selatan. Barat: Kab. Morowali Utara."
                iconClass="bg-primary-container text-on-primary-container"
              />
              <InfoCard
                icon={Mountain}
                title="Topografi & Iklim"
                description="Dominan dataran pesisir pada ketinggian 0–150 mdpl dengan iklim tropis dan suhu rata-rata 26–30°C."
                iconClass="bg-primary-fixed-dim text-on-primary-fixed"
              />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-surface-container bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-lg font-bold text-on-surface">
                Kondisi Demografi
              </h3>
              <p className="mt-1 text-xs text-on-surface-variant">
                Data kependudukan bersumber dari sistem desa.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container px-3 py-1 text-[11px] font-semibold text-primary">
              <UsersRound className="size-3.5" />
              Data Terbaru
            </span>
          </div>

          {error && <p className="mt-3 text-xs text-destructive">{error}</p>}

          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard
              label="Total Penduduk"
              value={display(summary.totalPenduduk)}
              unit="Jiwa"
              icon={UsersRound}
              iconClass="text-primary"
            />
            <StatCard
              label="Kepala Keluarga"
              value={display(summary.totalKepalaKeluarga)}
              unit="KK"
              icon={MapPin}
              iconClass="text-primary"
            />
            <StatCard
              label="Laki-laki"
              value={display(summary.totalLakiLaki)}
              unit="Jiwa"
              icon={Navigation}
              iconClass="text-tertiary-container"
            />
            <StatCard
              label="Perempuan"
              value={display(summary.totalPerempuan)}
              unit="Jiwa"
              icon={Compass}
              iconClass="text-primary"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
