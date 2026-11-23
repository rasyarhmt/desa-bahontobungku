import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Loader2,
  ReceiptText,
  Scale,
  TriangleAlert,
  Wallet,
} from "lucide-react";

import ProgressRow from "@/components/Infografis/ProgressRow";
import StatCard from "@/components/Infografis/StatCard";
import { formatNumber } from "@/components/Infografis/infografisView";
import { apbdesApi } from "@/lib/api/apbdes";
import type {
  APBDesDetail,
  APBDesMonthly,
  APBDesSummary,
  DanaKeluar,
  DanaMasuk,
} from "@/lib/api/schemas";
import { getErrorMessage } from "@/lib/errors";
import { formatCurrency, getMonthName } from "@/lib/format";
import { CONTAINER_CLASS, SECTION_CLASS } from "@/lib/utils";

interface GroupItem {
  label: string;
  value: number;
}

const groupByJumlah = <T extends { tahun: number; jumlah?: number }>(
  items: T[],
  keyOf: (item: T) => string | undefined,
): GroupItem[] => {
  const grouped = new Map<string, number>();
  items.forEach((item) => {
    const label = keyOf(item)?.trim() || "Tanpa keterangan";
    grouped.set(label, (grouped.get(label) ?? 0) + Number(item.jumlah ?? 0));
  });
  return Array.from(grouped, ([label, value]) => ({ label, value })).sort(
    (a, b) => b.value - a.value,
  );
};

const sumByTipe = (summary: APBDesSummary, types: string[]): number =>
  summary.reduce(
    (sum, item) =>
      types.includes(item.tipe.trim().toLowerCase())
        ? sum + Number(item.total ?? 0)
        : sum,
    0,
  );

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl bg-surface-container px-5 py-8 text-center text-sm text-on-surface-variant">
      {message}
    </div>
  );
}

