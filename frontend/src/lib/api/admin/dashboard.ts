import { adminBeritaApi } from "./berita";
import { adminLogCetakApi } from "./log-cetak-surat";
import { adminPelayananApi } from "./pelayanan";
import { adminPendudukApi } from "./penduduk";
import { adminPengumumanApi } from "./pengumuman";
import { adminSuratApi } from "./surat";

// ============================================================================
// Dashboard admin (agregasi dari klien domain)
// ============================================================================

const lastSixMonths = (dates: Array<string | null | undefined>) => {
  const now = new Date();
  return Array.from({ length: 6 }, (_, index) => {
    const month = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    const total = dates.filter((value) => {
      if (!value) return false;
      const date = new Date(value);
      return (
        date.getFullYear() === month.getFullYear() &&
        date.getMonth() === month.getMonth()
      );
    }).length;
    return {
      month: month.toLocaleString("id-ID", { month: "short" }),
      count: total,
    };
  });
};

export const adminDashboardApi = {
  getDashboardSummary: async () => {
    const [berita, pelayanan, pengumuman, surat, penduduk, keluarga, logCetak] =
      await Promise.all([
        adminBeritaApi.getAllBerita(),
        adminPelayananApi.getAllPelayanan(),
        adminPengumumanApi.getAllPengumuman(),
        adminSuratApi.getAllSurat(),
        adminPendudukApi.getAllPenduduk(),
        adminPendudukApi.getAllKepalaKeluarga(),
        adminLogCetakApi.getAllLogCetak(),
      ]);

    const now = new Date();

    const pendudukSummary = {
      total: penduduk.length,
      lakiLaki: penduduk.filter(
        (p) => p.jenisKelamin.toLowerCase() === "laki-laki",
      ).length,
      perempuan: penduduk.filter(
        (p) => p.jenisKelamin.toLowerCase() === "perempuan",
      ).length,
    };

    const keluargaSummary = {
      total: keluarga.length,
      anggota: penduduk.length,
      rataRata:
        keluarga.length > 0
          ? Math.round((penduduk.length / keluarga.length) * 10) / 10
          : 0,
    };

    const pengajuanSuratSummary = {
      total: logCetak.length,
      dicetak: logCetak.filter((l) => l.status === "dicetak").length,
      diresmikan: logCetak.filter((l) => l.status === "diresmikan").length,
      perBulan: lastSixMonths(logCetak.map((l) => l.created_at)),
      recent: logCetak.slice(0, 3).map((l) => ({
        id: l.id,
        nama: l.nama_pemohon,
        kode: l.kode_unik,
        tanggal: l.created_at,
        status: l.status,
      })),
    };

    const beritaSummary = {
      total: berita.length,
      published: berita.filter((b) => b.status === "Dipublikasi").length,
      draft: berita.filter((b) => b.status === "Draft").length,
      recent: berita.slice(0, 3).map((b) => ({
        id: b.id,
        judul: b.judul,
        tanggal: b.tanggalTerbit,
        status: b.status,
      })),
    };

    const pelayananSummary = {
      total: pelayanan.length,
      aktif: pelayanan.filter((p) => p.status === "aktif").length,
      nonaktif: pelayanan.filter((p) => p.status !== "aktif").length,
    };

    const pengumumanSummary = {
      total: pengumuman.length,
      active: pengumuman.filter((p) => new Date(p.tanggalSelesai) >= now)
        .length,
      expired: pengumuman.filter((p) => new Date(p.tanggalSelesai) < now)
        .length,
      recent: pengumuman.slice(0, 3).map((p) => ({
        id: p.id,
        judul: p.judul,
        tanggal: p.tanggalMulai,
        status: new Date(p.tanggalSelesai) < now ? "Kadaluarsa" : "Aktif",
      })),
    };

    const suratSummary = {
      total: surat.length,
      masuk: surat.filter((s) => s.jenis === "Surat Masuk").length,
      keluar: surat.filter((s) => s.jenis === "Surat Keluar").length,
      recent: surat.slice(0, 3).map((s) => ({
        id: s.id,
        jenis: s.jenis,
        nomor: s.nomor,
        perihal: s.perihal,
        tanggal: s.tanggal,
      })),
    };

    const alerts: {
      id: number;
      type: "warning" | "info";
      message: string;
      link: string;
    }[] = [];
    const expiring = pengumuman.filter((p) => {
      const days = Math.floor(
        (Number(new Date(p.tanggalSelesai)) - Number(now)) /
          (1000 * 60 * 60 * 24),
      );
      return days >= 0 && days <= 3;
    });
    if (expiring.length > 0) {
      alerts.push({
        id: 1,
        type: "warning",
        message: `${expiring.length} pengumuman akan kadaluarsa dalam 3 hari`,
        link: "/admin/pengumuman",
      });
    }
    if (pengajuanSuratSummary.dicetak > 0) {
      alerts.push({
        id: 2,
        type: "info",
        message: `${pengajuanSuratSummary.dicetak} surat menunggu pengesahan`,
        link: "/admin/log-cetak",
      });
    }

    return {
      penduduk: pendudukSummary,
      keluarga: keluargaSummary,
      pengajuanSurat: pengajuanSuratSummary,
      berita: beritaSummary,
      pelayanan: pelayananSummary,
      pengumuman: pengumumanSummary,
      surat: suratSummary,
      alerts,
    };
  },
};
