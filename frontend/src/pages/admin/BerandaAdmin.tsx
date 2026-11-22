"use client";

import type { ReactNode } from "react";
import {
  FaArrowRight,
  FaBullhorn,
  FaCalendarAlt,
  FaChartLine,
  FaChartPie,
  FaCheck,
  FaEnvelope,
  FaEnvelopeOpen,
  FaExclamationTriangle,
  FaFileAlt,
  FaHome,
  FaLink,
  FaNewspaper,
  FaPhotoVideo,
  FaSpinner,
  FaUserCheck,
  FaUsers,
} from "react-icons/fa";
import { Link } from "react-router-dom";

import { BarChart, DonutChart, LineChart } from "@/components/admin/charts";
import type { BarChartItem } from "@/components/admin/charts";
import { AdminPageHeader, adminCardClass } from "@/components/admin/admin-ui";
import PortalWargaLink from "@/components/admin/PortalWargaLink";
import { useAsyncData } from "@/hooks";
import { adminDashboardApi } from "@/lib/api/admin";
import { formatDateShort } from "@/lib/format";

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
    perBulan: { month: string; count: number }[];
    recent: {
      id: number;
      nama: string;
      kode: string;
      tanggal: string;
      status: string;
    }[];
  };
  berita: {
    total: number;
    published: number;
    draft: number;
    recent: {
      id: number;
      judul: string;
      tanggal: string;
      status: string;
    }[];
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
    recent: {
      id: number;
      judul: string;
      tanggal: string;
      status: string;
    }[];
  };
  surat: {
    total: number;
    masuk: number;
    keluar: number;
    recent: {
      id: number;
      jenis: string;
      nomor: string;
      perihal: string;
      tanggal: string;
    }[];
  };
  alerts: {
    id: number;
    type: "warning" | "info";
    message: string;
    link: string;
  }[];
}

const cardClass = `${adminCardClass} p-6`;

const KpiCard = ({
  title,
  value,
  icon,
  iconClassName,
  link,
  linkLabel,
  children,
}: {
  title: string;
  value: number | string;
  icon: ReactNode;
  iconClassName: string;
  link: string;
  linkLabel: string;
  children: ReactNode;
}) => (
  <article className={`${cardClass} flex h-full flex-col`}>
    <div className="mb-5 flex items-start justify-between gap-3">
      <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${iconClassName}`}
      >
        {icon}
      </span>
    </div>
    <p className="text-3xl font-semibold tracking-tight text-on-surface">
      {value}
    </p>
    <div className="mt-3 space-y-1 text-xs text-on-surface-variant">
      {children}
    </div>
    <Link
      to={link}
      className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
    >
      {linkLabel}
      <FaArrowRight className="text-xs" />
    </Link>
  </article>
);

const SectionCard = ({
  title,
  icon,
  action,
  children,
}: {
  title: string;
  icon: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) => (
  <section className={cardClass}>
    <div className="mb-5 flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-surface-container text-primary">
          {icon}
        </span>
        <h2 className="text-base font-semibold text-on-surface">{title}</h2>
      </div>
      {action}
    </div>
    {children}
  </section>
);

const RecentItem = ({
  title,
  subtitle,
  meta,
  status,
  icon,
}: {
  title: string;
  subtitle?: string;
  meta: string;
  status?: string;
  icon: ReactNode;
}) => (
  <div className="rounded-2xl border border-border bg-surface p-4 transition-colors hover:bg-surface-container-low">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-on-surface">{title}</p>
        {subtitle && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
      {status && (
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${getStatusClass(status)}`}
        >
          {status}
        </span>
      )}
    </div>
    <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
      <span className="flex items-center gap-1.5">
        {icon}
        <span>{meta}</span>
      </span>
    </div>
  </div>
);

