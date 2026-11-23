import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  FaBan,
  FaCheck,
  FaEdit,
  FaEye,
  FaFileSignature,
  FaLink,
  FaPlus,
  FaSyncAlt,
  FaTrash,
} from "react-icons/fa";

import AdminTablePagination from "@/components/admin/AdminTablePagination";
import {
  AdminField,
  AdminFilterTabs,
  AdminFormSection,
  AdminFormView,
  AdminInput,
  AdminMetricCard,
  AdminPageHeader,
  AdminSelect,
  AdminStatusBadge,
  AdminTableShell,
  AdminTextarea,
  AdminToolbar,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "@/components/admin/admin-ui";
import BuatSuratModal from "@/components/admin/BuatSuratModal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import TemplateDetailView from "@/components/admin/TemplateDetailView";
import { type Pelayanan, type SuratTemplate } from "@/lib/api/schemas";
import { adminPelayananApi, adminTemplateApi } from "@/lib/api/admin";
import { useAsyncData, useCrudResource, useTablePagination } from "@/hooks";

interface PelayananFormData {
  nama_layanan: string;
  deskripsi: string;
  id_surat_template: number | null;
}

interface PelayananFormViewProps {
  isEdit: boolean;
  formData: PelayananFormData;
  setFormData: Dispatch<SetStateAction<PelayananFormData>>;
  templates: SuratTemplate[];
  isLoading: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

const thClass =
  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground";
const tdClass = "px-4 py-3.5 text-sm text-on-surface-variant";
const iconButtonClass =
  "rounded-xl p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-60";

function PelayananFormView({
  isEdit,
  formData,
  setFormData,
  templates,
  isLoading,
  onSubmit,
  onCancel,
}: PelayananFormViewProps) {
  return (
    <AdminFormView
      eyebrow="Manajemen Pelayanan"
      title={isEdit ? "Edit Layanan" : "Tambah Layanan Baru"}
      description={
        isEdit
          ? "Perbarui informasi layanan administrasi desa."
          : "Masukkan informasi layanan yang akan ditambahkan."
      }
      onBack={onCancel}
    >
      <AdminFormSection
        number={1}
        title="Informasi Layanan"
        description="Nama layanan dan penjelasan singkat untuk warga."
      >
        <div className="grid gap-4">
          <AdminField
            label="Nama Layanan"
            htmlFor={isEdit ? "edit-nama_layanan" : "nama_layanan"}
            required
          >
            <AdminInput
              id={isEdit ? "edit-nama_layanan" : "nama_layanan"}
              type="text"
              value={formData.nama_layanan}
              onChange={(e) =>
                setFormData({ ...formData, nama_layanan: e.target.value })
              }
              placeholder="Nama layanan"
            />
          </AdminField>
          <AdminField
            label="Deskripsi"
            htmlFor={isEdit ? "edit-deskripsi" : "deskripsi"}
            required
          >
            <AdminTextarea
              id={isEdit ? "edit-deskripsi" : "deskripsi"}
              value={formData.deskripsi}
              onChange={(e) =>
                setFormData({ ...formData, deskripsi: e.target.value })
              }
              placeholder="Deskripsi singkat layanan"
              rows={3}
            />
          </AdminField>
        </div>
      </AdminFormSection>

      <AdminFormSection
        number={2}
        title="Template Surat"
        description="Template yang dipakai saat warga mencetak surat melalui layanan ini."
      >
        <AdminField
          label="Template Surat (opsional)"
          htmlFor={isEdit ? "edit-id_surat_template" : "add-id_surat_template"}
          hint={
            isEdit
              ? "Kosongkan jika ingin mempertahankan template saat ini"
              : "Template yang digunakan saat warga mencetak surat lewat layanan ini"
          }
        >
          <AdminSelect
            id={isEdit ? "edit-id_surat_template" : "add-id_surat_template"}
            value={formData.id_surat_template || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                id_surat_template: e.target.value
                  ? Number(e.target.value)
                  : null,
              })
            }
          >
            <option value="">Tidak ada template</option>
            {templates.length > 0 ? (
              templates.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.kode} - {tpl.nama_template}
                </option>
              ))
            ) : (
              <option value="" disabled>
                Belum ada template surat
              </option>
            )}
          </AdminSelect>
        </AdminField>
      </AdminFormSection>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isLoading}
          className={adminPrimaryButtonClass}
        >
          {isEdit ? "Simpan Perubahan" : "Simpan"}
        </button>
      </div>
    </AdminFormView>
  );
}

