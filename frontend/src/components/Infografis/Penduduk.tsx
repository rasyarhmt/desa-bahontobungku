import { useMemo } from "react";
import { IdCard, Loader2, TriangleAlert, UserRound, Users, UsersRound } from "lucide-react";

import DonutChart from "@/components/Infografis/DonutChart";
import ProgressRow from "@/components/Infografis/ProgressRow";
import StatCard from "@/components/Infografis/StatCard";
import {
  formatNumber,
  formatPercent,
} from "@/components/Infografis/infografisView";
import { pendudukApi, type PendudukStatsAll } from "@/lib/api/penduduk";
import type { StatsCategory } from "@/lib/api/schemas";
import { CONTAINER_CLASS } from "@/lib/utils";
import { useAsyncData } from "@/hooks";

type StatsItem = StatsCategory[number];

const categoryLabel = (item: StatsItem): string => {
  const candidate = [item.label, item.nama, item.kategori, item.agama, item.rentang, item.title]
    .map((value) => (value == null ? "" : String(value).trim()))
    .find(Boolean);
  return candidate || "Tanpa label";
};

const categoryValue = (item: StatsItem): number =>
  Number(item.jumlah ?? item.count ?? item.total ?? 0);

const toSegments = (items: StatsCategory) =>
  items.map((item, index) => ({
    label: categoryLabel(item),
    value: categoryValue(item),
    colorIndex: index,
  }));

const sumValues = (values: { value: number }[]): number =>
  values.reduce((sum, item) => sum + item.value, 0);

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl bg-surface-container px-5 py-8 text-center text-sm text-on-surface-variant">
      {message}
    </div>
  );
}