const getStatusClass = (status: string) => {
  const value = status.toLowerCase();
  if (["dipublikasi", "aktif", "diresmikan"].includes(value)) {
    return "bg-primary-fixed text-on-primary-fixed";
  }
  if (["draft", "dicetak", "terkirim", "diproses"].includes(value)) {
    return "bg-warning-bg text-warning-fg";
  }
  return "bg-surface-container text-on-surface-variant";
};

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
    { errorMessage: "Gagal memuat data dashboard. Silakan coba lagi nanti." },
  );

  const arsipSurat: BarChartItem[] = [
    { category: "Masuk", count: dashboardData?.surat.masuk ?? 0 },
    { category: "Keluar", count: dashboardData?.surat.keluar ?? 0 },
  ];

  if (isLoading) {
    return (
      <div className={`${cardClass} flex min-h-[60vh] items-center justify-center`}>
        <div className="text-center">
          <FaSpinner className="mx-auto mb-4 animate-spin text-3xl text-primary" />
          <p className="text-sm text-muted-foreground">
            Memuat data dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${cardClass} flex min-h-[60vh] items-center justify-center`}>
        <div className="text-center">
          <FaExclamationTriangle className="mx-auto mb-4 text-3xl text-destructive" />
          <p className="mb-4 text-sm text-destructive">{error}</p>
          <button
            type="button"
            onClick={() => void fetchDashboardData()}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary transition-colors hover:bg-primary/90"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const recentSurat = dashboardData?.surat.recent ?? [];
  const recentBerita = dashboardData?.berita.recent ?? [];
  const recentPengumuman = dashboardData?.pengumuman.recent ?? [];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Ringkasan Backoffice"
        title="Dashboard Admin"
        description="Pantau aktivitas dan data desa dari satu tempat."
        actions={
          <PortalWargaLink className="inline-flex w-fit items-center gap-2 rounded-xl border border-border bg-surface-container-lowest px-4 py-2.5 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface" />
        }
      />

      {(dashboardData?.alerts?.length ?? 0) > 0 && (
        <div className="space-y-2">
          {dashboardData?.alerts.map((alert) => {
            const isWarning = alert.type === "warning";
            return (
              <div
                key={alert.id}
                className={`flex items-start gap-3 rounded-2xl border-l-4 px-4 py-3 text-sm ${
                  isWarning
                    ? "border-warning-fg bg-warning-bg text-warning-fg"
                    : "border-primary bg-primary-fixed text-on-primary-fixed"
                }`}
              >
                <span className="mt-0.5">
                  {isWarning ? <FaExclamationTriangle /> : <FaCheck />}
                </span>
                <p className="flex-1">{alert.message}</p>
                <Link
                  to={alert.link}
                  className="shrink-0 font-semibold underline underline-offset-2"
                >
                  Lihat
                </Link>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard
          title="Total Penduduk"
          value={dashboardData?.penduduk.total ?? 0}
          icon={<FaUsers />}
          iconClassName="bg-primary-fixed text-on-primary-fixed"
          link="/admin/infografis"
          linkLabel="Kelola Data"
        >
          <p>Laki-laki: {dashboardData?.penduduk.lakiLaki ?? 0}</p>
          <p>Perempuan: {dashboardData?.penduduk.perempuan ?? 0}</p>
        </KpiCard>

        <KpiCard
          title="Kepala Keluarga"
          value={dashboardData?.keluarga.total ?? 0}
          icon={<FaHome />}
          iconClassName="bg-[var(--warning-bg)] text-[var(--warning-fg)]"
          link="/admin/infografis"
          linkLabel="Kelola Data"
        >
          <p>Anggota: {dashboardData?.keluarga.anggota ?? 0}</p>
          <p>Rata-rata: {dashboardData?.keluarga.rataRata ?? 0}/KK</p>
        </KpiCard>

        <KpiCard
          title="Pengajuan Surat"
          value={dashboardData?.pengajuanSurat.total ?? 0}
          icon={<FaFileAlt />}
          iconClassName="bg-secondary-container text-on-secondary-container"
          link="/admin/log-cetak"
          linkLabel="Kelola Pengajuan"
        >
          <p>Dicetak: {dashboardData?.pengajuanSurat.dicetak ?? 0}</p>
          <p>Diresmikan: {dashboardData?.pengajuanSurat.diresmikan ?? 0}</p>
        </KpiCard>

        <KpiCard
          title="Berita"
          value={dashboardData?.berita.total ?? 0}
          icon={<FaNewspaper />}
          iconClassName="bg-surface-container-high text-primary"
          link="/admin/berita"
          linkLabel="Kelola Berita"
        >
          <p>Dipublikasi: {dashboardData?.berita.published ?? 0}</p>
          <p>Draft: {dashboardData?.berita.draft ?? 0}</p>
        </KpiCard>

        <KpiCard
          title="Pengumuman"
          value={dashboardData?.pengumuman.total ?? 0}
          icon={<FaBullhorn />}
          iconClassName="bg-primary-fixed text-on-primary-fixed"
          link="/admin/pengumuman"
          linkLabel="Kelola Pengumuman"
        >
          <p>Aktif: {dashboardData?.pengumuman.active ?? 0}</p>
          <p>Kadaluarsa: {dashboardData?.pengumuman.expired ?? 0}</p>
        </KpiCard>

        <KpiCard
          title="Pelayanan"
          value={dashboardData?.pelayanan.total ?? 0}
          icon={<FaUserCheck />}
          iconClassName="bg-secondary-container text-on-secondary-container"
          link="/admin/pelayanan"
          linkLabel="Kelola Layanan"
        >
          <p>Aktif: {dashboardData?.pelayanan.aktif ?? 0}</p>
          <p>Nonaktif: {dashboardData?.pelayanan.nonaktif ?? 0}</p>
        </KpiCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard
          title="Status Pengajuan Surat"
          icon={<FaChartPie />}
        >
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
          <div className="mt-5 flex flex-wrap justify-center gap-5 text-xs text-on-surface-variant">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              Dicetak
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Diresmikan
            </span>
          </div>
        </SectionCard>

        <SectionCard title="Arsip Surat" icon={<FaChartPie />}>
          <BarChart
            data={arsipSurat}
            colors={["#006948", "#68dba9"]}
            labelKey="category"
          />
        </SectionCard>

        <SectionCard
          title="Pengajuan 6 Bulan Terakhir"
          icon={<FaChartLine />}
        >
          <LineChart
            data={dashboardData?.pengajuanSurat.perBulan ?? []}
            color="#006948"
          />
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard
          title="Arsip Surat Terbaru"
          icon={<FaEnvelope />}
          action={
            <Link
              to="/admin/surat"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Lihat Semua
            </Link>
          }
        >
          <div className="space-y-3">
            {recentSurat.length > 0 ? (
              recentSurat.map((surat) => (
                <RecentItem
                  key={surat.id}
                  title={surat.perihal}
                  subtitle={surat.nomor}
                  meta={formatDateShort(surat.tanggal)}
                  icon={
                    surat.jenis === "Surat Masuk" ? (
                      <FaEnvelopeOpen className="text-primary" />
                    ) : (
                      <FaEnvelope className="text-primary" />
                    )
                  }
                />
              ))
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Belum ada data surat.
              </p>
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Berita Terbaru"
          icon={<FaNewspaper />}
          action={
            <Link
              to="/admin/berita"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Lihat Semua
            </Link>
          }
        >
          <div className="space-y-3">
            {recentBerita.length > 0 ? (
              recentBerita.map((berita) => (
                <RecentItem
                  key={berita.id}
                  title={berita.judul}
                  meta={formatDateShort(berita.tanggal)}
                  status={berita.status}
                  icon={<FaNewspaper className="text-primary" />}
                />
              ))
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Belum ada data berita.
              </p>
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Pengumuman Terbaru"
          icon={<FaBullhorn />}
          action={
            <Link
              to="/admin/pengumuman"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Lihat Semua
            </Link>
          }
        >
          <div className="space-y-3">
            {recentPengumuman.length > 0 ? (
              recentPengumuman.map((pengumuman) => (
                <RecentItem
                  key={pengumuman.id}
                  title={pengumuman.judul}
                  meta={formatDateShort(pengumuman.tanggal)}
                  status={pengumuman.status}
                  icon={<FaBullhorn className="text-primary" />}
                />
              ))
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Belum ada data pengumuman.
              </p>
            )}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Aksi Cepat"
        icon={<FaArrowRight />}
      >
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {[
            {
              to: "/admin/surat",
              icon: <FaFileAlt />,
              label: "Kelola Arsip Surat",
            },
            {
              to: "/admin/berita",
              icon: <FaNewspaper />,
              label: "Kelola Berita",
            },
            {
              to: "/admin/pengumuman",
              icon: <FaBullhorn />,
              label: "Kelola Pengumuman",
            },
            {
              to: "/admin/pelayanan",
              icon: <FaLink />,
              label: "Kelola Layanan",
            },
            {
              to: "/admin/media",
              icon: <FaPhotoVideo />,
              label: "Kelola Media",
            },
          ].map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-surface-container px-3 py-5 text-center text-sm font-medium text-on-surface-variant transition-colors hover:bg-secondary-container hover:text-on-secondary-container"
            >
              <span className="text-xl text-primary">{action.icon}</span>
              <span>{action.label}</span>
            </Link>
          ))}
        </div>
      </SectionCard>

      <p className="flex items-center justify-center gap-1.5 pb-2 text-xs text-muted-foreground">
        <FaCalendarAlt />
        Data dashboard diperbarui dari layanan backend.
      </p>
    </div>
  );
};

export default BerandaAdmin;
