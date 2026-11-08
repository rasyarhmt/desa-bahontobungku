import { useState, useEffect } from "react";
import {
  FaEnvelope,
  FaEnvelopeOpen,
  FaFileAlt,
  FaSpinner,
} from "react-icons/fa";
import { type SuratItem, adminSuratApi } from "@/lib/api/admin";
import { getAuthState } from "@/lib/auth";
import { toDateInputValue } from "@/lib/format";
import { useCrudResource, useDisclosure } from "@/hooks";
import SuratForm from "@/components/admin/SuratForm";
import SuratTable from "@/components/admin/SuratTable";
import SuratPreviewModal from "@/components/admin/SuratPreviewModal";
import type { SuratFormData } from "@/components/admin/suratShared";

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

  return (
    <div
      className="p-6 bg-gray-50 min-h-screen"
      style={{ fontFamily: "poppins" }}
    >
      <div className="w-full mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-100 p-2 rounded-lg">
            <FaFileAlt className="text-purple-500 text-xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Arsip Surat</h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Total Surat
              </h3>
              <div className="bg-purple-100 p-2 rounded-lg">
                <FaFileAlt className="text-purple-500 text-xl" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {suratData.length}
            </div>
            <p className="text-sm text-gray-600">Surat tersimpan</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Surat Masuk
              </h3>
              <div className="bg-blue-100 p-2 rounded-lg">
                <FaEnvelopeOpen className="text-blue-500 text-xl" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {countMasuk}
            </div>
            <p className="text-sm text-gray-600">Surat masuk tersimpan</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Surat Keluar
              </h3>
              <div className="bg-green-100 p-2 rounded-lg">
                <FaEnvelope className="text-green-500 text-xl" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {countKeluar}
            </div>
            <p className="text-sm text-gray-600">Surat keluar tersimpan</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleTabChange("semua")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                activeTab === "semua"
                  ? "bg-purple-500 text-white font-medium shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FaFileAlt
                className={
                  activeTab === "semua" ? "text-white" : "text-purple-500"
                }
              />
              <span>Semua Surat</span>
            </button>
            <button
              onClick={() => handleTabChange("masuk")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                activeTab === "masuk"
                  ? "bg-blue-500 text-white font-medium shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FaEnvelopeOpen
                className={
                  activeTab === "masuk" ? "text-white" : "text-blue-500"
                }
              />
              <span>Surat Masuk</span>
            </button>
            <button
              onClick={() => handleTabChange("keluar")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                activeTab === "keluar"
                  ? "bg-green-500 text-white font-medium shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FaEnvelope
                className={
                  activeTab === "keluar" ? "text-white" : "text-green-500"
                }
              />
              <span>Surat Keluar</span>
            </button>
          </div>
        </div>

        <SuratTable
          items={filteredData}
          isLoading={isLoading}
          error={error}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRetry={refetchCurrentTab}
          onAdd={handleAdd}
          onPreview={handlePreview}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Add Modal */}
      {addModal.isOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-gray-700/30 flex items-center justify-center z-50 transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md border border-gray-200 animate-modalFadeIn">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                Tambah Surat Baru
              </h3>
              <p className="text-gray-600 text-sm">
                Masukkan informasi surat yang akan ditambahkan
              </p>
            </div>

            <SuratForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={saveNewItem}
              onCancel={() => addModal.close()}
              isEdit={false}
            />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal.isOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-gray-700/30 flex items-center justify-center z-50 transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md border border-gray-200 animate-modalFadeIn">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800">Edit Surat</h3>
              <p className="text-gray-600 text-sm">Ubah informasi surat</p>
            </div>

            <SuratForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={saveEditedItem}
              onCancel={() => editModal.close()}
              isEdit={true}
              currentItem={currentItem as never}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-gray-700/30 flex items-center justify-center z-50 transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md border border-gray-200 animate-modalFadeIn">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                Konfirmasi Hapus
              </h3>
              <p className="text-gray-600 text-sm">
                Apakah Anda yakin ingin menghapus surat "{currentItem?.nomor}"?
                Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => deleteModal.close()}
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

      <SuratPreviewModal
        isOpen={previewModal.isOpen}
        item={previewItem}
        onClose={previewModal.close}
      />
    </div>
  );
}

export default SuratAdmin;
