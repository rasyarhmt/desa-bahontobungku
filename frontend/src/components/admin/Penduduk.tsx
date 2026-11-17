import { useState } from "react";
import type { JSX, ChangeEvent, FormEvent } from "react";
import {
  FaUsers,
  FaUserTie,
  FaPray,
  FaEdit,
  FaTrash,
  FaUserPlus,
  FaListAlt,
  FaHome,
  FaSpinner,
  FaExclamationTriangle,
  FaMars,
  FaVenus,
  FaEye,
} from "react-icons/fa";

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

  const handleViewDetail = (nik: string) => {
    setSelectedNik(nik);
    setActiveSection("detail");
  };

  const getTotal = (data: StatItem[]) => data.reduce((sum, item) => sum + item.total, 0);

  const renderProgressBar = (value: number, total: number) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
        <div
          className="bg-blue-600 h-2.5 rounded-full"
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
        icon: <FaUsers className="text-blue-500" size={24} />,
        color: "from-blue-500 to-blue-600",
      },
      {
        title: "Kepala Keluarga",
        value: totalPenduduk[2].total,
        icon: <FaUserTie className="text-green-500" size={24} />,
        color: "from-green-500 to-green-600",
      },
      {
        title: "Laki-laki",
        value: totalPenduduk[0].total,
        icon: <FaMars className="text-indigo-500" size={24} />,
        color: "from-indigo-500 to-indigo-600",
      },
      {
        title: "Perempuan",
        value: totalPenduduk[1].total,
        icon: <FaVenus className="text-pink-500" size={24} />,
        color: "from-pink-500 to-pink-600",
      },
    ];
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100"
          >
            <div className={`h-2 bg-gradient-to-r ${card.color}`}></div>
            <div className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500 text-sm">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {card.value}
                  </p>
                </div>
                <div className="bg-gray-100 p-3 rounded-xl">{card.icon}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTable = (title: string, data: StatItem[], icon: JSX.Element) => {
    const total = getTotal(data);
    return (
      <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">{icon}</div>
            <h2 className="font-semibold text-xl text-gray-800">{title}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-gray-600">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-medium">#</th>
                  <th className="px-4 py-3 text-left font-medium">Kategori</th>
                  <th className="px-4 py-3 text-center font-medium">Total</th>
                  <th className="px-4 py-3 text-center font-medium">
                    Persentase
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium">{row.kategori}</td>
                    <td className="px-4 py-3 text-center">{row.total}</td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="text-gray-700">
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
      <div
        className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100"
        style={{ fontFamily: "poppins" }}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <FaListAlt className="text-blue-500" size={20} />
            </div>
            <h2 className="font-semibold text-xl text-gray-800">
              Daftar Penduduk
            </h2>
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Cari berdasarkan nama, NIK, atau alamat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-300 focus:outline-none"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-gray-600">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-medium">#</th>
                  <th className="px-4 py-3 text-left font-medium">Nama</th>
                  <th className="px-4 py-3 text-left font-medium">NIK</th>
                  <th className="px-4 py-3 text-left font-medium">Alamat</th>
                  <th className="px-4 py-3 text-left font-medium">Tempat Lahir</th>
                  <th className="px-4 py-3 text-left font-medium">No. KK</th>
                  <th className="px-4 py-3 text-center font-medium">Umur</th>
                  <th className="px-4 py-3 text-center font-medium">
                    Jenis Kelamin
                  </th>
                  <th className="px-4 py-3 text-center font-medium">Agama</th>
                  <th className="px-4 py-3 text-center font-medium">Status</th>
                  <th className="px-4 py-3 text-center font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, idx) => (
                  <tr
                    key={item.id || idx}
                    className="border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleViewDetail(item.nik)}
                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer break-words"
                      >
                        {item.nama}
                      </button>
                    </td>
                    <td className="px-4 py-3 break-words">{item.nik}</td>
                    <td className="px-4 py-3 break-words">{item.alamat}</td>
                    <td className="px-4 py-3 break-words">
                      {item.tempatLahir || "-"}
                    </td>
                    <td className="px-4 py-3 break-words">
                      {item.nomor_kk || "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {hitungUmur(item.tanggalLahir)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.jenisKelamin}
                    </td>
                    <td className="px-4 py-3 text-center">{item.agama}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === "Kepala Keluarga"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewDetail(item.nik)}
                          className="bg-green-500 hover:bg-green-600 text-white p-1.5 rounded-lg transition-colors"
                          title="Lihat Detail Keluarga"
                        >
                          <FaEye size={14} />
                        </button>
                        <button
                          onClick={() => handleEdit(item.nik)}
                          className="bg-blue-500 hover:bg-blue-600 text-white p-1.5 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.nik)}
                          className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-6 text-center text-gray-500"
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
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
        <span className="ml-2">Memuat data...</span>
      </div>
    );
  }

  if (error && activeSection === "dashboard") {
    return (
      <div className="text-center py-12">
        <FaExclamationTriangle className="text-4xl text-yellow-500 mx-auto mb-4" />
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <>
      <div
        className="space-y-8 bg-gray-50 min-h-screen"
        style={{ fontFamily: "poppins" }}
      >
        <div className="w-full mx-auto">
          {activeSection === "dashboard" && (
            <>
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">
                  Data Kependudukan
                </h1>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveSection("manage")}
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <FaListAlt size={16} />
                    <span>Kelola Data</span>
                  </button>
                </div>
              </div>
              {renderSummaryCards()}
              <div className="mt-8 space-y-6">
                {renderTable(
                  "Total Penduduk",
                  totalPenduduk,
                  <FaUsers className="text-blue-500" size={20} />
                )}
                {renderTable(
                  "Jumlah Penduduk Berdasarkan Usia",
                  pendudukUsia,
                  <FaUsers className="text-green-500" size={20} />
                )}
                {renderTable(
                  "Jumlah Penduduk Berdasarkan Jenis Kelamin",
                  [
                    { kategori: "Laki-laki", total: totalPenduduk[0].total },
                    { kategori: "Perempuan", total: totalPenduduk[1].total },
                  ],
                  <FaUsers className="text-purple-500" size={20} />
                )}
                {renderTable(
                  "Jumlah Penduduk Berdasarkan Keyakinan",
                  pendudukKeyakinan,
                  <FaPray className="text-orange-500" size={20} />
                )}
              </div>
            </>
          )}

          {activeSection === "manage" && (
            <>
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">
                  Kelola Data Penduduk
                </h1>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveSection("dashboard")}
                    className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <FaHome size={16} />
                    <span>Dashboard</span>
                  </button>
                  <button
                    onClick={() => openForm()}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <FaUserPlus size={16} />
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
              <div className="flex items-center gap-4 mb-8">
                <button
                  onClick={() => setActiveSection("manage")}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <FaHome size={16} />
                  Kembali ke Manajemen
                </button>
                <h1 className="text-3xl font-bold text-gray-800">
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
        <div className="fixed inset-0 backdrop-blur-sm bg-gray-700/30 flex items-center justify-center z-50 transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md border border-gray-200 animate-modalFadeIn">
            <div className="mb-6">
              <p className="text-gray-600 text-md font-medium text-center">
                Apakah Anda yakin ingin menghapus penduduk{" "}
                <span className="font-bold">
                  {(() => {
                    const penduduk = pendudukData.find(
                      (p) => p.nik === itemToDelete
                    );
                    return penduduk
                      ? `${penduduk.nama} - ${penduduk.nik} `
                      : itemToDelete;
                  })()}
                </span>
                ? <br />
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => closeDeleteModal()}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={isActionLoading}
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                disabled={isActionLoading}
              >
                {isActionLoading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <span>Hapus</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
