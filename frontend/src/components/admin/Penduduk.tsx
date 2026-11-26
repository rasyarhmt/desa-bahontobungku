import { useState } from "react";
import type { JSX, ChangeEvent, FormEvent } from "react";
import {
  FaEdit,
  FaEye,
  FaFileExcel,
  FaHome,
  FaListAlt,
  FaMars,
  FaPray,
  FaSpinner,
  FaTrash,
  FaUserTie,
  FaUsers,
  FaVenus,
} from "react-icons/fa";

import ConfirmDialog from "@/components/admin/ConfirmDialog";
import AdminTablePagination from "@/components/admin/AdminTablePagination";
import DetailKeluarga from "./DetailKeluarga";
import PopupForm from "./PopupForm";
import {
  AdminCard,
  AdminMetricCard,
  AdminPageHeader,
  AdminSearchInput,
  AdminSectionHeader,
  AdminStatusBadge,
  AdminTableShell,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "@/components/admin/admin-ui";
import {
  adminPendudukApi,
  adminStatusKeluargaApi,
  type PendudukAdminView,
  type StatusKeluarga,
} from "@/lib/api/admin";
import { getErrorMessage } from "@/lib/errors";
import {
  useAsyncData,
  useDisclosure,
  useTablePagination,
} from "@/hooks";
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
  summary: {
    totalPenduduk: number;
    totalKepalaKeluarga: number;
    totalLakiLaki: number;
    totalPerempuan: number;
  };
  byAgama: StatItem[];
  byUmur: StatItem[];
}> {
  const allPenduduk = await adminPendudukApi.getAllPenduduk();
  const totalPenduduk = allPenduduk.length;
  const totalKepalaKeluarga = allPenduduk.filter(
    (p) => p.status.toLowerCase() === "kepala keluarga",
  ).length;
  const totalLakiLaki = allPenduduk.filter(
    (p) => p.jenisKelamin.toLowerCase() === "laki-laki",
  ).length;
  const totalPerempuan = allPenduduk.filter(
    (p) => p.jenisKelamin.toLowerCase() === "perempuan",
  ).length;

  const agamaMap = new Map<string, number>();
  allPenduduk.forEach((p) => {
    const key = p.agama || "Tidak Diketahui";
    agamaMap.set(key, (agamaMap.get(key) || 0) + 1);
  });
  const byAgama: StatItem[] = Array.from(agamaMap.entries()).map(
    ([kategori, total]) => ({ kategori, total }),
  );

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

const emptyFormData: PendudukFormData = {
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
};

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
          {
            kategori: "Kepala Keluarga",
            total: stats.summary.totalKepalaKeluarga,
          },
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
  const [formData, setFormData] = useState<PendudukFormData>(emptyFormData);
  const [kepalaKeluargaList, setKepalaKeluargaList] = useState<
    PendudukAdminView[]
  >([]);
  const [statusKeluargaList, setStatusKeluargaList] = useState<StatusKeluarga[]>(
    [],
  );
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSection, setActiveSection] = useState("dashboard");
  const [selectedNik, setSelectedNik] = useState<string | null>(null);

  const filteredPenduduk = pendudukData.filter(
    (item) =>
      item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nik.includes(searchTerm) ||
      item.alamat.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const {
    page,
    setPage,
    pageSize,
    setPageSize,
    pageItems,
    totalItems,
    totalPages,
    rangeStart,
  } = useTablePagination(filteredPenduduk, {
    resetKey: searchTerm,
  });

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
      setFormData(emptyFormData);
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

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement> | {
      target: { name: string; value: string | number | null };
    },
  ) => {
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
        await adminPendudukApi.updatePenduduk(
          formData.existingNik || formData.nik,
          formData,
        );
      } else {
        await adminPendudukApi.addPenduduk(formData);
      }
      await fetchData();
      resetForm();
      toast.success(
        isEditing ? "Data berhasil diperbarui!" : "Data berhasil ditambahkan!",
      );
    } catch (error) {
      console.error("Error saving data:", error);
      const message = getErrorMessage(
        error,
        "Terjadi kesalahan saat menyimpan data",
      );
      toast.error(message);
    }
  };

  const resetForm = (closeForm = true) => {
    setFormData(emptyFormData);
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
      const message = getErrorMessage(
        error,
        "Terjadi kesalahan saat menghapus data",
      );
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

  const getTotal = (items: StatItem[]) =>
    items.reduce((sum, item) => sum + item.total, 0);

  const renderProgressBar = (value: number, total: number) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    return (
      <div className="mt-1 h-2.5 w-full rounded-full bg-surface-container">
        <div
          className="h-2.5 rounded-full bg-primary"
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  const renderSummaryCards = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <AdminMetricCard
        label="Total Penduduk"
        value={totalPenduduk[3].total}
        icon={<FaUsers />}
        tone="primary"
      />
      <AdminMetricCard
        label="Kepala Keluarga"
        value={totalPenduduk[2].total}
        icon={<FaUserTie />}
        tone="success"
      />
      <AdminMetricCard
        label="Laki-laki"
        value={totalPenduduk[0].total}
        icon={<FaMars />}
        tone="info"
      />
      <AdminMetricCard
        label="Perempuan"
        value={totalPenduduk[1].total}
        icon={<FaVenus />}
        tone="warning"
      />
    </div>
  );

  const renderTable = (title: string, items: StatItem[], icon: JSX.Element) => {
    const total = getTotal(items);
    return (
      <AdminCard className="overflow-hidden">
        <div className="p-5 sm:p-6">
          <AdminSectionHeader icon={icon} title={title} />
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-on-surface-variant">
              <thead>
                <tr className="border-b border-border bg-surface-container-low">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Kategori
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Total
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Persentase
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((row, idx) => (
                  <tr key={idx} className="transition-colors hover:bg-surface-container-low">
                    <td className="px-4 py-3 text-on-surface">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-on-surface">
                      {row.kategori}
                    </td>
                    <td className="px-4 py-3 text-center">{row.total}</td>
                    <td className="px-4 py-3">
                      <span className="text-on-surface-variant">
                        {total > 0 ? ((row.total / total) * 100).toFixed(1) : 0}%
                      </span>
                      {renderProgressBar(row.total, total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AdminCard>
    );
  };

  const renderDataList = () => {
    const headerClass =
      "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground";

    return (
      <AdminTableShell
        footer={
          <AdminTablePagination
            page={page}
            pageSize={pageSize}
            totalItems={totalItems}
            totalPages={totalPages}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            label="penduduk"
          />
        }
      >
        <div className="p-5 sm:p-6">
          <AdminSectionHeader
            icon={<FaListAlt />}
            title="Daftar Penduduk"
            description="Cari, lihat detail, ubah, atau hapus data penduduk."
          />

          <AdminSearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Cari berdasarkan nama, NIK, atau alamat..."
            className="mb-4"
          />

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-on-surface-variant">
              <thead>
                <tr className="border-b border-border bg-surface-container-low">
                  <th className={`${headerClass} text-left`}>#</th>
                  <th className={`${headerClass} text-left`}>Nama</th>
                  <th className={`${headerClass} text-left`}>Alamat</th>
                  <th className={`${headerClass} text-left`}>Tempat Lahir</th>
                  <th className={`${headerClass} text-center`}>Umur</th>
                  <th className={`${headerClass} text-center`}>Jenis Kelamin</th>
                  <th className={`${headerClass} text-center`}>Agama</th>
                  <th className={`${headerClass} text-center`}>Pekerjaan</th>
                  <th className={`${headerClass} text-center`}>Status</th>
                  <th className={`${headerClass} text-center`}>Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pageItems.map((item, idx) => (
                  <tr
                    key={item.id || idx}
                    className="transition-colors hover:bg-surface-container-low"
                  >
                    <td className="px-4 py-3 text-on-surface">
                      {rangeStart + idx}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleViewDetail(item.nik)}
                          className="break-words text-left font-medium text-primary transition-colors hover:underline"
                        >
                          {item.nama}
                        </button>
                        <span className="break-all text-xs text-muted-foreground">
                          NIK: {item.nik}
                        </span>
                        <span className="break-all text-xs text-muted-foreground">
                          No. KK: {item.nomor_kk || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="break-words px-4 py-3">{item.alamat}</td>
                    <td className="break-words px-4 py-3">
                      {item.tempatLahir || "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {hitungUmur(item.tanggalLahir)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.jenisKelamin}
                    </td>
                    <td className="px-4 py-3 text-center">{item.agama}</td>
                    <td className="px-4 py-3 text-center">
                      {item.pekerjaan || "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <AdminStatusBadge
                        label={item.status}
                        tone={
                          item.status === "Kepala Keluarga"
                            ? "success"
                            : "info"
                        }
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleViewDetail(item.nik)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface-container-lowest text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                          title="Lihat Detail Keluarga"
                        >
                          <FaEye />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(item.nik)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface-container-lowest text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.nik)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface-container-lowest text-on-surface-variant transition-colors hover:bg-destructive/10 hover:text-destructive"
                          title="Hapus"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {pageItems.length === 0 && (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-4 py-8 text-center text-sm text-muted-foreground"
                    >
                      Tidak ada data yang sesuai dengan pencarian
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </AdminTableShell>
    );
  };

  if (isLoading && activeSection === "dashboard") {
    return (
      <div className="p-6">
        <AdminTableShell loading>
          <div />
        </AdminTableShell>
      </div>
    );
  }

  if (error && activeSection === "dashboard") {
    return (
      <div className="p-6">
        <AdminTableShell error={error} onRetry={() => void fetchData()}>
          <div />
        </AdminTableShell>
      </div>
    );
  }

  const deleteLabel = (() => {
    const penduduk = pendudukData.find((p) => p.nik === itemToDelete);
    return penduduk
      ? `${penduduk.nama} - ${penduduk.nik}`
      : (itemToDelete ?? "penduduk ini");
  })();

  return (
    <div className="space-y-6">
      {activeSection === "dashboard" && (
        <>
          <AdminPageHeader
            eyebrow="Statistik Kependudukan"
            title="Data Kependudukan"
            description="Ringkasan jumlah penduduk berdasarkan kategori tertentu."
            actions={
              <>
                <button
                  type="button"
                  onClick={() => void handleExportXLSX()}
                  disabled={isExporting}
                  className={adminSecondaryButtonClass}
                >
                  {isExporting ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaFileExcel />
                  )}
                  {isExporting ? "Mengekspor..." : "Ekspor Excel"}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection("manage")}
                  className={adminPrimaryButtonClass}
                >
                  <FaListAlt /> Kelola Data
                </button>
              </>
            }
          />
          {renderSummaryCards()}
          <div className="space-y-6">
            {renderTable(
              "Total Penduduk",
              totalPenduduk,
              <FaUsers />,
            )}
            {renderTable(
              "Jumlah Penduduk Berdasarkan Usia",
              pendudukUsia,
              <FaUsers />,
            )}
            {renderTable(
              "Jumlah Penduduk Berdasarkan Jenis Kelamin",
              [
                { kategori: "Laki-laki", total: totalPenduduk[0].total },
                { kategori: "Perempuan", total: totalPenduduk[1].total },
              ],
              <FaVenus />,
            )}
            {renderTable(
              "Jumlah Penduduk Berdasarkan Keyakinan",
              pendudukKeyakinan,
              <FaPray />,
            )}
          </div>
        </>
      )}

      {activeSection === "manage" && (
        <>
          <AdminPageHeader
            eyebrow="Kependudukan"
            title="Kelola Data Penduduk"
            description="Tambah, perbarui, dan ekspor data penduduk desa."
            actions={
              <>
                <button
                  type="button"
                  onClick={() => setActiveSection("dashboard")}
                  className={adminSecondaryButtonClass}
                >
                  <FaHome /> Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => void handleExportXLSX()}
                  disabled={isExporting}
                  className={adminSecondaryButtonClass}
                >
                  {isExporting ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaFileExcel />
                  )}
                  {isExporting ? "Mengekspor..." : "Ekspor Excel"}
                </button>
              </>
            }
            onAdd={() => openForm()}
            addLabel="Tambah Penduduk"
          />
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
        </>
      )}

      {activeSection === "detail" && (
        <DetailKeluarga
          selectedNik={selectedNik}
          pendudukData={pendudukData}
          onBack={() => setActiveSection("manage")}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <ConfirmDialog
        isOpen={showDeleteModal}
        title="Hapus Penduduk"
        description={`Apakah Anda yakin ingin menghapus penduduk ${deleteLabel}? Aksi ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        isLoading={isActionLoading}
        onConfirm={() => void confirmDelete()}
        onCancel={() => {
          closeDeleteModal();
          setItemToDelete(null);
        }}
      />
    </div>
  );
}
