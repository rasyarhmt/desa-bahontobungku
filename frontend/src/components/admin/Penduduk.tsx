import { useState } from "react";
import type { JSX, ChangeEvent, FormEvent } from "react";
import {
  UsersRound,
  UserRoundCog,
  Hand,
  Pencil,
  Trash2,
  UserPlus,
  ListChecks,
  House,
  LoaderCircle,
  TriangleAlert,
  Mars,
  Venus,
  Eye,
  FileSpreadsheet,
  Search,
} from "lucide-react";

import PopupForm from "./PopupForm";
import DetailKeluarga from "./DetailKeluarga";
import {
  adminPendudukApi,
  adminStatusKeluargaApi,
  type PendudukAdminView,
  type StatusKeluarga,
} from "@/lib/api/admin";
import { getErrorMessage } from "@/lib/errors";
import { useAsyncData, useDisclosure } from "@/hooks";
import { toast } from "@/lib/toast";

interface StatItem {
  kategori: string;
  total: number;
}

interface PendudukFormData {
  id: number;
  nama: string;
  nik: string;
  alamat: string;
  tanggalLahir: string;
  tempatLahir: string;
  nomor_kk: string;
  jenisKelamin: string;
  agama: string;
  pekerjaan: string;
  id_kepalakeluarga: number | null;
  id_status_keluarga: number | null;
  status: string;
  existingNik?: string;
}

async function getAllStats(): Promise<{
  summary: { totalPenduduk: number; totalKepalaKeluarga: number; totalLakiLaki: number; totalPerempuan: number };
  byAgama: StatItem[];
  byUmur: StatItem[];
}> {
  const allPenduduk = await adminPendudukApi.getAllPenduduk();
  const totalPenduduk = allPenduduk.length;
  const totalKepalaKeluarga = allPenduduk.filter((p) => p.status.toLowerCase() === "kepala keluarga").length;
  const totalLakiLaki = allPenduduk.filter((p) => p.jenisKelamin.toLowerCase() === "laki-laki").length;
  const totalPerempuan = allPenduduk.filter((p) => p.jenisKelamin.toLowerCase() === "perempuan").length;

  const agamaMap = new Map<string, number>();
  allPenduduk.forEach((p) => {
    const key = p.agama || "Tidak Diketahui";
    agamaMap.set(key, (agamaMap.get(key) || 0) + 1);
  });
  const byAgama: StatItem[] = Array.from(agamaMap.entries()).map(([kategori, total]) => ({ kategori, total }));

  const umurBuckets: StatItem[] = [
    { kategori: "0-14", total: 0 },
    { kategori: "15-24", total: 0 },
    { kategori: "25-54", total: 0 },
    { kategori: "55-64", total: 0 },
    { kategori: "65+", total: 0 },
  ];
  const today = new Date();
  allPenduduk.forEach((p) => {
    if (!p.tanggalLahir) return;
    const birthDate = new Date(p.tanggalLahir);
    if (isNaN(birthDate.getTime())) return;
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    if (age < 15) umurBuckets[0].total++;
    else if (age < 25) umurBuckets[1].total++;
    else if (age < 55) umurBuckets[2].total++;
    else if (age < 65) umurBuckets[3].total++;
    else umurBuckets[4].total++;
  });

  return {
    summary: { totalPenduduk, totalKepalaKeluarga, totalLakiLaki, totalPerempuan },
    byAgama,
    byUmur: umurBuckets,
  };
}

interface PendudukAsyncData {
  penduduk: PendudukAdminView[];
  total: StatItem[];
  usia: StatItem[];
  keyakinan: StatItem[];
}

