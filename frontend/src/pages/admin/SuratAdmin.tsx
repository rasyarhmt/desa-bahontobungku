import { useEffect, useState } from "react";
import {
  FaEnvelope,
  FaEnvelopeOpen,
  FaFileAlt,
  FaSyncAlt,
} from "react-icons/fa";

import AdminTablePagination from "@/components/admin/AdminTablePagination";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import SuratForm from "@/components/admin/SuratForm";
import SuratDetailView from "@/components/admin/SuratDetailView";
import SuratTable from "@/components/admin/SuratTable";
import type { SuratFormData } from "@/components/admin/suratShared";
import {
  AdminFilterTabs,
  AdminMetricCard,
  AdminPageHeader,
  AdminToolbar,
  adminSecondaryButtonClass,
} from "@/components/admin/admin-ui";
import { type SuratItem, adminSuratApi } from "@/lib/api/admin";
import { getAuthState } from "@/lib/auth";
import { toDateInputValue } from "@/lib/format";
import { useCrudResource, useDisclosure, useTablePagination } from "@/hooks";

function SuratAdmin() {
  const { token } = getAuthState();

  const [suratData, setSuratData] = useState<SuratItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("semua");

  const previewModal = useDisclosure();
  const [previewItem, setPreviewItem] = useState<SuratItem | null>(null);

  const fetchAllSurat = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminSuratApi.getAllSurat();
      setSuratData(data);
    } catch (err) {
      console.error("Error in fetchAllSurat:", err);
      setError("Gagal memuat data surat.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuratMasuk = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminSuratApi.getSuratMasuk();
      setSuratData(data);
    } catch (err) {
      setError("Gagal memuat data surat masuk.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuratKeluar = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminSuratApi.getSuratKeluar();
      setSuratData(data);
    } catch (err) {
      setError("Gagal memuat data surat keluar.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);

    if (tab === "semua") {
      fetchAllSurat();
    } else if (tab === "masuk") {
      fetchSuratMasuk();
    } else if (tab === "keluar") {
      fetchSuratKeluar();
    }
  };

  useEffect(() => {
    fetchAllSurat();
  }, []);

  const refetchCurrentTab = () => {
    if (activeTab === "masuk") return fetchSuratMasuk();
    if (activeTab === "keluar") return fetchSuratKeluar();
    return fetchAllSurat();
  };

  const filteredData = suratData.filter((item) => {
    const matchesSearch =
      (item.perihal?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (item.nomor?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (item.pengirim?.toLowerCase() || "").includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const {
    page,
    setPage,
    pageSize,
    setPageSize,
    pageItems,
    totalItems,
    totalPages,
  } = useTablePagination(filteredData, {
    resetKey: `${activeTab}|${searchQuery}`,
  });

  const countMasuk = suratData.filter(
    (item) => item.jenis === "Surat Masuk",
  ).length;
  const countKeluar = suratData.filter(
    (item) => item.jenis === "Surat Keluar",
  ).length;

  const {
    addModal,
    editModal,
    deleteModal,
    currentItem,
    formData,
    setFormData,
    isActionLoading,
    handleAdd,
    handleEdit,
    handleDelete,
    saveNewItem,
    saveEditedItem,
    confirmDelete,
  } = useCrudResource<SuratItem, SuratFormData>({
    items: suratData,
    initialForm: {
      jenis: "Surat Masuk",
      nomor: "",
      perihal: "",
      pengirim: "",
      tanggal: toDateInputValue(new Date()),
      file: null,
    },
    toForm: (item) => ({
      jenis: item.jenis,
      nomor: item.nomor,
      perihal: item.perihal,
      pengirim: item.pengirim,
      tanggal: item.tanggal ? toDateInputValue(item.tanggal) : "",
      file: null,
      fileUrl: item.file,
    }),
    validate: (form) =>
      !form.nomor ||
      !form.perihal ||
      !form.tanggal ||
      !form.pengirim ||
      !form.jenis
        ? "Nomor surat, perihal, tanggal, pengirim/penerima, dan jenis surat wajib diisi!"
        : null,
    guard: () =>
      token ? null : "Anda harus login sebagai admin untuk mengelola surat",
    create: (form) => {
      const payload = new FormData();
      payload.append("nomorSurat", form.nomor);
      payload.append("perihal", form.perihal);
      if (form.file) payload.append("file", form.file);

      if (form.jenis === "Surat Masuk") {
        payload.append("pengirim", form.pengirim);
        payload.append("tanggalTerima", form.tanggal);
        return adminSuratApi.addSuratMasuk(payload);
      }
      payload.append("penerima", form.pengirim);
      payload.append("tanggalKirim", form.tanggal);
      return adminSuratApi.addSuratKeluar(payload);
    },
    update: (form, item) => {
      const payload = new FormData();
      payload.append("nomorSurat", form.nomor);
      payload.append("perihal", form.perihal);
      if (form.file) payload.append("file", form.file);

      if (form.jenis === "Surat Masuk") {
        payload.append("pengirim", form.pengirim);
        payload.append("tanggalTerima", form.tanggal);
        return adminSuratApi.updateSuratMasuk(item.id, payload);
      }
      payload.append("penerima", form.pengirim);
      payload.append("tanggalKirim", form.tanggal);
      return adminSuratApi.updateSuratKeluar(item.id, payload);
    },
    remove: (item) =>
      item.jenis === "Surat Masuk"
        ? adminSuratApi.deleteSuratMasuk(item.id)
        : adminSuratApi.deleteSuratKeluar(item.id),
    refetch: refetchCurrentTab,
    messages: {
      created: "Surat berhasil ditambahkan",
      updated: "Surat berhasil diperbarui",
      deleted: "Surat berhasil dihapus",
      saveError: "Terjadi kesalahan saat menyimpan surat.",
      deleteError: "Terjadi kesalahan saat menghapus surat.",
    },
  });

  const handlePreview = (id: number) => {
    const item = suratData.find((item) => item.id === id);
    if (item) {
      setPreviewItem(item);
      previewModal.open();
    }
  };

  const isFormOpen = addModal.isOpen || editModal.isOpen;

  return (
    <div className="min-h-screen bg-surface">
      <div className="w-full space-y-6">
        {previewModal.isOpen && previewItem ? (
          <SuratDetailView item={previewItem} onBack={previewModal.close} />
        ) : isFormOpen ? (
          <SuratForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={() => void (addModal.isOpen ? saveNewItem() : saveEditedItem())}
            onCancel={() => (addModal.isOpen ? addModal.close() : editModal.close())}
            isEdit={editModal.isOpen}
            currentItem={currentItem as never}
          />
        ) : (
          <>
            <AdminPageHeader
              eyebrow="Administrasi Desa"
              title="Arsip Surat"
              description="Kelola arsip surat masuk dan keluar desa."
              actions={
                <button
                  type="button"
                  onClick={() => void refetchCurrentTab()}
                  className={adminSecondaryButtonClass}
                >
                  <FaSyncAlt />
                  Muat Ulang
                </button>
              }
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <AdminMetricCard
                label="Total Surat"
                value={suratData.length}
                icon={<FaFileAlt />}
                tone="primary"
                hint="Surat tersimpan"
              />
              <AdminMetricCard
                label="Surat Masuk"
                value={countMasuk}
                icon={<FaEnvelopeOpen />}
                tone="info"
                hint="Surat masuk tersimpan"
              />
              <AdminMetricCard
                label="Surat Keluar"
                value={countKeluar}
                icon={<FaEnvelope />}
                tone="neutral"
                hint="Surat keluar tersimpan"
              />
            </div>

            <AdminToolbar>
              <AdminFilterTabs
                tabs={[
                  { value: "semua", label: "Semua Surat", count: suratData.length },
                  { value: "masuk", label: "Surat Masuk", count: countMasuk },
                  { value: "keluar", label: "Surat Keluar", count: countKeluar },
                ]}
                value={activeTab}
                onChange={handleTabChange}
              />
            </AdminToolbar>

            <SuratTable
              items={pageItems}
              isLoading={isLoading}
              error={error}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onRetry={() => void refetchCurrentTab()}
              onAdd={handleAdd}
              onPreview={handlePreview}
              onEdit={handleEdit}
              onDelete={handleDelete}
              footer={
                <AdminTablePagination
                  page={page}
                  pageSize={pageSize}
                  totalItems={totalItems}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                  label="surat"
                />
              }
            />
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        title="Hapus surat?"
        description={`Surat "${currentItem?.nomor ?? ""}" akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`}
        isLoading={isActionLoading}
        onConfirm={() => void confirmDelete()}
        onCancel={deleteModal.close}
      />
    </div>
  );
}

export default SuratAdmin;
