import { useState } from "react";
import {
  FaBullhorn,
  FaCheck,
  FaClock,
  FaEdit,
  FaEye,
  FaPlus,
  FaTrash,
} from "react-icons/fa";

import ConfirmDialog from "@/components/admin/ConfirmDialog";
import {
  AdminDetailGrid,
  AdminDetailItem,
  AdminDetailView,
  AdminField,
  AdminFilterTabs,
  AdminFormSection,
  AdminFormView,
  AdminInput,
  AdminMetricCard,
  AdminPageHeader,
  AdminSearchInput,
  AdminStatusBadge,
  AdminTableShell,
  AdminTextarea,
  AdminToolbar,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "@/components/admin/admin-ui";
import { adminPengumumanApi } from "@/lib/api/admin";
import { getAuthState } from "@/lib/auth";
import { formatDateLong, formatDateShort, toDateInputValue } from "@/lib/format";
import { useAsyncData, useCrudResource, useSearchFilter } from "@/hooks";

interface PengumumanItem {
  id: number;
  judul: string;
  isi: string;
  tanggalMulai: string | null;
  tanggalSelesai: string | null;
  status: string;
  tanggal?: string;
  tanggalBerakhir?: string;
}

interface PengumumanForm {
  judul: string;
  isi: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  status: string;
}

const PengumumanAdmin = () => {
  const { token } = getAuthState();

  const [activeTab, setActiveTab] = useState("semua");

  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewItem, setPreviewItem] = useState<PengumumanItem | null>(null);

  const {
    data: pengumumanData,
    isLoading,
    error,
    refetch: fetchAllPengumuman,
  } = useAsyncData<PengumumanItem[]>(
    async () => {
      const data = await adminPengumumanApi.getAllPengumuman();
      return data.map((item) => ({
        id: item.id,
        judul: item.judul,
        isi: item.isi,
        tanggalMulai: item.tanggalMulai
          ? new Date(item.tanggalMulai).toISOString()
          : null,
        tanggalSelesai: item.tanggalSelesai
          ? new Date(item.tanggalSelesai).toISOString()
          : null,
        status:
          new Date(item.tanggalSelesai) < new Date() ? "Kadaluarsa" : "Aktif",
      }));
    },
    [],
    { errorMessage: "Gagal memuat data pengumuman." },
  );

  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    filtered: filteredData,
  } = useSearchFilter(pengumumanData, (item, query) => {
    const q = query.toLowerCase();
    const matchesSearch =
      item.judul.toLowerCase().includes(q) ||
      item.isi.toLowerCase().includes(q);

    const matchesFilter =
      activeTab === "semua" ||
      (activeTab === "aktif" && item.status === "Aktif") ||
      (activeTab === "kadaluarsa" && item.status === "Kadaluarsa");

    return matchesSearch && matchesFilter;
  });

  const countAktif = pengumumanData.filter(
    (item) => item.status === "Aktif",
  ).length;
  const countKadaluarsa = pengumumanData.filter(
    (item) => item.status === "Kadaluarsa",
  ).length;

  const {
    addModal,
    editModal,
    deleteModal,
    currentItem,
    formData,
    setFormData,
    handleAdd,
    handleEdit,
    handleDelete,
    saveNewItem,
    saveEditedItem,
    confirmDelete,
    runAction,
  } = useCrudResource<PengumumanItem, PengumumanForm>({
    items: pengumumanData,
    initialForm: {
      judul: "",
      isi: "",
      tanggalMulai: toDateInputValue(new Date()),
      tanggalSelesai: toDateInputValue(
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ),
      status: "Aktif",
    },
    toForm: (item) => ({
      judul: item.judul,
      isi: item.isi,
      tanggalMulai: item.tanggalMulai
        ? toDateInputValue(item.tanggalMulai)
        : "",
      tanggalSelesai: item.tanggalSelesai
        ? toDateInputValue(item.tanggalSelesai)
        : "",
      status: item.status,
    }),
    validate: (form, mode) =>
      mode === "add" &&
      (!form.judul || !form.isi || !form.tanggalMulai || !form.tanggalSelesai)
        ? "Semua data wajib diisi!"
        : null,
    guard: () =>
      token ? null : "Anda harus login sebagai admin untuk mengelola pengumuman",
    create: (form) => adminPengumumanApi.addPengumuman(form),
    update: (form, item) => adminPengumumanApi.updatePengumuman(item.id, form),
    remove: (item) => adminPengumumanApi.deletePengumuman(item.id),
    refetch: fetchAllPengumuman,
    messages: {
      created: "Pengumuman berhasil ditambahkan",
      updated: "Pengumuman berhasil diperbarui",
      deleted: "Pengumuman berhasil dihapus",
      saveError: "Terjadi kesalahan saat menyimpan pengumuman.",
      deleteError: "Terjadi kesalahan saat menghapus pengumuman.",
    },
  });

  const handlePreview = (id: number) => {
    const item = pengumumanData.find((item) => item.id === id);
    if (item) {
      setPreviewItem(item);
      setShowPreviewModal(true);
    }
  };

  const handleReactivate = async (id: number) => {
    const ok = await runAction(
      () => {
        const item = pengumumanData.find((item) => item.id === id);
        if (!item) return Promise.resolve();

        const newEndDate = new Date();
        newEndDate.setDate(newEndDate.getDate() + 7);

        return adminPengumumanApi.updatePengumuman(id, {
          judul: item.judul,
          isi: item.isi,
          tanggalMulai: toDateInputValue(new Date()),
          tanggalSelesai: toDateInputValue(newEndDate),
        });
      },
      "Pengumuman berhasil diaktifkan kembali",
      "Terjadi kesalahan saat mengaktifkan kembali pengumuman.",
    );

    if (ok) setShowPreviewModal(false);
  };

  const renderForm = (isEdit: boolean) => {
    const judulId = isEdit ? "edit-judul" : "judul";
    const mulaiId = isEdit ? "edit-tanggalMulai" : "tanggal_mulai";
    const selesaiId = isEdit ? "edit-tanggalSelesai" : "tanggal_selesai";
    const isiId = isEdit ? "edit-isi" : "isi";

    return (
      <AdminFormView
        eyebrow="Manajemen Pengumuman"
        title={isEdit ? "Edit Pengumuman" : "Tambah Pengumuman Baru"}
        description={
          isEdit
            ? "Ubah informasi pengumuman"
            : "Masukkan informasi pengumuman yang akan ditambahkan"
        }
        onBack={isEdit ? editModal.close : addModal.close}
        actions={
          <>
            <button
              type="button"
              onClick={isEdit ? editModal.close : addModal.close}
              className={adminSecondaryButtonClass}
            >
              Batal
            </button>
            <button
              type="button"
              onClick={isEdit ? () => void saveEditedItem() : () => void saveNewItem()}
              className={adminPrimaryButtonClass}
            >
              {isEdit ? "Simpan Perubahan" : "Simpan"}
            </button>
          </>
        }
      >
        <AdminFormSection number={1} title="Informasi Pengumuman">
          <div className="grid gap-4">
            <AdminField label="Judul Pengumuman" htmlFor={judulId} required>
              <AdminInput
                id={judulId}
                type="text"
                value={formData.judul}
                onChange={(event) =>
                  setFormData({ ...formData, judul: event.target.value })
                }
                placeholder="Masukkan judul pengumuman"
              />
            </AdminField>

            <div className="grid gap-4 sm:grid-cols-2">
              <AdminField label="Tanggal Mulai" htmlFor={mulaiId} required>
                <AdminInput
                  id={mulaiId}
                  type="date"
                  value={formData.tanggalMulai}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      tanggalMulai: event.target.value,
                    })
                  }
                />
              </AdminField>

              <AdminField label="Tanggal Berakhir" htmlFor={selesaiId} required>
                <AdminInput
                  id={selesaiId}
                  type="date"
                  value={formData.tanggalSelesai}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      tanggalSelesai: event.target.value,
                    })
                  }
                />
              </AdminField>
            </div>
          </div>
        </AdminFormSection>

        <AdminFormSection number={2} title="Isi Pengumuman">
          <AdminField label="Isi Pengumuman" htmlFor={isiId} required>
            <AdminTextarea
              id={isiId}
              value={formData.isi}
              onChange={(event) =>
                setFormData({ ...formData, isi: event.target.value })
              }
              className="min-h-44"
              placeholder="Isi pengumuman lengkap"
            />
          </AdminField>
        </AdminFormSection>
      </AdminFormView>
    );
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="w-full space-y-6">
        {addModal.isOpen ? (
          renderForm(false)
        ) : editModal.isOpen ? (
          renderForm(true)
        ) : showPreviewModal && previewItem ? (
          <AdminDetailView
            eyebrow="Detail Pengumuman"
            title={previewItem.judul}
            description="Informasi lengkap pengumuman."
            onBack={() => setShowPreviewModal(false)}
            actions={
              previewItem.status === "Kadaluarsa" ? (
                <button
                  type="button"
                  onClick={() => void handleReactivate(previewItem.id)}
                  className={adminPrimaryButtonClass}
                >
                  <FaCheck />
                  Aktifkan Kembali
                </button>
              ) : undefined
            }
          >
            <AdminDetailGrid>
              <AdminDetailItem label="Tanggal Mulai">
                {previewItem.tanggal
                  ? formatDateLong(previewItem.tanggal)
                  : null}
              </AdminDetailItem>
              <AdminDetailItem label="Tanggal Berakhir">
                {previewItem.tanggalBerakhir
                  ? formatDateLong(previewItem.tanggalBerakhir)
                  : null}
              </AdminDetailItem>
              <AdminDetailItem label="Status">
                <AdminStatusBadge
                  label={previewItem.status}
                  tone={
                    previewItem.status === "Aktif" ? "success" : "neutral"
                  }
                />
              </AdminDetailItem>
            </AdminDetailGrid>

            <section className="mt-6 border-t border-border pt-6">
              <h2 className="mb-2 text-sm font-semibold text-on-surface">
                Isi Pengumuman
              </h2>
              <div className="whitespace-pre-line text-sm leading-relaxed text-on-surface-variant">
                {previewItem.isi}
              </div>
            </section>
          </AdminDetailView>
        ) : (
          <>
            <AdminPageHeader
              eyebrow="Manajemen Konten"
              title="Manajemen Pengumuman"
              description="Kelola pengumuman dan informasi penting desa."
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <AdminMetricCard
                label="Total Pengumuman"
                value={pengumumanData.length}
                icon={<FaBullhorn />}
                hint="Pengumuman tersimpan"
              />
              <AdminMetricCard
                label="Pengumuman Aktif"
                value={countAktif}
                icon={<FaCheck />}
                tone="success"
                hint="Pengumuman aktif"
              />
              <AdminMetricCard
                label="Pengumuman Kadaluarsa"
                value={countKadaluarsa}
                icon={<FaClock />}
                tone="neutral"
                hint="Pengumuman kadaluarsa"
              />
            </div>

            <AdminToolbar>
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <AdminFilterTabs<string>
                  tabs={[
                    {
                      value: "semua",
                      label: "Semua Pengumuman",
                      count: pengumumanData.length,
                    },
                    { value: "aktif", label: "Aktif", count: countAktif },
                    {
                      value: "kadaluarsa",
                      label: "Kadaluarsa",
                      count: countKadaluarsa,
                    },
                  ]}
                  value={activeTab}
                  onChange={setActiveTab}
                />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <AdminSearchInput
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Cari pengumuman..."
                    className="sm:w-72"
                  />
                  <button
                    type="button"
                    onClick={handleAdd}
                    className={adminPrimaryButtonClass}
                  >
                    <FaPlus />
                    Tambah Pengumuman
                  </button>
                </div>
              </div>
            </AdminToolbar>

            <AdminTableShell
              loading={isLoading}
              error={error}
              onRetry={() => void fetchAllPengumuman()}
              empty={filteredData.length === 0}
              emptyLabel="Tidak ada data pengumuman yang ditemukan."
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] text-left">
                  <thead className="bg-surface-container-low text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-6 py-3 font-medium">ID</th>
                      <th className="px-3 py-3 font-medium">Judul</th>
                      <th className="px-3 py-3 font-medium">Tanggal Mulai</th>
                      <th className="px-3 py-3 font-medium">Tanggal Selesai</th>
                      <th className="px-3 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 text-right font-medium">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredData.map((pengumuman) => (
                      <tr
                        key={pengumuman.id}
                        className="transition-colors hover:bg-surface-container-low"
                      >
                        <td className="px-6 py-4 text-sm text-on-surface-variant">
                          {pengumuman.id}
                        </td>
                        <td className="px-3 py-4 text-sm font-medium text-on-surface">
                          {pengumuman.judul}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-on-surface-variant">
                          {formatDateShort(pengumuman.tanggalMulai)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-on-surface-variant">
                          {formatDateShort(pengumuman.tanggalSelesai)}
                        </td>
                        <td className="px-3 py-4">
                          <AdminStatusBadge
                            label={pengumuman.status}
                            tone={
                              pengumuman.status === "Aktif"
                                ? "success"
                                : "neutral"
                            }
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handlePreview(pengumuman.id)}
                              aria-label={`Lihat detail ${pengumuman.judul}`}
                              title="Lihat Detail"
                              className="rounded-xl p-2 text-primary transition-colors hover:bg-primary-fixed"
                            >
                              <FaEye />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEdit(pengumuman.id)}
                              aria-label={`Edit ${pengumuman.judul}`}
                              title="Edit"
                              className="rounded-xl p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
                            >
                              <FaEdit />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(pengumuman.id)}
                              aria-label={`Hapus ${pengumuman.judul}`}
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
        title="Hapus pengumuman?"
        description={`Apakah Anda yakin ingin menghapus pengumuman "${currentItem?.judul}"? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={() => void confirmDelete()}
        onCancel={deleteModal.close}
      />
    </div>
  );
};

export default PengumumanAdmin;
