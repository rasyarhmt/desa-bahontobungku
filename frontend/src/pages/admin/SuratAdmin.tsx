import { useState, useEffect } from "react";
import {
  FileText,
  LoaderCircle,
  Mail,
  MailOpen,
} from "lucide-react";
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
    <div className="w-full text-slate-900">
      <div className="mx-auto w-full">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-sky-50 text-[#0b6393]">
            <FileText aria-hidden="true" className="size-5" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Arsip Surat
          </h1>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900">
                Total Surat
              </h3>
              <div className="flex size-11 items-center justify-center rounded-xl bg-sky-50 text-[#0b6393]">
                <FileText aria-hidden="true" className="size-5" />
              </div>
            </div>
            <div className="mb-1 text-3xl font-bold text-slate-900">
              {suratData.length}
            </div>
            <p className="text-base text-slate-600">Surat tersimpan</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900">
                Surat Masuk
              </h3>
              <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <MailOpen aria-hidden="true" className="size-5" />
              </div>
            </div>
            <div className="mb-1 text-3xl font-bold text-slate-900">
              {countMasuk}
            </div>
            <p className="text-base text-slate-600">Surat masuk tersimpan</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900">
                Surat Keluar
              </h3>
              <div className="flex size-11 items-center justify-center rounded-xl bg-sky-50 text-[#0b6393]">
                <Mail aria-hidden="true" className="size-5" />
              </div>
            </div>
            <div className="mb-1 text-3xl font-bold text-slate-900">
              {countKeluar}
            </div>
            <p className="text-base text-slate-600">Surat keluar tersimpan</p>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleTabChange("semua")}
              className={`flex min-h-11 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === "semua"
                  ? "bg-[#0b6393] text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <FileText aria-hidden="true" className="size-5" />
              <span>Semua Surat</span>
            </button>
            <button
              onClick={() => handleTabChange("masuk")}
              className={`flex min-h-11 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === "masuk"
                  ? "bg-[#0b6393] text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <MailOpen aria-hidden="true" className="size-5" />
              <span>Surat Masuk</span>
            </button>
            <button
              onClick={() => handleTabChange("keluar")}
              className={`flex min-h-11 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === "keluar"
                  ? "bg-[#0b6393] text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Mail aria-hidden="true" className="size-5" />
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

      {addModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                Tambah Surat Baru
              </h3>
              <p className="text-base text-slate-600">
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

      {editModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900">Edit Surat</h3>
              <p className="text-base text-slate-600">Ubah informasi surat</p>
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

      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                Konfirmasi Hapus
              </h3>
              <p className="text-base text-slate-600">
                Apakah Anda yakin ingin menghapus surat "{currentItem?.nomor}"?
                Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <button
                onClick={() => deleteModal.close()}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-60"
                disabled={isActionLoading}
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-60"
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
