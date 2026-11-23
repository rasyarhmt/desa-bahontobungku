import {
  FaEdit,
  FaExchangeAlt,
  FaIdCard,
  FaImage,
  FaPlus,
  FaTrash,
  FaTrashAlt,
  FaUser,
  FaUsers,
} from "react-icons/fa";

import AdminTablePagination from "@/components/admin/AdminTablePagination";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import {
  AdminField,
  AdminFormSection,
  AdminFormView,
  AdminInput,
  AdminMetricCard,
  AdminPageHeader,
  AdminSearchInput,
  AdminTableShell,
  AdminToolbar,
  adminDangerButtonClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "@/components/admin/admin-ui";
import { adminAparatApi, type AparatFormattedAdmin } from "@/lib/api/admin";
import { getAuthState } from "@/lib/auth";
import {
  useAsyncData,
  useCrudResource,
  useSearchFilter,
  useTablePagination,
} from "@/hooks";

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

  const {
    page,
    setPage,
    pageSize,
    setPageSize,
    pageItems,
    totalItems,
    totalPages,
  } = useTablePagination(filteredData, {
    resetKey: searchQuery,
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
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

  const countWithNip = aparatData.filter((item) => item.nip).length;

  const renderForm = (isEdit: boolean) => (
    <AdminFormView
      eyebrow="Manajemen Aparat"
      title={isEdit ? "Edit Aparat" : "Tambah Aparat Baru"}
      description={
        isEdit
          ? "Ubah informasi aparat"
          : "Masukkan informasi aparat yang akan ditambahkan"
      }
      onBack={isEdit ? editModal.close : addModal.close}
      actions={
        <>
          <button
            type="button"
            onClick={isEdit ? editModal.close : addModal.close}
            disabled={isActionLoading}
            className={adminSecondaryButtonClass}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={isEdit ? () => void saveEditedItem() : () => void saveNewItem()}
            disabled={isActionLoading}
            className={adminPrimaryButtonClass}
          >
            {isActionLoading ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan"}
          </button>
        </>
      }
    >
      <AdminFormSection number={1} title="Data Aparat">
        <div className="grid gap-4">
          <AdminField label="Nama Lengkap" htmlFor={isEdit ? "edit-nama" : "nama"} required>
            <AdminInput
              id={isEdit ? "edit-nama" : "nama"}
              type="text"
              value={formData.nama}
              onChange={(event) =>
                setFormData({ ...formData, nama: event.target.value })
              }
              placeholder="Masukkan nama lengkap"
            />
          </AdminField>

          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField
              label="Jabatan"
              htmlFor={isEdit ? "edit-jabatan" : "jabatan"}
              required
            >
              <AdminInput
                id={isEdit ? "edit-jabatan" : "jabatan"}
                type="text"
                value={formData.jabatan}
                onChange={(event) =>
                  setFormData({ ...formData, jabatan: event.target.value })
                }
                placeholder="Contoh: Kepala Desa, Sekretaris"
              />
            </AdminField>

            <AdminField label="NIP" htmlFor={isEdit ? "edit-nip" : "nip"}>
              <AdminInput
                id={isEdit ? "edit-nip" : "nip"}
                type="text"
                value={formData.nip || ""}
                onChange={(event) =>
                  setFormData({ ...formData, nip: event.target.value })
                }
                placeholder="Masukkan NIP atau NIK"
              />
            </AdminField>
          </div>
        </div>
      </AdminFormSection>

      <AdminFormSection
        number={2}
        title="Foto Aparat"
        description="Foto profil yang ditampilkan pada data aparat desa."
      >
        <AdminField label="Foto Aparat" htmlFor={isEdit ? "edit-foto" : "foto"}>
          {isEdit ? (
            <div className="flex flex-col gap-3">
              {formData.fotoPreview ? (
                <div className="flex items-center gap-4">
                  <img
                    src={formData.fotoPreview}
                    alt="Foto"
                    className="h-24 w-24 rounded-full border border-border object-cover"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleChangeThumbnail}
                      className={adminSecondaryButtonClass}
                    >
                      <FaExchangeAlt />
                      Ganti Foto
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteThumbnail}
                      className={adminDangerButtonClass}
                    >
                      <FaTrashAlt />
                      Hapus Foto
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-surface-container text-muted-foreground">
                    <FaUser className="text-2xl" />
                  </div>
                  <button
                    type="button"
                    onClick={handleChangeThumbnail}
                    className={adminSecondaryButtonClass}
                  >
                    <FaPlus />
                    Tambah Foto
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
          ) : (
            <div className="flex items-center gap-4">
              <AdminInput
                id="foto"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              {formData.fotoPreview && (
                <img
                  src={formData.fotoPreview}
                  alt="Preview"
                  className="h-16 w-16 rounded-full border border-border object-cover"
                />
              )}
            </div>
          )}
        </AdminField>
      </AdminFormSection>
    </AdminFormView>
  );

  return (
    <div className="min-h-screen bg-surface">
      <div className="w-full space-y-6">
        {addModal.isOpen ? (
          renderForm(false)
        ) : editModal.isOpen ? (
          renderForm(true)
        ) : (
          <>
            <AdminPageHeader
              eyebrow="Manajemen Aparat"
              title="Manajemen Aparat Desa"
              description="Kelola data aparat dan pejabat desa."
            />

            <div className="grid gap-4 sm:grid-cols-3">
              <AdminMetricCard
                label="Total Aparat"
                value={aparatData.length}
                icon={<FaUsers />}
                hint="Aparat terdaftar"
              />
              <AdminMetricCard
                label="Memiliki NIP"
                value={countWithNip}
                icon={<FaIdCard />}
                tone="success"
                hint="Data NIP/NIK tersedia"
              />
              <AdminMetricCard
                label="Tanpa NIP"
                value={aparatData.length - countWithNip}
                icon={<FaUser />}
                tone="neutral"
                hint="Belum memiliki NIP/NIK"
              />
            </div>

            <AdminToolbar>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <AdminSearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Cari aparat..."
                  className="lg:w-80"
                />
                <button
                  type="button"
                  onClick={handleAdd}
                  className={adminPrimaryButtonClass}
                >
                  <FaPlus />
                  Tambah Aparat
                </button>
              </div>
            </AdminToolbar>

            <AdminTableShell
              loading={isLoading}
              error={error}
              onRetry={() => void fetchAparatData()}
              empty={filteredData.length === 0}
              emptyLabel={
                searchQuery
                  ? "Tidak ada aparat yang ditemukan dengan pencarian tersebut."
                  : "Belum ada data aparat desa."
              }
              footer={
                <AdminTablePagination
                  page={page}
                  pageSize={pageSize}
                  totalItems={totalItems}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                  label="aparat"
                />
              }
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left">
                  <thead className="bg-surface-container-low text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-6 py-3 font-medium">Foto</th>
                      <th className="px-3 py-3 font-medium">Nama</th>
                      <th className="px-3 py-3 font-medium">Jabatan</th>
                      <th className="px-3 py-3 font-medium">NIP</th>
                      <th className="px-6 py-3 text-right font-medium">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {pageItems.map((aparat) => (
                      <tr
                        key={aparat.id}
                        className="transition-colors hover:bg-surface-container-low"
                      >
                        <td className="px-6 py-4">
                          {aparat.foto ? (
                            <>
                              <img
                                src={aparat.foto}
                                alt={aparat.nama}
                                className="h-12 w-12 rounded-full border-2 border-border object-cover"
                                onError={(event) => {
                                  event.currentTarget.style.display = "none";
                                  const sibling =
                                    event.currentTarget
                                      .nextElementSibling as HTMLElement | null;
                                  if (sibling) sibling.style.display = "flex";
                                }}
                              />
                              <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-surface-container text-muted-foreground">
                                <FaImage />
                              </div>
                            </>
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-container text-muted-foreground">
                              <FaImage />
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-4 text-sm font-medium text-on-surface">
                          <div className="flex items-center gap-2">
                            <FaUser className="text-muted-foreground" />
                            {aparat.nama}
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm text-on-surface-variant">
                          {aparat.jabatan}
                        </td>
                        <td className="px-3 py-4 text-sm text-on-surface-variant">
                          {aparat.nip ? (
                            <div className="flex items-center gap-2">
                              <FaIdCard className="text-muted-foreground" />
                              <span>{aparat.nip}</span>
                            </div>
                          ) : (
                            "Tidak Memiliki NIP"
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleEdit(aparat.id)}
                              aria-label={`Edit ${aparat.nama}`}
                              title="Edit"
                              className="rounded-xl p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
                            >
                              <FaEdit />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(aparat.id)}
                              aria-label={`Hapus ${aparat.nama}`}
                              title="Hapus"
                              className="rounded-xl p-2 text-destructive transition-colors hover:bg-destructive/10"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AdminTableShell>
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        title="Hapus aparat?"
        description={`Apakah Anda yakin ingin menghapus aparat "${currentItem?.nama}"? Tindakan ini tidak dapat dibatalkan.`}
        isLoading={isActionLoading}
        onConfirm={() => void confirmDelete()}
        onCancel={deleteModal.close}
      />
    </div>
  );
};

export default AparatAdmin;
