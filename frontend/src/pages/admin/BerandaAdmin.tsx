"use client";

import {
  ArrowRight,
  CalendarDays,
  Check,
  FileText,
  House,
  Images,
  Link2,
  LoaderCircle,
  Mail,
  MailOpen,
  Megaphone,
  Newspaper,
  PieChart,
  TrendingUp,
  TriangleAlert,
  UserCheck,
  UsersRound,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { adminDashboardApi } from "@/lib/api/admin";
import { formatDateShort } from "@/lib/format";
import { useAsyncData } from "@/hooks";
import { BarChart, DonutChart, LineChart } from "@/components/admin/charts";
import type {
  BarChartItem,
  LineChartItem,
} from "@/components/admin/charts";

interface DashboardData {
  penduduk: {
    total: number;
    lakiLaki: number;
    perempuan: number;
  };
  keluarga: {
    total: number;
    anggota: number;
    rataRata: number;
  };
  pengajuanSurat: {
    total: number;
    dicetak: number;
    diresmikan: number;
    perBulan: LineChartItem[];
  };
  berita: {
    total: number;
    published: number;
    draft: number;
    recent: Array<{
      id: number;
      judul: string;
      tanggal: string;
      status: string;
    }>;
  };
  pelayanan: {
    total: number;
    aktif: number;
    nonaktif: number;
  };
  pengumuman: {
    total: number;
    active: number;
    expired: number;
    recent: Array<{
      id: number;
      judul: string;
      tanggal: string;
      status: string;
    }>;
  };
  surat: {
    total: number;
    masuk: number;
    keluar: number;
    recent: Array<{
      id: number;
      jenis: string;
      nomor: string;
      perihal: string;
      tanggal: string;
    }>;
  };
  alerts: Array<{
    id: number;
    type: string;
    message: string;
    link: string;
  }>;
}

interface KpiCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  iconClassName: string;
  link: string;
  linkLabel: string;
  linkClassName: string;
  children: ReactNode;
}

const KpiCard = ({
  title,
  value,
  icon,
  iconClassName,
  link,
  linkLabel,
  linkClassName,
  children,
}: KpiCardProps) => (
  <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="mb-4 flex items-center justify-between gap-4">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <div className={`rounded-xl p-2 ${iconClassName}`}>{icon}</div>
    </div>
    <div className="mb-2 text-3xl font-bold text-slate-900">{value}</div>
    <div className="flex flex-wrap justify-between gap-2 text-sm text-slate-600">
      {children}
    </div>
    <Link
      to={link}
      className={`mt-auto inline-flex min-h-11 items-center pt-4 text-sm font-semibold hover:underline ${linkClassName}`}
    >
      {linkLabel} <ArrowRight aria-hidden="true" className="ml-1 size-4" />
    </Link>
  </div>
);