function MonthlyTable({
  title,
  rows,
  totalLabel,
}: {
  title: string;
  rows: APBDesMonthly[];
  totalLabel: string;
}) {
  const total = rows.reduce((sum, item) => sum + Number(item.total ?? 0), 0);

  return (
    <div className="overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm">
      <h3 className="border-b border-surface-container px-6 py-5 font-display text-lg font-semibold text-on-surface">
        {title}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-container/60 text-left text-xs uppercase tracking-wider text-on-surface-variant">
            <tr>
              <th className="px-6 py-3 font-semibold">No</th>
              <th className="px-6 py-3 font-semibold">Bulan</th>
              <th className="px-6 py-3 text-right font-semibold">Jumlah</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container">
            {rows.length > 0 ? (
              rows.map((item, index) => (
                <tr key={`${String(item.bulan)}-${index}`} className="hover:bg-surface-container/40">
                  <td className="px-6 py-3 text-on-surface-variant">{index + 1}</td>
                  <td className="px-6 py-3 font-medium text-on-surface">
                    {getMonthName(item.bulan)}
                  </td>
                  <td className="px-6 py-3 text-right font-semibold text-on-surface">
                    {formatCurrency(Number(item.total))}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-on-surface-variant">
                  Belum ada data bulan dari sistem.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot className="bg-surface-container/60 font-semibold text-on-surface">
            <tr>
              <td colSpan={2} className="px-6 py-4 text-right">
                {totalLabel}
              </td>
              <td className="px-6 py-4 text-right">{formatCurrency(total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default function APBDes() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [summaryData, setSummaryData] = useState<APBDesSummary>([]);
  const [detailData, setDetailData] = useState<APBDesDetail>({
    pendapatan: [],
    pengeluaran: [],
  });
  const [danaMasuk, setDanaMasuk] = useState<DanaMasuk[]>([]);
  const [danaKeluar, setDanaKeluar] = useState<DanaKeluar[]>([]);

  const fetchAvailableYears = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const years = await apbdesApi.getAvailableYears();
      setAvailableYears(years);
      if (years.length > 0) {
        setSelectedYear(years[0]);
      } else {
        setSelectedYear(null);
        setIsLoading(false);
      }
    } catch (err) {
      setError(
        getErrorMessage(err, "Gagal memuat tahun anggaran. Silakan coba lagi nanti."),
      );
      setIsLoading(false);
    }
  }, []);

  const fetchData = useCallback(async (year: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const [summary, detail, masuk, keluar] = await Promise.all([
        apbdesApi.getAPBDesSummary(year),
        apbdesApi.getAPBDesDetail(year),
        apbdesApi.getAllDanaMasuk(),
        apbdesApi.getAllDanaKeluar(),
      ]);
      setSummaryData(summary);
      setDetailData(detail);
      setDanaMasuk(masuk);
      setDanaKeluar(keluar);
    } catch (err) {
      setError(
        getErrorMessage(err, "Gagal memuat data APBDes. Silakan coba lagi nanti."),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAvailableYears();
  }, [fetchAvailableYears]);

  useEffect(() => {
    if (selectedYear !== null) void fetchData(selectedYear);
  }, [selectedYear, fetchData]);

  const totalIncome = useMemo(
    () => sumByTipe(summaryData, ["pemasukan", "pendapatan"]),
    [summaryData],
  );
  const totalExpense = useMemo(
    () => sumByTipe(summaryData, ["pengeluaran", "belanja"]),
    [summaryData],
  );
  const balance = totalIncome - totalExpense;

  const incomeGroups = useMemo(
    () =>
      groupByJumlah(
        danaMasuk.filter((item) => item.tahun === selectedYear),
        (item) => item.sumber ?? item.keterangan,
      ),
    [danaMasuk, selectedYear],
  );
  const expenseGroups = useMemo(
    () =>
      groupByJumlah(
        danaKeluar.filter((item) => item.tahun === selectedYear),
        (item) => item.kategori ?? item.keterangan,
      ),
    [danaKeluar, selectedYear],
  );
  const incomeGroupTotal = incomeGroups.reduce((sum, item) => sum + item.value, 0);
  const expenseGroupTotal = expenseGroups.reduce((sum, item) => sum + item.value, 0);

  const retry = () => {
    if (selectedYear !== null) void fetchData(selectedYear);
    else void fetchAvailableYears();
  };

  return (
    <section
      id="apbdes"
      className={`w-full scroll-mt-28 bg-surface-container-low ${SECTION_CLASS}`}
    >
      <div className={`space-y-10 md:space-y-12 ${CONTAINER_CLASS}`}>
        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
              02 / Keuangan Desa
            </span>
            <h2 className="font-display text-2xl font-bold text-on-surface md:text-3xl">
              Transparansi APBDes
            </h2>
            <p className="max-w-2xl text-sm text-on-surface-variant md:text-base">
              Ringkasan pendapatan, belanja, dan rincian dana desa yang tersedia
              di sistem untuk tahun anggaran terpilih.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {selectedYear !== null && (
              <span className="inline-flex items-center gap-2 rounded-full bg-primary-fixed px-3.5 py-2 text-xs font-semibold text-on-primary-fixed">
                <CalendarDays className="size-4" />
                Tahun Anggaran {selectedYear}
              </span>
            )}
            <select
              value={selectedYear ?? ""}
              onChange={(event) => setSelectedYear(Number(event.target.value))}
              disabled={availableYears.length === 0}
              className="rounded-full bg-surface-container-lowest px-4 py-2.5 text-xs font-semibold text-on-surface shadow-sm outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
            >
              {availableYears.length > 0 ? (
                availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))
              ) : (
                <option value="">Belum ada tahun tersedia</option>
              )}
            </select>
          </div>
        </header>

        {isLoading ? (
          <div className="grid place-items-center rounded-2xl bg-surface-container-lowest py-16 shadow-sm">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
            <TriangleAlert className="mx-auto size-8 text-destructive" />
            <p className="mt-3 text-sm text-destructive">{error}</p>
            <button
              type="button"
              onClick={retry}
              className="mt-4 rounded-full bg-primary px-5 py-2 text-xs font-semibold text-on-primary hover:bg-primary-container"
            >
              Coba Lagi
            </button>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-3">
              <StatCard
                label="Total Pendapatan Desa"
                value={formatCurrency(totalIncome)}
                icon={Wallet}
                note={selectedYear ? String(selectedYear) : undefined}
              />
              <StatCard
                label="Total Belanja Desa"
                value={formatCurrency(totalExpense)}
                icon={ReceiptText}
                colorIndex={1}
              />
              <StatCard
                label="Selisih Pendapatan & Belanja"
                value={formatCurrency(balance)}
                icon={Scale}
                colorIndex={2}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <article className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm lg:p-8">
                <h3 className="font-display text-lg font-semibold text-on-surface">
                  Rincian Pendapatan per Sumber
                </h3>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Akumulasi dana masuk berdasarkan sumber yang tercatat.
                </p>
                <div className="mt-6 space-y-4">
                  {incomeGroups.length > 0 ? (
                    incomeGroups.map((item, index) => (
                      <ProgressRow
                        key={`${item.label}-${index}`}
                        label={item.label}
                        value={item.value}
                        total={incomeGroupTotal}
                        colorIndex={index}
                        valueLabel={formatCurrency(item.value)}
                      />
                    ))
                  ) : (
                    <EmptyState message="Belum ada rincian pendapatan untuk tahun ini." />
                  )}
                </div>
              </article>

              <article className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm lg:p-8">
                <h3 className="font-display text-lg font-semibold text-on-surface">
                  Rincian Belanja per Kategori
                </h3>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Akumulasi dana keluar berdasarkan kategori yang tercatat.
                </p>
                <div className="mt-6 space-y-4">
                  {expenseGroups.length > 0 ? (
                    expenseGroups.map((item, index) => (
                      <ProgressRow
                        key={`${item.label}-${index}`}
                        label={item.label}
                        value={item.value}
                        total={expenseGroupTotal}
                        colorIndex={index}
                        valueLabel={formatCurrency(item.value)}
                      />
                    ))
                  ) : (
                    <EmptyState message="Belum ada rincian belanja untuk tahun ini." />
                  )}
                </div>
              </article>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <MonthlyTable
                title="Pendapatan Bulanan"
                rows={detailData.pendapatan}
                totalLabel={`Total (${formatNumber(detailData.pendapatan.length)} bulan)`}
              />
              <MonthlyTable
                title="Belanja Bulanan"
                rows={detailData.pengeluaran}
                totalLabel={`Total (${formatNumber(detailData.pengeluaran.length)} bulan)`}
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