const PelayananAdmin = () => {
  const [activeTab, setActiveTab] = useState("semua");
  const [selectedPelayananForSurat, setSelectedPelayananForSurat] =
    useState<Pelayanan | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<SuratTemplate | null>(
    null,
  );

  const { data: templates } = useAsyncData<SuratTemplate[]>(async () => {
    const data = await adminTemplateApi.getAllTemplates();
    return Array.isArray(data) ? data : [];
  }, []);

  const getTemplateName = (id: number) => {
    if (!id) return "-";
    const tpl = templates.find((t) => Number(t.id) === Number(id));
    return tpl ? tpl.nama_template : `ID ${id}`;
  };

  const handlePreviewTemplate = (id: number) => {
    const tpl = templates.find((t) => Number(t.id) === Number(id));
    if (tpl) setPreviewTemplate(tpl);
  };

  const {
    data: layananData,
    isLoading,
    error,
    refetch: fetchPelayananData,
  } = useAsyncData<Pelayanan[]>(
    async () => {
      const data = await adminPelayananApi.getAllPelayanan();
      return Array.isArray(data) ? data : [];
    },
    [],
    {
      errorMessage: "Gagal memuat data pelayanan. Silakan coba lagi nanti.",
    },
  );

  const filteredData =
    activeTab === "semua"
      ? layananData
      : layananData.filter((item) => item.status === activeTab);

  const {
    page,
    setPage,
    pageSize,
    setPageSize,
    pageItems,
    totalItems,
    totalPages,
  } = useTablePagination(filteredData, {
    resetKey: activeTab,
  });

  const countAktif = layananData.filter(
    (item) => item.status === "aktif",
  ).length;
  const countNonaktif = layananData.filter(
    (item) => item.status !== "aktif",
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
    runAction,
  } = useCrudResource<Pelayanan, PelayananFormData>({
    items: layananData,
    initialForm: {
      nama_layanan: "",
      deskripsi: "",
      id_surat_template: null,
    },
    toForm: (item) => ({
      nama_layanan: item.nama_layanan,
      deskripsi: item.deskripsi,
      id_surat_template: item.id_surat_template || null,
    }),
    validate: (form) =>
      !form.nama_layanan || !form.deskripsi
        ? "Nama layanan dan deskripsi wajib diisi!"
        : null,
    create: (form) => adminPelayananApi.addPelayanan(form),
    update: (form, item) => adminPelayananApi.updatePelayanan(item.id, form),
    remove: (item) => adminPelayananApi.deletePelayanan(item.id),
    refetch: fetchPelayananData,
    messages: {
      created: "Layanan berhasil ditambahkan",
      updated: "Layanan berhasil diperbarui",
      deleted: "Layanan berhasil dihapus",
      saveError: "Terjadi kesalahan saat menyimpan pelayanan.",
      deleteError: "Terjadi kesalahan saat menghapus pelayanan.",
    },
  });

  const handleToggleStatus = (id: number) =>
    runAction(
      () => adminPelayananApi.toggleStatus(id),
      "Status layanan berhasil diubah",
      "Terjadi kesalahan saat mengubah status layanan.",
    );

  const isFormOpen = addModal.isOpen || editModal.isOpen;

  return (
    <div className="min-h-screen bg-surface">
      <div className="w-full space-y-6">
        {isFormOpen ? (
          <PelayananFormView
            isEdit={editModal.isOpen}
            formData={formData}
            setFormData={setFormData}
            templates={templates}
            isLoading={isActionLoading}
            onSubmit={() =>
              void (addModal.isOpen ? saveNewItem() : saveEditedItem())
            }
            onCancel={() =>
              addModal.isOpen ? addModal.close() : editModal.close()
            }
          />
        ) : previewTemplate ? (
          <TemplateDetailView
            item={previewTemplate}
            onBack={() => setPreviewTemplate(null)}
          />
        ) : (
          <>
            <AdminPageHeader
              eyebrow="Manajemen Pelayanan"
              title="Manajemen Pelayanan"
              description="Kelola layanan administrasi desa yang tersedia untuk warga."
              actions={
                <button
                  type="button"
                  onClick={() => void fetchPelayananData()}
                  className={adminSecondaryButtonClass}
                >
                  <FaSyncAlt />
                  Muat Ulang
                </button>
              }
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <AdminMetricCard
                label="Total Layanan"
                value={layananData.length}
                icon={<FaLink />}
                tone="primary"
                hint="Jenis layanan tersedia"
              />
              <AdminMetricCard
                label="Layanan Aktif"
                value={countAktif}
                icon={<FaCheck />}
                tone="info"
                hint="Layanan yang aktif"
              />
              <AdminMetricCard
                label="Layanan Nonaktif"
                value={countNonaktif}
                icon={<FaBan />}
                tone="neutral"
                hint="Layanan yang dinonaktifkan"
              />
            </div>

            <AdminToolbar>
              <AdminFilterTabs
                tabs={[
                  {
                    value: "semua",
                    label: "Semua Layanan",
                    count: layananData.length,
                  },
                  { value: "aktif", label: "Aktif", count: countAktif },
                  { value: "nonaktif", label: "Nonaktif", count: countNonaktif },
                ]}
                value={activeTab}
                onChange={setActiveTab}
              />
            </AdminToolbar>

            <AdminTableShell
              loading={isLoading}
              error={error}
              onRetry={() => void fetchPelayananData()}
              empty={filteredData.length === 0}
              emptyLabel="Tidak ada data layanan yang ditemukan."
              footer={
                <AdminTablePagination
                  page={page}
                  pageSize={pageSize}
                  totalItems={totalItems}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                  label="layanan"
                />
              }
            >
              <div className="flex flex-col gap-4 border-b border-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-on-surface">
                    Daftar Layanan
                  </h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Kelola layanan administrasi desa yang tersedia untuk warga
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAdd}
                  className={adminPrimaryButtonClass}
                >
                  <FaPlus />
                  Tambah Layanan
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-surface-container-low">
                      <th className={thClass}>ID</th>
                      <th className={thClass}>Nama Layanan</th>
                      <th className={thClass}>Deskripsi</th>
                      <th className={thClass}>Template Surat</th>
                      <th className={thClass}>Status</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {pageItems.map((item) => (
                      <tr
                        key={item.id}
                        className="transition-colors hover:bg-surface-container-low/60"
                      >
                        <td className={tdClass}>{item.id}</td>
                        <td className={`${tdClass} font-medium text-on-surface`}>
                          {item.nama_layanan}
                        </td>
                        <td className={`${tdClass} max-w-xs`}>
                          {item.deskripsi}
                        </td>
                        <td className={tdClass}>
                          {item.id_surat_template ? (
                            <button
                              type="button"
                              onClick={() =>
                                handlePreviewTemplate(item.id_surat_template!)
                              }
                              className="rounded-lg bg-primary-fixed px-2 py-1 text-xs font-medium text-on-primary-fixed transition-colors hover:bg-primary-fixed-dim"
                              title="Lihat Template Surat"
                            >
                              {getTemplateName(item.id_surat_template)}
                            </button>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className={tdClass}>
                          <AdminStatusBadge
                            label={item.status === "aktif" ? "Aktif" : "Nonaktif"}
                            tone={item.status === "aktif" ? "primary" : "neutral"}
                          />
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex justify-end gap-1">
                            {item.status === "aktif" &&
                              item.id_surat_template && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedPelayananForSurat(item)
                                  }
                                  className={iconButtonClass}
                                  title="Buatkan Surat untuk Warga"
                                  aria-label={`Buat surat untuk ${item.nama_layanan}`}
                                >
                                  <FaFileSignature className="text-primary" />
                                </button>
                              )}
                            {item.id_surat_template && (
                              <button
                                type="button"
                                onClick={() =>
                                  handlePreviewTemplate(item.id_surat_template!)
                                }
                                className={iconButtonClass}
                                title="Lihat Template Surat"
                                aria-label={`Lihat template surat ${item.nama_layanan}`}
                              >
                                <FaEye className="text-primary" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleEdit(item.id)}
                              className={iconButtonClass}
                              title="Edit"
                              aria-label={`Edit layanan ${item.nama_layanan}`}
                            >
                              <FaEdit />
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleToggleStatus(item.id)}
                              className={iconButtonClass}
                              title={
                                item.status === "aktif"
                                  ? "Nonaktifkan"
                                  : "Aktifkan"
                              }
                              aria-label={`Ubah status layanan ${item.nama_layanan}`}
                              disabled={isActionLoading}
                            >
                              <FaBan className="text-[var(--warning-fg)]" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(item.id)}
                              className="rounded-xl p-2 text-on-surface-variant transition-colors hover:bg-destructive/10 hover:text-destructive"
                              title="Hapus"
                              aria-label={`Hapus layanan ${item.nama_layanan}`}
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
        title="Hapus layanan?"
        description={`Layanan "${currentItem?.nama_layanan ?? ""}" akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`}
        isLoading={isActionLoading}
        onConfirm={() => void confirmDelete()}
        onCancel={deleteModal.close}
      />

      <BuatSuratModal
        isOpen={!!selectedPelayananForSurat}
        onClose={() => setSelectedPelayananForSurat(null)}
        pelayanan={selectedPelayananForSurat}
      />
    </div>
  );
};

export default PelayananAdmin;