const BerandaAdmin = () => {
  const {
    data: dashboardData,
    isLoading,
    error,
    refetch: fetchDashboardData,
  } = useAsyncData<DashboardData | null>(
    async () => {
      const data = await adminDashboardApi.getDashboardSummary();
      return data as DashboardData;
    },
    null,
    {
      errorMessage: "Gagal memuat data dashboard. Silakan coba lagi nanti.",
    },
  );

  const arsipSurat: BarChartItem[] = [
    { category: "Masuk", count: dashboardData?.surat.masuk ?? 0 },
    { category: "Keluar", count: dashboardData?.surat.keluar ?? 0 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Diterima":
      case "Dipublikasi":
      case "Aktif":
        return "bg-emerald-50 text-emerald-700";
      case "Terkirim":
        return "bg-sky-50 text-[#0b6393]";
      case "Diproses":
        return "bg-amber-50 text-amber-700";
      case "Draft":
        return "bg-amber-50 text-amber-700";
      case "Kadaluarsa":
        return "bg-slate-100 text-slate-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fb] p-6">
        <div className="text-center">
          <LoaderCircle
            aria-hidden="true"
            className="mx-auto mb-4 size-8 animate-spin text-[#0b6393]"
          />
          <p className="text-base text-slate-600">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fb] p-6">
        <div className="text-center">
          <TriangleAlert
            aria-hidden="true"
            className="mx-auto mb-4 size-8 text-red-700"
          />
          <p className="mb-4 text-base text-red-700">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="min-h-11 rounded-xl bg-[#0b6393] px-5 font-semibold text-white transition-colors hover:bg-[#0a557c]"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb] p-6">
      <div className="mx-auto w-full">
        {dashboardData?.alerts && dashboardData.alerts.length > 0 && (
          <div className="mb-6">
            {dashboardData.alerts.map((alert) => (
              <div
                key={alert.id}
                className={`mb-2 flex items-start gap-3 rounded-xl border-l-4 p-4 ${
                  alert.type === "warning"
                    ? "border-amber-600 bg-amber-50 text-amber-800"
                    : alert.type === "info"
                      ? "border-[#0b6393] bg-sky-50 text-slate-800"
                      : "border-slate-400 bg-slate-50 text-slate-800"
                }`}
              >
                {alert.type === "warning" ? (
                  <TriangleAlert
                    aria-hidden="true"
                    className="mt-0.5 size-5 shrink-0 text-amber-700"
                  />
                ) : (
                  <Check
                    aria-hidden="true"
                    className="mt-0.5 size-5 shrink-0 text-[#0b6393]"
                  />
                )}
                <div className="flex-1 text-base">{alert.message}</div>
                <Link
                  to={alert.link}
                  className="inline-flex min-h-11 shrink-0 items-center text-sm font-semibold text-[#0b6393] hover:underline"
                >
                  Lihat
                </Link>
              </div>
            ))}
          </div>
        )}

        <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">
          <KpiCard
            title="Total Penduduk"
            value={dashboardData?.penduduk.total ?? 0}
            icon={
              <UsersRound
                aria-hidden="true"
                className="size-5 text-[#0b6393]"
              />
            }
            iconClassName="bg-[#0b6393]/10"
            link="/admin/infografis"
            linkLabel="Kelola Data"
            linkClassName="text-[#0b6393]"
          >
            <span>Laki-laki: {dashboardData?.penduduk.lakiLaki ?? 0}</span>
            <span>Perempuan: {dashboardData?.penduduk.perempuan ?? 0}</span>
          </KpiCard>

          <KpiCard
            title="Kepala Keluarga"
            value={dashboardData?.keluarga.total ?? 0}
            icon={
              <House aria-hidden="true" className="size-5 text-[#0b6393]" />
            }
            iconClassName="bg-[#0b6393]/10"
            link="/admin/infografis"
            linkLabel="Kelola Data"
            linkClassName="text-[#0b6393]"
          >
            <span>Anggota: {dashboardData?.keluarga.anggota ?? 0}</span>
            <span>Rata-rata: {dashboardData?.keluarga.rataRata ?? 0}/KK</span>
          </KpiCard>

          <KpiCard
            title="Pengajuan Surat"
            value={dashboardData?.pengajuanSurat.total ?? 0}
            icon={
              <FileText
                aria-hidden="true"
                className="size-5 text-[#0b6393]"
              />
            }
            iconClassName="bg-[#0b6393]/10"
            link="/admin/log-cetak"
            linkLabel="Kelola Pengajuan"
            linkClassName="text-[#0b6393]"
          >
            <span>Dicetak: {dashboardData?.pengajuanSurat.dicetak ?? 0}</span>
            <span>
              Diresmikan: {dashboardData?.pengajuanSurat.diresmikan ?? 0}
            </span>
          </KpiCard>

          <KpiCard
            title="Berita"
            value={dashboardData?.berita.total ?? 0}
            icon={
              <Newspaper
                aria-hidden="true"
                className="size-5 text-[#0b6393]"
              />
            }
            iconClassName="bg-[#0b6393]/10"
            link="/admin/berita"
            linkLabel="Kelola Berita"
            linkClassName="text-[#0b6393]"
          >
            <span>Dipublikasi: {dashboardData?.berita.published ?? 0}</span>
            <span>Draft: {dashboardData?.berita.draft ?? 0}</span>
          </KpiCard>

          <KpiCard
            title="Pengumuman"
            value={dashboardData?.pengumuman.total ?? 0}
            icon={
              <Megaphone
                aria-hidden="true"
                className="size-5 text-[#0b6393]"
              />
            }
            iconClassName="bg-[#0b6393]/10"
            link="/admin/pengumuman"
            linkLabel="Kelola Pengumuman"
            linkClassName="text-[#0b6393]"
          >
            <span>Aktif: {dashboardData?.pengumuman.active ?? 0}</span>
            <span>Kadaluarsa: {dashboardData?.pengumuman.expired ?? 0}</span>
          </KpiCard>

          <KpiCard
            title="Pelayanan"
            value={dashboardData?.pelayanan.total ?? 0}
            icon={
              <UserCheck
                aria-hidden="true"
                className="size-5 text-[#0b6393]"
              />
            }
            iconClassName="bg-[#0b6393]/10"
            link="/admin/pelayanan"
            linkLabel="Kelola Layanan"
            linkClassName="text-[#0b6393]"
          >
            <span>Aktif: {dashboardData?.pelayanan.aktif ?? 0}</span>
            <span>Nonaktif: {dashboardData?.pelayanan.nonaktif ?? 0}</span>
          </KpiCard>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Status Pengajuan Surat
              </h3>
              <div className="rounded-xl bg-[#0b6393]/10 p-2">
                <PieChart
                  aria-hidden="true"
                  className="size-5 text-[#0b6393]"
                />
              </div>
            </div>
            <DonutChart
              data={[
                {
                  label: "Dicetak",
                  count: dashboardData?.pengajuanSurat.dicetak ?? 0,
                },
                {
                  label: "Diresmikan",
                  count: dashboardData?.pengajuanSurat.diresmikan ?? 0,
                },
              ]}
              colors={["#f59e0b", "#10b981"]}
            />
            <div className="mt-4 flex flex-wrap justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-amber-500"></div>
                <span className="text-sm font-medium text-slate-700">
                  Dicetak
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-emerald-600"></div>
                <span className="text-sm font-medium text-slate-700">
                  Diresmikan
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Arsip Surat
              </h3>
              <div className="rounded-xl bg-[#0b6393]/10 p-2">
                <PieChart
                  aria-hidden="true"
                  className="size-5 text-[#0b6393]"
                />
              </div>
            </div>
            <BarChart
              data={arsipSurat}
              colors={["#3b82f6", "#10b981"]}
              labelKey="category"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Pengajuan 6 Bulan Terakhir
              </h3>
              <div className="rounded-xl bg-[#0b6393]/10 p-2">
                <TrendingUp
                  aria-hidden="true"
                  className="size-5 text-[#0b6393]"
                />
              </div>
            </div>
            <LineChart
              data={dashboardData?.pengajuanSurat.perBulan ?? []}
              color="#10b981"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Arsip Surat Terbaru
              </h3>
              <Link
                to="/admin/surat"
                className="inline-flex min-h-11 items-center text-sm font-semibold text-[#0b6393] hover:underline"
              >
                Lihat Semua
              </Link>
            </div>
            <div className="space-y-3">
              {dashboardData?.surat?.recent &&
              dashboardData.surat.recent.length > 0 ? (
                dashboardData.surat.recent.map((surat) => (
                  <div
                    key={surat.id}
                    className="rounded-xl border border-slate-200 p-4 transition-colors hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-base font-semibold text-slate-900">
                          {surat.perihal}
                        </h4>
                        <p className="text-sm text-slate-600">{surat.nomor}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        {surat.jenis === "Surat Masuk" ? (
                          <MailOpen
                            aria-hidden="true"
                            className="size-4 text-[#0b6393]"
                          />
                        ) : (
                          <Mail
                            aria-hidden="true"
                            className="size-4 text-emerald-700"
                          />
                        )}
                        <span>{surat.jenis}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarDays aria-hidden="true" className="size-4" />
                        <span>{formatDateShort(surat.tanggal)}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-base text-slate-600">
                  Belum ada data surat
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Berita Terbaru
              </h3>
              <Link
                to="/admin/berita"
                className="inline-flex min-h-11 items-center text-sm font-semibold text-[#0b6393] hover:underline"
              >
                Lihat Semua
              </Link>
            </div>
            <div className="space-y-3">
              {dashboardData?.berita?.recent &&
              dashboardData.berita.recent.length > 0 ? (
                dashboardData.berita.recent.map((berita) => (
                  <div
                    key={berita.id}
                    className="rounded-xl border border-slate-200 p-4 transition-colors hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-base font-semibold text-slate-900">
                          {berita.judul}
                        </h4>
                        <div className="mt-2">
                          <span className="inline-block rounded-lg bg-slate-100 px-2.5 py-1 text-sm font-medium text-slate-700">
                            {"Umum"}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`shrink-0 rounded-lg px-2.5 py-1 text-sm font-semibold ${getStatusColor(
                          berita.status,
                        )}`}
                      >
                        {berita.status}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Newspaper
                          aria-hidden="true"
                          className="size-4 text-[#0b6393]"
                        />
                        <span>Berita</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarDays aria-hidden="true" className="size-4" />
                        <span>{formatDateShort(berita.tanggal)}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-base text-slate-600">
                  Belum ada data berita
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Pengumuman Terbaru
              </h3>
              <Link
                to="/admin/pengumuman"
                className="inline-flex min-h-11 items-center text-sm font-semibold text-[#0b6393] hover:underline"
              >
                Lihat Semua
              </Link>
            </div>
            <div className="space-y-3">
              {dashboardData?.pengumuman?.recent &&
              dashboardData.pengumuman.recent.length > 0 ? (
                dashboardData.pengumuman.recent.map((pengumuman) => (
                  <div
                    key={pengumuman.id}
                    className="rounded-xl border border-slate-200 p-4 transition-colors hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-base font-semibold text-slate-900">
                          {pengumuman.judul}
                        </h4>
                        <div className="mt-2">
                          <span className="inline-block rounded-lg bg-slate-100 px-2.5 py-1 text-sm font-medium text-slate-700">
                            {"Informasi"}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`shrink-0 rounded-lg px-2.5 py-1 text-sm font-semibold ${getStatusColor(
                          pengumuman.status,
                        )}`}
                      >
                        {pengumuman.status}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Megaphone
                          aria-hidden="true"
                          className="size-4 text-emerald-700"
                        />
                        <span>Pengumuman</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarDays aria-hidden="true" className="size-4" />
                        <span>{formatDateShort(pengumuman.tanggal)}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-base text-slate-600">
                  Belum ada data pengumuman
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            Aksi Cepat
          </h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <Link
              to="/admin/surat"
              className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-center transition-colors hover:border-[#0b6393] hover:bg-[#0b6393]/5"
            >
              <FileText
                aria-hidden="true"
                className="size-6 text-[#0b6393]"
              />
              <span className="text-sm font-semibold text-slate-900">
                Kelola Arsip Surat
              </span>
            </Link>
            <Link
              to="/admin/berita"
              className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-center transition-colors hover:border-[#0b6393] hover:bg-[#0b6393]/5"
            >
              <Newspaper
                aria-hidden="true"
                className="size-6 text-[#0b6393]"
              />
              <span className="text-sm font-semibold text-slate-900">
                Kelola Berita
              </span>
            </Link>
            <Link
              to="/admin/pengumuman"
              className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-center transition-colors hover:border-[#0b6393] hover:bg-[#0b6393]/5"
            >
              <Megaphone
                aria-hidden="true"
                className="size-6 text-[#0b6393]"
              />
              <span className="text-sm font-semibold text-slate-900">
                Kelola Pengumuman
              </span>
            </Link>
            <Link
              to="/admin/pelayanan"
              className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-center transition-colors hover:border-[#0b6393] hover:bg-[#0b6393]/5"
            >
              <Link2 aria-hidden="true" className="size-6 text-[#0b6393]" />
              <span className="text-sm font-semibold text-slate-900">
                Kelola Layanan
              </span>
            </Link>
            <Link
              to="/admin/media"
              className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-center transition-colors hover:border-[#0b6393] hover:bg-[#0b6393]/5"
            >
              <Images aria-hidden="true" className="size-6 text-[#0b6393]" />
              <span className="text-sm font-semibold text-slate-900">
                Kelola Media
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BerandaAdmin;
