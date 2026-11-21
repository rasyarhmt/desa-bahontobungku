import {
  ArrowLeftRight,
  IdCard,
  Image as ImageIcon,
  LoaderCircle,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  UserRound,
} from "lucide-react";
import { adminAparatApi, type AparatFormattedAdmin } from "@/lib/api/admin";
import { getAuthState } from "@/lib/auth";
import { useAsyncData, useCrudResource, useSearchFilter } from "@/hooks";

interface AparatForm {
  nama: string;
  jabatan: string;
  nip: string;
  foto: File | null;
  fotoPreview: string | null;
  originalFoto: string | null;
}

const initialForm: AparatForm = {
  nama: "",
  jabatan: "",
  nip: "",
  foto: null,
  fotoPreview: null,
  originalFoto: null,
};

const AparatAdmin = () => {
  const { token } = getAuthState();

  const {
    data: aparatData,
    isLoading,
    error,
    refetch: fetchAparatData,
  } = useAsyncData<AparatFormattedAdmin[]>(
    async () => {
      const data = await adminAparatApi.getAllAparat();
      return adminAparatApi.formatAparatData(data);
    },
    [],
    { errorMessage: "Gagal memuat data aparat desa." },
  );

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
  } = useCrudResource<AparatFormattedAdmin, AparatForm>({
    items: aparatData,
    initialForm,
    toForm: (item) => ({
      nama: item.nama || "",
      jabatan: item.jabatan || "",
      nip: item.nip || "",
      foto: null,
      fotoPreview: item.foto || null,
      originalFoto: item.foto,
    }),
    validate: (form) =>
      !form.nama || !form.jabatan ? "Nama, dan jabatan wajib diisi!" : null,
    guard: () =>
      token ? null : "Anda harus login sebagai admin untuk mengelola aparat",
    create: (form) =>
      adminAparatApi.addAparat({
        nama: form.nama,
        jabatan: form.jabatan,
        nip: form.nip ? form.nip.trim() : "",
        foto: form.foto,
      }),
    update: (form, item) =>
      adminAparatApi.updateAparat(item.id, {
        nama: form.nama,
        jabatan: form.jabatan,
        nip: form.nip ? form.nip.trim() : "",
        foto: form.foto,
      }),
    remove: (item) => adminAparatApi.deleteAparat(item.id),
    refetch: fetchAparatData,
    messages: {
      created: "Aparat berhasil ditambahkan",
      updated: "Aparat berhasil diperbarui",
      deleted: "Aparat berhasil dihapus",
      saveError: "Terjadi kesalahan saat menyimpan aparat.",
      deleteError: "Terjadi kesalahan saat menghapus aparat.",
    },
  });

  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    filtered: filteredData,
  } = useSearchFilter(aparatData, (item, query) => {
    const q = query.toLowerCase();
    return (
      (item.nama?.toLowerCase() || "").includes(q) ||
      (item.jabatan?.toLowerCase() || "").includes(q) ||
      (item.nip?.toLowerCase() || "").includes(q)
    );
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        foto: file,
        fotoPreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleChangeThumbnail = () => {
    document.getElementById("thumbnail-file-input")?.click();
  };

  const handleDeleteThumbnail = () => {
    setFormData((prev) => ({
      ...prev,
      foto: null,
      fotoPreview: null,
    }));
  };

  return (
    <div
      className="min-h-screen bg-[#f6f8fb] p-6"
     
    >
      <div className="mx-auto w-full">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-[#0b6393]/10 p-2">
            <UserRound
              aria-hidden="true"
              className="size-5 text-[#0b6393]"
            />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Manajemen Aparat Desa
          </h1>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Daftar Aparat Desa
              </h2>
              <p className="text-base text-slate-600">
                Kelola data aparat dan pejabat desa
              </p>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label
                  htmlFor="aparat-search"
                  className="mb-1 block text-sm font-semibold text-slate-800"
                >
                  Cari Aparat
                </label>
                <div className="relative">
                  <Search
                    aria-hidden="true"
                    className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    id="aparat-search"
                    type="text"
                    placeholder="Cari aparat..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="min-h-11 w-64 rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-base text-slate-900 placeholder:text-slate-500 focus:border-[#0b6393] focus:ring-2 focus:ring-[#0b6393]/20"
                  />
                </div>
              </div>
              <button
                onClick={handleAdd}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0b6393] px-4 font-semibold text-white transition-colors hover:bg-[#0a557c]"
              >
                <Plus aria-hidden="true" className="size-5" />
                <span>Tambah Aparat</span>
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="py-8 text-center">
              <LoaderCircle
                aria-hidden="true"
                className="mx-auto mb-4 size-8 animate-spin text-[#0b6393]"
              />
              <p className="text-base text-slate-600">Memuat data aparat...</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center text-red-700">
              <p className="text-base">{error}</p>
              <button
                onClick={fetchAparatData}
                className="mt-4 min-h-11 rounded-xl bg-[#0b6393] px-4 font-semibold text-white transition-colors hover:bg-[#0a557c]"
              >
                Coba Lagi
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-base">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="rounded-tl-xl px-4 py-4 text-left text-base font-bold text-slate-900">
                      Foto
                    </th>
                    <th className="px-4 py-4 text-left text-base font-bold text-slate-900">
                      Nama
                    </th>
                    <th className="px-4 py-4 text-left text-base font-bold text-slate-900">
                      Jabatan
                    </th>
                    <th className="px-4 py-4 text-left text-base font-bold text-slate-900">
                      NIP
                    </th>
                    <th className="rounded-tr-xl px-4 py-4 text-right text-base font-bold text-slate-900">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredData.length > 0 ? (
                    filteredData.map((aparat) => (
                      <tr key={aparat.id} className="hover:bg-slate-50">
                        <td className="px-4 py-4 text-base">
                          {aparat.foto ? (
                            <img
                              src={aparat.foto || "/placeholder.svg"}
                              alt={aparat.nama}
                              className="size-12 rounded-full border-2 border-slate-200 object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                const sibling = e.currentTarget
                                  .nextSibling as HTMLElement | null;
                                if (sibling) {
                                  sibling.style.display = "flex";
                                }
                              }}
                            />
                          ) : (
                            <div className="flex size-12 items-center justify-center rounded-lg bg-slate-100">
                              <ImageIcon
                                aria-hidden="true"
                                className="size-5 text-slate-500"
                              />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4 text-base font-semibold text-slate-900">
                          <div className="flex items-center gap-2">
                            <UserRound
                              aria-hidden="true"
                              className="size-5 shrink-0 text-slate-500"
                            />
                            {aparat.nama}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-base text-slate-800">
                          {aparat.jabatan}
                        </td>
                        <td className="px-4 py-4 text-base text-slate-800">
                          <div className="flex items-center gap-2">
                            <span>
                              {aparat.nip ? (
                                <div className="flex items-center gap-2">
                                  <IdCard
                                    aria-hidden="true"
                                    className="size-5 shrink-0 text-slate-500"
                                  />
                                  <span>{aparat.nip}</span>
                                </div>
                              ) : (
                                "Tidak Memiliki NIP"
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(aparat.id)}
                              aria-label={`Edit ${aparat.nama}`}
                              title="Edit"
                              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200"
                            >
                              <Pencil aria-hidden="true" className="size-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(aparat.id)}
                              aria-label={`Hapus ${aparat.nama}`}
                              title="Hapus"
                              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-red-50 text-red-700 transition-colors hover:bg-red-100"
                            >
                              <Trash2 aria-hidden="true" className="size-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-base text-slate-600"
                      >
                        {searchQuery
                          ? "Tidak ada aparat yang ditemukan dengan pencarian tersebut."
                          : "Belum ada data aparat desa."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {addModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                Tambah Aparat Baru
              </h3>
              <p className="text-base text-slate-600">
                Masukkan informasi aparat yang akan ditambahkan
              </p>
            </div>

            <div className="mb-6 space-y-4">
              <div>
                <label
                  htmlFor="nama"
                  className="mb-1 block text-sm font-semibold text-slate-800"
                >
                  Nama Lengkap <span className="text-red-700">*</span>
                </label>
                <input
                  id="nama"
                  type="text"
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData({ ...formData, nama: e.target.value })
                  }
                  className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 placeholder:text-slate-500 focus:border-[#0b6393] focus:ring-2 focus:ring-[#0b6393]/20"
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div>
                <label
                  htmlFor="foto"
                  className="mb-1 block text-sm font-semibold text-slate-800"
                >
                  Foto Aparat
                </label>
                <div className="flex items-center gap-4">
                  <input
                    id="foto"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 focus:border-[#0b6393] focus:ring-2 focus:ring-[#0b6393]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="jabatan"
                    className="mb-1 block text-sm font-semibold text-slate-800"
                  >
                    Jabatan <span className="text-red-700">*</span>
                  </label>
                  <input
                    id="jabatan"
                    type="text"
                    value={formData.jabatan}
                    onChange={(e) =>
                      setFormData({ ...formData, jabatan: e.target.value })
                    }
                    className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 placeholder:text-slate-500 focus:border-[#0b6393] focus:ring-2 focus:ring-[#0b6393]/20"
                    placeholder="Contoh: Kepala Desa, Sekretaris"
                  />
                </div>

                <div>
                  <label
                    htmlFor="nip"
                    className="mb-1 block text-sm font-semibold text-slate-800"
                  >
                    NIP
                  </label>
                  <input
                    id="nip"
                    type="text"
                    value={formData.nip || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, nip: e.target.value })
                    }
                    className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 placeholder:text-slate-500 focus:border-[#0b6393] focus:ring-2 focus:ring-[#0b6393]/20"
                    placeholder="Masukkan NIP atau NIK"
                  />
                </div>
              </div>

              {formData.fotoPreview && (
                <div className="relative size-32">
                  <img
                    src={formData.fotoPreview || "/placeholder.svg"}
                    alt="Preview"
                    className="size-32 rounded-lg border-2 border-slate-200 object-cover"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-end gap-3">
              <button
                onClick={() => addModal.close()}
                className="min-h-11 rounded-xl bg-slate-100 px-5 font-semibold text-slate-700 transition-colors hover:bg-slate-200"
                disabled={isActionLoading}
              >
                Batal
              </button>
              <button
                onClick={saveNewItem}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0b6393] px-5 font-semibold text-white transition-colors hover:bg-[#0a557c]"
                disabled={isActionLoading}
              >
                {isActionLoading ? (
                  <>
                    <LoaderCircle
                      aria-hidden="true"
                      className="size-5 animate-spin"
                    />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Save aria-hidden="true" className="size-5" />
                    <span>Simpan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {editModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900">Edit Aparat</h3>
              <p className="text-base text-slate-600">Ubah informasi aparat</p>
            </div>

            <div className="mb-6 space-y-4">
              <div>
                <label
                  htmlFor="edit-nama"
                  className="mb-1 block text-sm font-semibold text-slate-800"
                >
                  Nama Lengkap <span className="text-red-700">*</span>
                </label>
                <input
                  id="edit-nama"
                  type="text"
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData({ ...formData, nama: e.target.value })
                  }
                  className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 placeholder:text-slate-500 focus:border-[#0b6393] focus:ring-2 focus:ring-[#0b6393]/20"
                />
              </div>

              <div>
                <label
                  htmlFor="thumbnail-file-input"
                  className="mb-1 block text-sm font-semibold text-slate-800"
                >
                  Foto Aparat
                </label>
                <div className="flex flex-col gap-3">
                  {formData.fotoPreview ? (
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="relative size-24">
                        <img
                          src={formData.fotoPreview || "/placeholder.svg"}
                          alt="Foto"
                          className="size-24 rounded-full border-2 border-slate-200 object-cover"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={handleChangeThumbnail}
                          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0b6393] px-4 font-semibold text-white transition-colors hover:bg-[#0a557c]"
                        >
                          <ArrowLeftRight
                            aria-hidden="true"
                            className="size-5"
                          />
                          <span>Ganti Foto</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleDeleteThumbnail}
                          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-red-50 px-4 font-semibold text-red-700 transition-colors hover:bg-red-100"
                        >
                          <Trash2 aria-hidden="true" className="size-5" />
                          <span>Hapus Foto</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex size-24 items-center justify-center rounded-full bg-slate-100">
                        <UserRound
                          aria-hidden="true"
                          className="size-8 text-slate-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleChangeThumbnail}
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0b6393] px-4 font-semibold text-white transition-colors hover:bg-[#0a557c]"
                      >
                        <Plus aria-hidden="true" className="size-5" />
                        <span>Tambah Foto</span>
                      </button>
                    </div>
                  )}

                  <input
                    id="thumbnail-file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="edit-jabatan"
                    className="mb-1 block text-sm font-semibold text-slate-800"
                  >
                    Jabatan <span className="text-red-700">*</span>
                  </label>
                  <input
                    id="edit-jabatan"
                    type="text"
                    value={formData.jabatan}
                    onChange={(e) =>
                      setFormData({ ...formData, jabatan: e.target.value })
                    }
                    className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 placeholder:text-slate-500 focus:border-[#0b6393] focus:ring-2 focus:ring-[#0b6393]/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit-nip"
                    className="mb-1 block text-sm font-semibold text-slate-800"
                  >
                    NIP
                  </label>
                  <input
                    id="edit-nip"
                    type="text"
                    value={formData.nip || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, nip: e.target.value })
                    }
                    className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 placeholder:text-slate-500 focus:border-[#0b6393] focus:ring-2 focus:ring-[#0b6393]/20"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3">
              <button
                onClick={() => editModal.close()}
                className="min-h-11 rounded-xl bg-slate-100 px-5 font-semibold text-slate-700 transition-colors hover:bg-slate-200"
                disabled={isActionLoading}
              >
                Batal
              </button>
              <button
                onClick={saveEditedItem}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0b6393] px-5 font-semibold text-white transition-colors hover:bg-[#0a557c]"
                disabled={isActionLoading}
              >
                {isActionLoading ? (
                  <>
                    <LoaderCircle
                      aria-hidden="true"
                      className="size-5 animate-spin"
                    />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Save aria-hidden="true" className="size-5" />
                    <span>Simpan Perubahan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                Konfirmasi Hapus
              </h3>
              <p className="text-base text-slate-600">
                Apakah Anda yakin ingin menghapus aparat "{currentItem?.nama}"?
                Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex flex-wrap justify-end gap-3">
              <button
                onClick={() => deleteModal.close()}
                className="min-h-11 rounded-xl bg-slate-100 px-5 font-semibold text-slate-700 transition-colors hover:bg-slate-200"
                disabled={isActionLoading}
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-red-700 px-5 font-semibold text-white transition-colors hover:bg-red-800"
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
    </div>
  );
};

export default AparatAdmin;
