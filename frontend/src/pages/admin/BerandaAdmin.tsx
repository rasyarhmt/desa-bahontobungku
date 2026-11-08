"use client";

import {
  FaFileAlt,
  FaEnvelopeOpen,
  FaEnvelope,
  FaNewspaper,
  FaBullhorn,
  FaChartPie,
  FaChartLine,
  FaCalendarAlt,
  FaArrowRight,
  FaCheck,
  FaExclamationTriangle,
  FaSpinner,
  FaLink,
  FaPhotoVideo,
  FaUsers,
  FaHome,
  FaUserCheck,
} from "react-icons/fa";
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
  <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <div className={`p-2 rounded-lg ${iconClassName}`}>{icon}</div>
    </div>
    <div className="text-3xl font-bold text-gray-900 mb-2">{value}</div>
    <div className="flex justify-between text-sm text-gray-600">{children}</div>
    <Link
      to={link}
      className={`mt-auto pt-4 text-sm font-medium flex items-center hover:underline ${linkClassName}`}
    >
      {linkLabel} <FaArrowRight className="ml-1 text-xs" />
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
        return "bg-green-100 text-green-800";
      case "Terkirim":
        return "bg-blue-100 text-blue-800";
      case "Diproses":
        return "bg-yellow-100 text-yellow-800";
      case "Draft":
        return "bg-yellow-100 text-yellow-800";
      case "Kadaluarsa":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-purple-500 mx-auto mb-4" />
          <p className="text-gray-600">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="w-full mx-auto">
        {dashboardData?.alerts && dashboardData.alerts.length > 0 && (
          <div className="mb-6">
            {dashboardData.alerts.map((alert) => (
              <div
                key={alert.id}
                className={`mb-2 p-4 rounded-xl flex items-start gap-3 ${
                  alert.type === "warning"
                    ? "bg-amber-50 text-amber-800 border-l-4 border-amber-500"
                    : alert.type === "info"
                      ? "bg-blue-50 text-blue-800 border-l-4 border-blue-500"
                      : "bg-gray-50 text-gray-800 border-l-4 border-gray-500"
                }`}
              >
                {alert.type === "warning" ? (
                  <FaExclamationTriangle className="text-amber-500 mt-0.5" />
                ) : (
                  <FaCheck className="text-blue-500 mt-0.5" />
                )}
                <div className="flex-1">{alert.message}</div>
                <Link
                  to={alert.link}
                  className="text-sm font-medium hover:underline"
                >
                  Lihat
                </Link>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <KpiCard
            title="Total Penduduk"
            value={dashboardData?.penduduk.total ?? 0}
            icon={<FaUsers className="text-purple-500 text-xl" />}
            iconClassName="bg-purple-100"
            link="/admin/infografis"
            linkLabel="Kelola Data"
            linkClassName="text-purple-600"
          >
            <span>Laki-laki: {dashboardData?.penduduk.lakiLaki ?? 0}</span>
            <span>Perempuan: {dashboardData?.penduduk.perempuan ?? 0}</span>
          </KpiCard>

          <KpiCard
            title="Kepala Keluarga"
            value={dashboardData?.keluarga.total ?? 0}
            icon={<FaHome className="text-amber-500 text-xl" />}
            iconClassName="bg-amber-100"
            link="/admin/infografis"
            linkLabel="Kelola Data"
            linkClassName="text-amber-600"
          >
            <span>Anggota: {dashboardData?.keluarga.anggota ?? 0}</span>
            <span>Rata-rata: {dashboardData?.keluarga.rataRata ?? 0}/KK</span>
          </KpiCard>

          <KpiCard
            title="Pengajuan Surat"
            value={dashboardData?.pengajuanSurat.total ?? 0}
            icon={<FaFileAlt className="text-indigo-500 text-xl" />}
            iconClassName="bg-indigo-100"
            link="/admin/log-cetak"
            linkLabel="Kelola Pengajuan"
            linkClassName="text-indigo-600"
          >
            <span>Dicetak: {dashboardData?.pengajuanSurat.dicetak ?? 0}</span>
            <span>
              Diresmikan: {dashboardData?.pengajuanSurat.diresmikan ?? 0}
            </span>
          </KpiCard>

          <KpiCard
            title="Berita"
            value={dashboardData?.berita.total ?? 0}
            icon={<FaNewspaper className="text-blue-500 text-xl" />}
            iconClassName="bg-blue-100"
            link="/admin/berita"
            linkLabel="Kelola Berita"
            linkClassName="text-blue-600"
          >
            <span>Dipublikasi: {dashboardData?.berita.published ?? 0}</span>
            <span>Draft: {dashboardData?.berita.draft ?? 0}</span>
          </KpiCard>

          <KpiCard
            title="Pengumuman"
            value={dashboardData?.pengumuman.total ?? 0}
            icon={<FaBullhorn className="text-green-500 text-xl" />}
            iconClassName="bg-green-100"
            link="/admin/pengumuman"
            linkLabel="Kelola Pengumuman"
            linkClassName="text-green-600"
          >
            <span>Aktif: {dashboardData?.pengumuman.active ?? 0}</span>
            <span>Kadaluarsa: {dashboardData?.pengumuman.expired ?? 0}</span>
          </KpiCard>

          <KpiCard
            title="Pelayanan"
            value={dashboardData?.pelayanan.total ?? 0}
            icon={<FaUserCheck className="text-rose-500 text-xl" />}
            iconClassName="bg-rose-100"
            link="/admin/pelayanan"
            linkLabel="Kelola Layanan"
            linkClassName="text-rose-600"
          >
            <span>Aktif: {dashboardData?.pelayanan.aktif ?? 0}</span>
            <span>Nonaktif: {dashboardData?.pelayanan.nonaktif ?? 0}</span>
          </KpiCard>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Status Pengajuan Surat
              </h3>
              <div className="bg-purple-100 p-2 rounded-lg">
                <FaChartPie className="text-purple-500 text-xl" />
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
            <div className="mt-4 flex justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span className="text-sm">Dicetak</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm">Diresmikan</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Arsip Surat
              </h3>
              <div className="bg-blue-100 p-2 rounded-lg">
                <FaChartPie className="text-blue-500 text-xl" />
              </div>
            </div>
            <BarChart
              data={arsipSurat}
              colors={["#3b82f6", "#10b981"]}
              labelKey="category"
            />
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Pengajuan 6 Bulan Terakhir
              </h3>
              <div className="bg-green-100 p-2 rounded-lg">
                <FaChartLine className="text-green-500 text-xl" />
              </div>
            </div>
            <LineChart
              data={dashboardData?.pengajuanSurat.perBulan ?? []}
              color="#10b981"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Arsip Surat Terbaru
              </h3>
              <Link
                to="/admin/surat"
                className="text-sm text-purple-600 hover:underline"
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
                    className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-800">
                          {surat.perihal}
                        </h4>
                        <p className="text-sm text-gray-600">{surat.nomor}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        {surat.jenis === "Surat Masuk" ? (
                          <FaEnvelopeOpen className="text-blue-500" />
                        ) : (
                          <FaEnvelope className="text-green-500" />
                        )}
                        <span>{surat.jenis}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaCalendarAlt />
                        <span>
                          {formatDateShort(surat.tanggal)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Belum ada data surat
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Berita Terbaru
              </h3>
              <Link
                to="/admin/berita"
                className="text-sm text-blue-600 hover:underline"
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
                    className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-800">
                          {berita.judul}
                        </h4>
                        <div className="mt-1">
                          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                            {"Umum"}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          berita.status,
                        )}`}
                      >
                        {berita.status}
                      </span>
                    </div>
                    <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <FaNewspaper className="text-blue-500" />
                        <span>Berita</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaCalendarAlt />
                        <span>{formatDateShort(berita.tanggal)}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Belum ada data berita
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Pengumuman Terbaru
              </h3>
              <Link
                to="/admin/pengumuman"
                className="text-sm text-green-600 hover:underline"
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
                    className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-800">
                          {pengumuman.judul}
                        </h4>
                        <div className="mt-1">
                          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                            {"Informasi"}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          pengumuman.status,
                        )}`}
                      >
                        {pengumuman.status}
                      </span>
                    </div>
                    <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <FaBullhorn className="text-green-500" />
                        <span>Pengumuman</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaCalendarAlt />
                        <span>{formatDateShort(pengumuman.tanggal)}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Belum ada data pengumuman
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Aksi Cepat
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Link
              to="/admin/surat"
              className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
            >
              <FaFileAlt className="text-purple-500 text-2xl mb-2" />
              <span className="text-sm font-medium text-gray-800">
                Kelola Arsip Surat
              </span>
            </Link>
            <Link
              to="/admin/berita"
              className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
            >
              <FaNewspaper className="text-blue-500 text-2xl mb-2" />
              <span className="text-sm font-medium text-gray-800">
                Kelola Berita
              </span>
            </Link>
            <Link
              to="/admin/pengumuman"
              className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
            >
              <FaBullhorn className="text-green-500 text-2xl mb-2" />
              <span className="text-sm font-medium text-gray-800">
                Kelola Pengumuman
              </span>
            </Link>
            <Link
              to="/admin/pelayanan"
              className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
            >
              <FaLink className="text-blue-500 text-2xl mb-2" />
              <span className="text-sm font-medium text-gray-800">
                Kelola Layanan
              </span>
            </Link>
            <Link
              to="/admin/media"
              className="flex flex-col items-center justify-center p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors"
            >
              <FaPhotoVideo className="text-amber-500 text-2xl mb-2" />
              <span className="text-sm font-medium text-gray-800">
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