export default function Penduduk() {
  const {
    data: stats,
    isLoading,
    error,
    refetch: fetchData,
  } = useAsyncData<PendudukStatsAll>(
    () => pendudukApi.getAllStats(),
    {
      summary: {
        totalPenduduk: 0,
        totalKepalaKeluarga: 0,
        totalLakiLaki: 0,
        totalPerempuan: 0,
      },
      byAgama: [],
      byUmur: [],
    },
    { errorMessage: "Gagal memuat data penduduk. Silakan coba lagi nanti." },
  );

  const ageSegments = useMemo(() => toSegments(stats.byUmur), [stats.byUmur]);
  const religionSegments = useMemo(
    () => toSegments(stats.byAgama),
    [stats.byAgama],
  );
  const genderSegments = useMemo(
    () => [
      { label: "Laki-laki", value: stats.summary.totalLakiLaki, colorIndex: 0 },
      { label: "Perempuan", value: stats.summary.totalPerempuan, colorIndex: 1 },
    ],
    [stats.summary.totalLakiLaki, stats.summary.totalPerempuan],
  );

  const ageTotal = sumValues(ageSegments);
  const religionTotal = sumValues(religionSegments);
  const genderTotal = sumValues(genderSegments);

  if (isLoading) {
    return (
      <div className={`py-12 ${CONTAINER_CLASS}`}>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-2xl bg-surface-container/70"
            />
          ))}
        </div>
        <div className="mt-6 grid h-80 animate-pulse place-items-center rounded-2xl bg-surface-container/50">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`py-12 ${CONTAINER_CLASS}`}>
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <TriangleAlert className="mx-auto size-8 text-destructive" />
          <p className="mt-3 text-sm text-destructive">{error}</p>
          <button
            type="button"
            onClick={() => void fetchData()}
            className="mt-4 rounded-full bg-primary px-5 py-2 text-xs font-semibold text-on-primary hover:bg-primary-container"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <section
      id="demografi"
      className={`scroll-mt-28 space-y-10 py-12 ${CONTAINER_CLASS}`}
    >
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            01 / Kependudukan
          </span>
          <h2 className="font-display text-2xl font-bold text-on-surface md:text-3xl">
            Demografi Penduduk
          </h2>
          <p className="text-sm text-on-surface-variant md:text-base">
            Karakteristik penduduk yang bersumber dari sistem kependudukan desa.
          </p>
        </div>
        <span className="self-start rounded-full bg-surface-container px-3 py-1.5 text-xs font-semibold text-on-surface-variant md:self-auto">
          Sumber: Sistem Kependudukan
        </span>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Penduduk"
          value={formatNumber(stats.summary.totalPenduduk)}
          unit="Jiwa"
          icon={UsersRound}
          note="Total"
        />
        <StatCard
          label="Kepala Keluarga"
          value={formatNumber(stats.summary.totalKepalaKeluarga)}
          unit="KK"
          icon={IdCard}
          colorIndex={1}
        />
        <StatCard
          label="Penduduk Laki-laki"
          value={formatNumber(stats.summary.totalLakiLaki)}
          unit="Jiwa"
          icon={UserRound}
          colorIndex={2}
          note={formatPercent(stats.summary.totalLakiLaki, genderTotal)}
        />
        <StatCard
          label="Penduduk Perempuan"
          value={formatNumber(stats.summary.totalPerempuan)}
          unit="Jiwa"
          icon={Users}
          colorIndex={3}
          note={formatPercent(stats.summary.totalPerempuan, genderTotal)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <article className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm lg:col-span-5 lg:p-8">
          <div className="space-y-1">
            <h3 className="font-display text-lg font-semibold text-on-surface">
              Struktur Kelompok Usia
            </h3>
            <p className="text-sm text-on-surface-variant">
              Distribusi penduduk berdasarkan rentang usia yang tercatat.
            </p>
          </div>

          {ageSegments.length > 0 ? (
            <div className="mt-6 flex flex-col items-center gap-8 sm:flex-row">
              <DonutChart
                segments={ageSegments}
                centerLabel="Jiwa"
                centerValue={formatNumber(ageTotal)}
              />
              <div className="w-full space-y-4">
                {ageSegments.map((segment, index) => (
                  <ProgressRow
                    key={`${segment.label}-${index}`}
                    label={segment.label}
                    value={segment.value}
                    total={ageTotal}
                    colorIndex={segment.colorIndex}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <EmptyState message="Belum ada data kelompok usia dari sistem." />
            </div>
          )}
        </article>

        <article className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm lg:col-span-7 lg:p-8">
          <div className="space-y-1">
            <h3 className="font-display text-lg font-semibold text-on-surface">
              Komposisi Jenis Kelamin
            </h3>
            <p className="text-sm text-on-surface-variant">
              Perbandingan jumlah penduduk laki-laki dan perempuan.
            </p>
          </div>

          <div className="mt-6 flex flex-col items-center gap-8 sm:flex-row">
            <DonutChart
              segments={genderSegments}
              centerLabel="Jiwa"
              centerValue={formatNumber(genderTotal)}
            />
            <div className="w-full space-y-4">
              {genderSegments.map((segment) => (
                <ProgressRow
                  key={segment.label}
                  label={segment.label}
                  value={segment.value}
                  total={genderTotal}
                  colorIndex={segment.colorIndex ?? 0}
                />
              ))}
            </div>
          </div>
        </article>
      </div>

      <article className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm lg:p-8">
        <div className="space-y-1">
          <h3 className="font-display text-lg font-semibold text-on-surface">
            Distribusi Keyakinan
          </h3>
          <p className="text-sm text-on-surface-variant">
            Jumlah penduduk berdasarkan keyakinan yang tercatat di sistem.
          </p>
        </div>

        <div className="mt-6">
          {religionSegments.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2">
              {religionSegments.map((segment, index) => (
                <ProgressRow
                  key={`${segment.label}-${index}`}
                  label={segment.label}
                  value={segment.value}
                  total={religionTotal}
                  colorIndex={segment.colorIndex}
                />
              ))}
            </div>
          ) : (
            <EmptyState message="Belum ada data keyakinan dari sistem." />
          )}
        </div>
      </article>
    </section>
  );
}
