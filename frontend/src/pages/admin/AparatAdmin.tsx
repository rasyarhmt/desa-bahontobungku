import {
  FaEdit,
  FaExchangeAlt,
  FaIdCard,
  FaImage,
  FaPlus,
  FaSearch,
  FaSpinner,
  FaTrash,
  FaTrashAlt,
  FaUser,
} from "react-icons/fa";
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
      className="p-6 bg-gray-50 min-h-screen"
      style={{ fontFamily: "poppins" }}
    >
      <div className="w-full mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-2 rounded-lg">
            <FaUser className="text-blue-500 text-xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Manajemen Aparat Desa
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Daftar Aparat Desa
              </h2>
              <p className="text-gray-600 text-sm">
                Kelola data aparat dan pejabat desa
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari aparat..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                />
              </div>
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <FaPlus className="text-white" />
                <span>Tambah Aparat</span>
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <FaSpinner className="animate-spin text-blue-500 text-4xl mx-auto mb-4" />
              <p className="text-gray-600">Memuat data aparat...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>{error}</p>
              <button
                onClick={fetchAparatData}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 rounded-tl-lg">
                      Foto
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      Nama
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      Jabatan
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      NIP
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600 rounded-tr-lg">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredData.length > 0 ? (
                    filteredData.map((aparat) => (
                      <tr key={aparat.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">
                          {aparat.foto ? (
                            <img
                              src={aparat.foto || "/placeholder.svg"}
                              alt={aparat.nama}
                              className="w-12 h-12 object-cover rounded-full border-2 border-gray-200"
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
                            <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                              <FaImage className="text-gray-400" />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                          <div className="flex items-center gap-2">
                            <FaUser className="text-gray-400" />
                            {aparat.nama}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800">
                          {aparat.jabatan}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800">
                          <div className="flex items-center gap-2">
                            <span>
                              {aparat.nip ? (
                                <div className="flex items-center gap-2">
                                  <FaIdCard className="text-gray-400" />
                                  <span>{aparat.nip}</span>
                                </div>
                              ) : (
                                "Tidak Memiliki NIP"
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(aparat.id)}
                              className="p-1.5 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                              title="Edit"
                            >
                              <FaEdit className="text-gray-600" />
                            </button>
                            <button
                              onClick={() => handleDelete(aparat.id)}
                              className="p-1.5 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
                              title="Hapus"
                            >
                              <FaTrash className="text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-gray-500"
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
        <div className="fixed inset-0 backdrop-blur-sm bg-gray-700/30 flex items-center justify-center z-50 transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 animate-modalFadeIn">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                Tambah Aparat Baru
              </h3>
              <p className="text-gray-600 text-sm">
                Masukkan informasi aparat yang akan ditambahkan
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label
                  htmlFor="nama"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  id="nama"
                  type="text"
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData({ ...formData, nama: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div>
                <label
                  htmlFor="foto"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Foto Aparat
                </label>
                <div className="flex items-center gap-4">
                  <input
                    id="foto"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="jabatan"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Jabatan <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="jabatan"
                    type="text"
                    value={formData.jabatan}
                    onChange={(e) =>
                      setFormData({ ...formData, jabatan: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Contoh: Kepala Desa, Sekretaris"
                  />
                </div>

                <div>
                  <label
                    htmlFor="nip"
                    className="block text-sm font-medium text-gray-700 mb-1"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Masukkan NIP atau NIK"
                  />
                </div>
              </div>

              {formData.fotoPreview && (
                <div className="relative w-40 h-16">
                  <img
                    src={formData.fotoPreview || "/placeholder.svg"}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-md border-2 border-gray-200"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => addModal.close()}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={isActionLoading}
              >
                Batal
              </button>
              <button
                onClick={saveNewItem}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                disabled={isActionLoading}
              >
                {isActionLoading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <span>Simpan</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {editModal.isOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-gray-700/30 flex items-center justify-center z-50 transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 animate-modalFadeIn">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800">Edit Aparat</h3>
              <p className="text-gray-600 text-sm">Ubah informasi aparat</p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label
                  htmlFor="edit-nama"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  id="edit-nama"
                  type="text"
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData({ ...formData, nama: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-foto"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Foto Aparat
                </label>
                <div className="flex flex-col gap-3">
                  {formData.fotoPreview ? (
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 relative">
                        <img
                          src={formData.fotoPreview || "/placeholder.svg"}
                          alt="Foto"
                          className="w-24 h-24 object-cover rounded-full border-2 border-gray-200"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={handleChangeThumbnail}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                        >
                          <FaExchangeAlt size={14} />
                          <span>Ganti Foto</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleDeleteThumbnail}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                        >
                          <FaTrashAlt size={14} />
                          <span>Hapus Foto</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                        <FaUser className="text-gray-400 text-2xl" />
                      </div>
                      <button
                        type="button"
                        onClick={handleChangeThumbnail}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                      >
                        <FaPlus size={14} />
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="edit-jabatan"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Jabatan <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="edit-jabatan"
                    type="text"
                    value={formData.jabatan}
                    onChange={(e) =>
                      setFormData({ ...formData, jabatan: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit-nip"
                    className="block text-sm font-medium text-gray-700 mb-1"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => editModal.close()}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={isActionLoading}
              >
                Batal
              </button>
              <button
                onClick={saveEditedItem}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                disabled={isActionLoading}
              >
                {isActionLoading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <span>Simpan Perubahan</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModal.isOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-gray-700/30 flex items-center justify-center z-50 transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md border border-gray-200 animate-modalFadeIn">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                Konfirmasi Hapus
              </h3>
              <p className="text-gray-600 text-sm">
                Apakah Anda yakin ingin menghapus aparat "{currentItem?.nama}"?
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
    </div>
  );
};

export default AparatAdmin;