export default function Penduduk() {
  const {
    data,
    isLoading,
    error,
    refetch: fetchData,
  } = useAsyncData<PendudukAsyncData>(
    async () => {
      const pendudukList = await adminPendudukApi.getAllPenduduk();
      const stats = await getAllStats();
      return {
        penduduk: pendudukList,
        total: [
          { kategori: "Laki-laki", total: stats.summary.totalLakiLaki },
          { kategori: "Perempuan", total: stats.summary.totalPerempuan },
          { kategori: "Kepala Keluarga", total: stats.summary.totalKepalaKeluarga },
          { kategori: "Total Penduduk", total: stats.summary.totalPenduduk },
        ],
        usia: stats.byUmur,
        keyakinan: stats.byAgama,
      };
    },
    {
      penduduk: [],
      total: [
        { kategori: "Laki-laki", total: 0 },
        { kategori: "Perempuan", total: 0 },
        { kategori: "Kepala Keluarga", total: 0 },
        { kategori: "Total Penduduk", total: 0 },
      ],
      usia: [],
      keyakinan: [],
    },
    { errorMessage: "Gagal memuat data. Silakan coba lagi nanti." },
  );

  const pendudukData = data.penduduk;
  const totalPenduduk = data.total;
  const pendudukUsia = data.usia;
  const pendudukKeyakinan = data.keyakinan;

  const { isOpen: showForm, open: openFormModal, close: closeFormModal } =
    useDisclosure();
  const {
    isOpen: showDeleteModal,
    open: openDeleteModal,
    close: closeDeleteModal,
  } = useDisclosure();
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [formData, setFormData] = useState<PendudukFormData>({
    id: 0,
    nama: "",
    nik: "",
    alamat: "",
    tanggalLahir: "",
    tempatLahir: "",
    nomor_kk: "",
    jenisKelamin: "Laki-laki",
    agama: "Islam",
    pekerjaan: "",
    id_kepalakeluarga: null,
    id_status_keluarga: null,
    status: "",
  });
  const [kepalaKeluargaList, setKepalaKeluargaList] = useState<PendudukAdminView[]>([]);
  const [statusKeluargaList, setStatusKeluargaList] = useState<StatusKeluarga[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSection, setActiveSection] = useState("dashboard");
  const [selectedNik, setSelectedNik] = useState<string | null>(null);

  const openForm = (editData: PendudukAdminView | null = null) => {
    fetchKepalaKeluarga();
    fetchStatusKeluarga();
    if (editData) {
      setFormData({
        ...editData,
        id_kepalakeluarga: editData.id_kepalakeluarga || null,
        id_status_keluarga: editData.id_status_keluarga ?? null,
        tanggalLahir: editData.tanggalLahir
          ? editData.tanggalLahir.split("T")[0]
          : "",
        tempatLahir: editData.tempatLahir || "",
        nomor_kk: editData.nomor_kk || "",
        agama: editData.agama || "",
        pekerjaan: editData.pekerjaan || "",
        existingNik: editData.nik,
      });
      setIsEditing(true);
    } else {
      setFormData({
        id: 0,
        nama: "",
        nik: "",
        alamat: "",
        tanggalLahir: "",
        tempatLahir: "",
        nomor_kk: "",
        jenisKelamin: "Laki-laki",
        agama: "Islam",
        pekerjaan: "",
        id_kepalakeluarga: null,
        id_status_keluarga: null,
        status: "",
      });
      setIsEditing(false);
    }
    openFormModal();
  };

  const fetchKepalaKeluarga = async () => {
    try {
      const list = await adminPendudukApi.getAllKepalaKeluarga();
      setKepalaKeluargaList(list);
    } catch (_e) {
      setKepalaKeluargaList([]);
    }
  };

  const fetchStatusKeluarga = async () => {
    try {
      const list = await adminStatusKeluargaApi.getAll();
      setStatusKeluargaList(list);
    } catch (_e) {
      setStatusKeluargaList([]);
    }
  };

  const handleAddStatusKeluarga = async (
    nama: string,
  ): Promise<StatusKeluarga | null> => {
    try {
      const created = await adminStatusKeluargaApi.add(nama);
      await fetchStatusKeluarga();
      toast.success("Status keluarga berhasil ditambahkan");
      return created;
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Terjadi kesalahan saat menambah status"),
      );
      return null;
    }
  };

  const hitungUmur = (tanggalLahir?: string | null) => {
    if (!tanggalLahir) return 0;
    const today = new Date();
    const birthDate = new Date(tanggalLahir);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: string | number | null } }) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (formData.id_status_keluarga == null) {
      toast.error("Pilih status keluarga terlebih dahulu!");
      return;
    }
    const isKepalaKeluarga =
      formData.status.trim().toLowerCase() === "kepala keluarga";
    if (!isKepalaKeluarga && !formData.id_kepalakeluarga) {
      toast.error("Pilih kepala keluarga terlebih dahulu!");
      return;
    }

    try {
      if (isEditing) {
        await adminPendudukApi.updatePenduduk(formData.existingNik || formData.nik, formData);
      } else {
        await adminPendudukApi.addPenduduk(formData);
      }
      await fetchData();
      resetForm();
      toast.success(
        isEditing ? "Data berhasil diperbarui!" : "Data berhasil ditambahkan!"
      );
    } catch (error) {
      console.error("Error saving data:", error);
      const message = getErrorMessage(error, "Terjadi kesalahan saat menyimpan data");
      toast.error(message);
    }
  };

  const resetForm = (closeForm = true) => {
    setFormData({
      id: 0,
      nama: "",
      nik: "",
      alamat: "",
      tanggalLahir: "",
      tempatLahir: "",
      nomor_kk: "",
      jenisKelamin: "Laki-laki",
      agama: "Islam",
      pekerjaan: "",
      id_kepalakeluarga: null,
      id_status_keluarga: null,
      status: "",
    });
    setIsEditing(false);
    if (closeForm) {
      closeFormModal();
    }
  };

  const handleEdit = (nik: string) => {
    const dataToEdit = pendudukData.find((item) => item.nik === nik);
    if (dataToEdit) {
      setActiveSection("manage");
      openForm(dataToEdit);
    }
  };

  const handleDelete = (nik: string) => {
    setItemToDelete(nik);
    openDeleteModal();
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    setIsActionLoading(true);
    try {
      await adminPendudukApi.deletePenduduk(itemToDelete);
      await fetchData();
      toast.success("Data berhasil dihapus!");
    } catch (error) {
      console.error("Error deleting data:", error);
      const message = getErrorMessage(error, "Terjadi kesalahan saat menghapus data");
      toast.error(message);
    } finally {
      setIsActionLoading(false);
      closeDeleteModal();
      setItemToDelete(null);
    }
  };

  const handleExportXLSX = async () => {
    setIsExporting(true);
    try {
      const blob = await adminPendudukApi.exportPendudukXLSX();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `data-penduduk-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 0);
      toast.success("Data penduduk berhasil diekspor ke Excel");
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal mengekspor data penduduk"));
    } finally {
      setIsExporting(false);
    }
  };

  const handleViewDetail = (nik: string) => {
    setSelectedNik(nik);
    setActiveSection("detail");
  };

  const getTotal = (data: StatItem[]) => data.reduce((sum, item) => sum + item.total, 0);

  const renderProgressBar = (value: number, total: number) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    return (
      <div className="mt-1 h-2.5 w-full rounded-full bg-slate-200">
        <div
          className="h-2.5 rounded-full bg-[#0b6393]"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    );
  };

  const renderSummaryCards = () => {
    const totalSum = totalPenduduk[3].total;
    const cards = [
      {
        title: "Total Penduduk",
        value: totalSum,
        icon: (
          <UsersRound aria-hidden="true" className="size-5 text-[#0b6393]" />
        ),
      },
      {
        title: "Kepala Keluarga",
        value: totalPenduduk[2].total,
        icon: (
          <UserRoundCog aria-hidden="true" className="size-5 text-emerald-700" />
        ),
      },
      {
        title: "Laki-laki",
        value: totalPenduduk[0].total,
        icon: <Mars aria-hidden="true" className="size-5 text-[#0b6393]" />,
      },
      {
        title: "Perempuan",
        value: totalPenduduk[1].total,
        icon: <Venus aria-hidden="true" className="size-5 text-[#0b6393]" />,
      },
    ];
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-600">
                  {card.title}
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {card.value}
                </p>
              </div>
              <div className="rounded-xl bg-slate-100 p-2">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTable = (title: string, data: StatItem[], icon: JSX.Element) => {
    const total = getTotal(data);
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-slate-100 p-2">{icon}</div>
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-base text-slate-700">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-4 text-left font-bold text-slate-900">
                    #
                  </th>
                  <th className="px-4 py-4 text-left font-bold text-slate-900">
                    Kategori
                  </th>
                  <th className="px-4 py-4 text-center font-bold text-slate-900">
                    Total
                  </th>
                  <th className="px-4 py-4 text-center font-bold text-slate-900">
                    Persentase
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-4">{idx + 1}</td>
                    <td className="px-4 py-4 font-semibold text-slate-900">
                      {row.kategori}
                    </td>
                    <td className="px-4 py-4 text-center">{row.total}</td>
                    <td className="px-4 py-4">
                      <div>
                        <span className="text-slate-800">
                          {total > 0
                            ? ((row.total / total) * 100).toFixed(1)
                            : 0}
                          %
                        </span>
                        {renderProgressBar(row.total, total)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderDataList = () => {
    const filteredData = pendudukData.filter(
      (item) =>
        item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nik.includes(searchTerm) ||
        item.alamat.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-slate-100 p-2 text-[#0b6393]">
              <ListChecks aria-hidden="true" className="size-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Daftar Penduduk
            </h2>
          </div>

          <div className="mb-4">
            <label
              htmlFor="cari-penduduk"
              className="mb-1 block text-sm font-semibold text-slate-800"
            >
              Cari penduduk
            </label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-500"
              />
              <input
                id="cari-penduduk"
                type="text"
                placeholder="Cari berdasarkan nama, NIK, atau alamat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="min-h-11 w-full rounded-xl border border-slate-300 bg-white py-2 pl-12 pr-4 text-base text-slate-900 placeholder:text-slate-500 focus:border-[#0b6393] focus:ring-2 focus:ring-[#0b6393]/20 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-base text-slate-700">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-4 text-left font-bold text-slate-900">
                    #
                  </th>
                  <th className="px-4 py-4 text-left font-bold text-slate-900">
                    Nama
                  </th>
                  <th className="px-4 py-4 text-left font-bold text-slate-900">
                    Alamat
                  </th>
                  <th className="px-4 py-4 text-left font-bold text-slate-900">
                    Tempat Lahir
                  </th>
                  <th className="px-4 py-4 text-center font-bold text-slate-900">
                    Umur
                  </th>
                  <th className="px-4 py-4 text-center font-bold text-slate-900">
                    Jenis Kelamin
                  </th>
                  <th className="px-4 py-4 text-center font-bold text-slate-900">
                    Agama
                  </th>
                  <th className="px-4 py-4 text-center font-bold text-slate-900">
                    Pekerjaan
                  </th>
                  <th className="px-4 py-4 text-center font-bold text-slate-900">
                    Status
                  </th>
                  <th className="px-4 py-4 text-center font-bold text-slate-900">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredData.map((item, idx) => (
                  <tr
                    key={item.id || idx}
                    className="hover:bg-slate-50 transition"
                  >
                    <td className="px-4 py-4">{idx + 1}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleViewDetail(item.nik)}
                          className="min-h-11 break-words text-left text-base font-semibold text-[#0b6393] hover:text-[#084c73] hover:underline"
                        >
                          {item.nama}
                        </button>
                        <span className="break-all text-sm text-slate-600">
                          NIK: {item.nik}
                        </span>
                        <span className="break-all text-sm text-slate-600">
                          No. KK: {item.nomor_kk || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="break-words px-4 py-4">{item.alamat}</td>
                    <td className="break-words px-4 py-4">
                      {item.tempatLahir || "-"}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {hitungUmur(item.tanggalLahir)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {item.jenisKelamin}
                    </td>
                    <td className="px-4 py-4 text-center">{item.agama}</td>
                    <td className="px-4 py-4 text-center">
                      {item.pekerjaan || "-"}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                          item.status === "Kepala Keluarga"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleViewDetail(item.nik)}
                          title="Lihat Detail Keluarga"
                          aria-label="Lihat Detail Keluarga"
                          className="flex min-h-11 items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-200"
                        >
                          <Eye aria-hidden="true" className="size-5" />
                          <span className="hidden xl:inline">Detail</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(item.nik)}
                          title="Edit"
                          aria-label="Edit penduduk"
                          className="flex min-h-11 items-center gap-2 rounded-xl bg-[#0b6393] px-3 py-2 text-sm font-semibold text-white hover:bg-[#084c73]"
                        >
                          <Pencil aria-hidden="true" className="size-5" />
                          <span className="hidden xl:inline">Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.nik)}
                          title="Hapus"
                          aria-label="Hapus penduduk"
                          className="flex min-h-11 items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                        >
                          <Trash2 aria-hidden="true" className="size-5" />
                          <span className="hidden xl:inline">Hapus</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-4 py-8 text-center text-base text-slate-600"
                    >
                      Tidak ada data yang sesuai dengan pencarian
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading && activeSection === "dashboard") {
    return (
      <div className="flex justify-center items-center h-64 gap-2 text-base text-slate-600">
        <LoaderCircle
          aria-hidden="true"
          className="size-5 animate-spin text-[#0b6393]"
        />
        <span>Memuat data...</span>
      </div>
    );
  }

  if (error && activeSection === "dashboard") {
    return (
      <div className="py-12 text-center">
        <TriangleAlert
          aria-hidden="true"
          className="mx-auto mb-4 size-5 text-amber-700"
        />
        <p className="mb-4 text-base text-red-700">{error}</p>
        <button
          type="button"
          onClick={fetchData}
          className="min-h-11 rounded-xl bg-[#0b6393] px-4 py-2 text-sm font-semibold text-white hover:bg-[#084c73]"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen space-y-8 bg-[#f6f8fb]">
        <div className="mx-auto w-full">
          {activeSection === "dashboard" && (
            <>
              <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-slate-900">
                  Data Kependudukan
                </h1>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleExportXLSX}
                    disabled={isExporting}
                    className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
                  >
                    {isExporting ? (
                      <LoaderCircle
                        aria-hidden="true"
                        className="size-5 animate-spin text-[#0b6393]"
                      />
                    ) : (
                      <FileSpreadsheet
                        aria-hidden="true"
                        className="size-5 text-emerald-700"
                      />
                    )}
                    <span>{isExporting ? "Mengekspor..." : "Ekspor Excel"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSection("manage")}
                    className="flex min-h-11 items-center gap-2 rounded-xl bg-[#0b6393] px-4 py-2 text-sm font-semibold text-white hover:bg-[#084c73]"
                  >
                    <ListChecks aria-hidden="true" className="size-5" />
                    <span>Kelola Data</span>
                  </button>
                </div>
              </div>
              {renderSummaryCards()}
              <div className="mt-8 space-y-6">
                {renderTable(
                  "Total Penduduk",
                  totalPenduduk,
                  <UsersRound
                    aria-hidden="true"
                    className="size-5 text-[#0b6393]"
                  />,
                )}
                {renderTable(
                  "Jumlah Penduduk Berdasarkan Usia",
                  pendudukUsia,
                  <UsersRound
                    aria-hidden="true"
                    className="size-5 text-[#0b6393]"
                  />,
                )}
                {renderTable(
                  "Jumlah Penduduk Berdasarkan Jenis Kelamin",
                  [
                    { kategori: "Laki-laki", total: totalPenduduk[0].total },
                    { kategori: "Perempuan", total: totalPenduduk[1].total },
                  ],
                  <UsersRound
                    aria-hidden="true"
                    className="size-5 text-[#0b6393]"
                  />,
                )}
                {renderTable(
                  "Jumlah Penduduk Berdasarkan Keyakinan",
                  pendudukKeyakinan,
                  <Hand aria-hidden="true" className="size-5 text-[#0b6393]" />,
                )}
              </div>
            </>
          )}

          {activeSection === "manage" && (
            <>
              <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-slate-900">
                  Kelola Data Penduduk
                </h1>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveSection("dashboard")}
                    className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                  >
                    <House aria-hidden="true" className="size-5" />
                    <span>Dashboard</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportXLSX}
                    disabled={isExporting}
                    className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
                  >
                    {isExporting ? (
                      <LoaderCircle
                        aria-hidden="true"
                        className="size-5 animate-spin text-[#0b6393]"
                      />
                    ) : (
                      <FileSpreadsheet
                        aria-hidden="true"
                        className="size-5 text-emerald-700"
                      />
                    )}
                    <span>{isExporting ? "Mengekspor..." : "Ekspor Excel"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openForm()}
                    className="flex min-h-11 items-center gap-2 rounded-xl bg-[#0b6393] px-4 py-2 text-sm font-semibold text-white hover:bg-[#084c73]"
                  >
                    <UserPlus aria-hidden="true" className="size-5" />
                    <span>Tambah Penduduk</span>
                  </button>
                </div>
              </div>
              <div className="space-y-6">
                {showForm ? (
                  <PopupForm
                    formData={formData}
                    handleInputChange={handleInputChange}
                    handleSubmit={handleSubmit}
                    resetForm={resetForm}
                    isEditing={isEditing}
                    kepalaKeluargaList={kepalaKeluargaList}
                    statusKeluargaList={statusKeluargaList}
                    onAddStatusKeluarga={handleAddStatusKeluarga}
                  />
                ) : (
                  renderDataList()
                )}
              </div>
            </>
          )}

          {activeSection === "detail" && (
            <>
              <div className="mb-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => setActiveSection("manage")}
                  className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  <House aria-hidden="true" className="size-5" />
                  <span>Kembali ke Manajemen</span>
                </button>
                <h1 className="text-2xl font-bold text-slate-900">
                  Detail Keluarga
                </h1>
              </div>
              <DetailKeluarga
                selectedNik={selectedNik}
                pendudukData={pendudukData}
                onBack={() => setActiveSection("manage")}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </>
          )}
        </div>
      </div>
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="mb-6">
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-xl bg-amber-50 p-2 text-amber-700">
                  <TriangleAlert aria-hidden="true" className="size-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  Konfirmasi Hapus
                </h2>
              </div>
              <p className="text-base text-slate-700">
                Apakah Anda yakin ingin menghapus penduduk{" "}
                <span className="font-bold text-slate-900">
                  {(() => {
                    const penduduk = pendudukData.find(
                      (p) => p.nik === itemToDelete
                    );
                    return penduduk
                      ? `${penduduk.nama} - ${penduduk.nik} `
                      : itemToDelete;
                  })()}
                </span>
                ?
              </p>
            </div>
            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => closeDeleteModal()}
                className="flex min-h-11 items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-200"
                disabled={isActionLoading}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex min-h-11 items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                disabled={isActionLoading}
              >
                {isActionLoading ? (
                  <>
                    <LoaderCircle
                      aria-hidden="true"
                      className="size-5 animate-spin"
                    />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 aria-hidden="true" className="size-5" />
                    <span>Hapus</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
