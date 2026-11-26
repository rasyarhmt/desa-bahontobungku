import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  FaBan,
  FaCheck,
  FaEdit,
  FaEye,
  FaFileAlt,
  FaListUl,
  FaSyncAlt,
  FaTrash,
  FaUpload,
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
  AdminStatusBadge,
  AdminTableShell,
  AdminTextarea,
  AdminToolbar,
  adminPrimaryButtonClass,
} from "@/components/admin/admin-ui";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import TemplateDetailView from "@/components/admin/TemplateDetailView";
import { type SuratTemplate } from "@/lib/api/schemas";
import { adminTemplateApi } from "@/lib/api/admin";
import { useAsyncData, useCrudResource, useTablePagination } from "@/hooks";
import TemplateFieldModal from "./TemplateFieldModal";

interface TemplateFormData {
  kode: string;
  nama_template: string;
  deskripsi: string;
  file_template: File | null;
}

interface TemplateFormViewProps {
  isEdit: boolean;
  formData: TemplateFormData;
  setFormData: Dispatch<SetStateAction<TemplateFormData>>;
  isLoading: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

const thClass =
  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground";
const tdClass = "px-4 py-3.5 text-sm text-on-surface-variant";
const iconButtonClass =
  "rounded-xl p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-60";

function TemplateFormView({
  isEdit,
  formData,
  setFormData,
  isLoading,
  onSubmit,
  onCancel,
}: TemplateFormViewProps) {
  return (
    <AdminFormView
      eyebrow="Manajemen Template Surat"
      title={isEdit ? "Edit Template Surat" : "Tambah Template Surat Baru"}
      description={
        isEdit
          ? "Ubah nama, deskripsi, atau ganti file template."
          : 'Unggah file DOCX template yang berisi placeholder {{ field }}.'
      }
      onBack={onCancel}
    >
      <AdminFormSection
        number={1}
        title="Identitas Template"
        description="Kode dan nama template yang digunakan warga."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField
            label="Kode Template"
            htmlFor="kode"
            required={!isEdit}
            hint={isEdit ? "Kode template tidak dapat diubah" : undefined}
          >
            <AdminInput
              id="kode"
              type="text"
              value={formData.kode}
              onChange={(e) =>
                setFormData({ ...formData, kode: e.target.value })
              }
              disabled={isEdit}
              placeholder="Contoh: SK_DOMISILI"
            />
          </AdminField>
          <AdminField
            label="Nama Template"
            htmlFor="nama_template"
            required
          >
            <AdminInput
              id="nama_template"
              type="text"
              value={formData.nama_template}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  nama_template: e.target.value,
                })
              }
              placeholder="Contoh: Surat Keterangan Domisili"
            />
          </AdminField>
          <div className="sm:col-span-2">
            <AdminField label="Deskripsi" htmlFor="deskripsi">
              <AdminTextarea
                id="deskripsi"
                value={formData.deskripsi}
                onChange={(e) =>
                  setFormData({ ...formData, deskripsi: e.target.value })
                }
                placeholder="Deskripsi singkat template"
                rows={2}
              />
            </AdminField>
          </div>
        </div>
      </AdminFormSection>

      <AdminFormSection
        number={2}
        title="Berkas Template"
        description="File DOCX dengan placeholder yang akan diisi saat pencetakan."
      >
        <AdminField
          label={isEdit ? "Ganti File Template (.docx)" : "File Template (.docx)"}
          htmlFor="file_template"
          hint={
            formData.file_template
              ? `${formData.file_template.name} siap diupload`
              : isEdit
                ? "Kosongkan jika tidak ingin mengganti file"
                : "Format yang diterima: DOCX"
          }
        >
          <AdminInput
            id="file_template"
            type="file"
            accept=".docx"
            onChange={(e) =>
              setFormData({
                ...formData,
                file_template: e.target.files?.[0] || null,
              })
            }
            className="file:mr-4 file:rounded-xl file:border-0 file:bg-primary-fixed file:px-4 file:py-1.5 file:text-xs file:font-semibold file:text-on-primary-fixed hover:file:bg-primary-fixed-dim"
          />
        </AdminField>
      </AdminFormSection>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isLoading}
          className={adminPrimaryButtonClass}
        >
          <FaUpload />
          {isEdit ? "Simpan Perubahan" : "Simpan"}
        </button>
      </div>
    </AdminFormView>
  );
}

const TemplateSuratAdmin = () => {
  const [activeTab, setActiveTab] = useState("semua");
  const [fieldModalTemplate, setFieldModalTemplate] =
    useState<SuratTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<SuratTemplate | null>(
    null,
  );

  const {
    data: templates,
    isLoading,
    error,
    refetch: fetchTemplateData,
  } = useAsyncData<SuratTemplate[]>(
    async () => {
      const data = await adminTemplateApi.getAllTemplates();
      return Array.isArray(data) ? data : [];
    },
    [],
    {
      errorMessage:
        "Gagal memuat data template surat. Silakan coba lagi nanti.",
    },
  );

  const filteredData =
    activeTab === "semua"
      ? templates
      : templates.filter((item) => item.status === activeTab);

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

  const countAktif = templates.filter((item) => item.status === "aktif").length;
  const countNonaktif = templates.filter(
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
  } = useCrudResource<SuratTemplate, TemplateFormData>({
    items: templates,
    initialForm: {
      kode: "",
      nama_template: "",
      deskripsi: "",
      file_template: null,
    },
    toForm: (item) => ({
      kode: item.kode ?? "",
      nama_template: item.nama_template ?? "",
      deskripsi: item.deskripsi || "",
      file_template: null,
    }),
    validate: (form, mode) => {
      if (mode === "add") {
        if (!form.kode || !form.nama_template) {
          return "Kode dan nama template wajib diisi!";
        }
        if (!form.file_template) {
          return "File template DOCX wajib diupload!";
        }
        return null;
      }
      return form.nama_template ? null : "Nama template wajib diisi!";
    },
    create: (form) => {
      const payload = new FormData();
      payload.append("kode", form.kode.trim());
      payload.append("nama_template", form.nama_template.trim());
      payload.append("deskripsi", form.deskripsi || "");
      payload.append("status", "aktif");
      payload.append("file_template", form.file_template!);
      return adminTemplateApi.addTemplate(payload);
    },
    update: (form, item) => {
      const payload = new FormData();
      payload.append("nama_template", form.nama_template.trim());
      if (form.deskripsi) payload.append("deskripsi", form.deskripsi);
      if (form.file_template)
        payload.append("file_template", form.file_template);
      return adminTemplateApi.updateTemplate(item.id, payload);
    },
    remove: (item) => adminTemplateApi.deleteTemplate(item.id),
    refetch: fetchTemplateData,
    messages: {
      created: "Template surat berhasil ditambahkan",
      updated: "Template surat berhasil diperbarui",
      deleted: "Template surat berhasil dihapus",
      saveError: "Terjadi kesalahan saat menyimpan template.",
      deleteError: "Terjadi kesalahan saat menghapus template.",
    },
  });

  const handleToggleStatus = (id: number) =>
    runAction(
      () => adminTemplateApi.toggleStatus(id),
      "Status template berhasil diubah",
      "Terjadi kesalahan saat mengubah status template.",
    );

  const isFormOpen = addModal.isOpen || editModal.isOpen;

  return (
    <div className="min-h-screen bg-surface">
      <div className="w-full space-y-6">
        {isFormOpen ? (
          <TemplateFormView
            isEdit={editModal.isOpen}
            formData={formData}
            setFormData={setFormData}
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
              eyebrow="Manajemen Template Surat"
              title="Manajemen Template Surat"
              description="Kelola template surat yang digunakan warga untuk mencetak surat."
              actions={
                <button
                  type="button"
                  onClick={() => void fetchTemplateData()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-container-lowest px-4 py-2.5 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container"
                >
                  <FaSyncAlt />
                  Muat Ulang
                </button>
              }
              onAdd={handleAdd}
              addLabel="Tambah Template"
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <AdminMetricCard
                label="Total Template"
                value={templates.length}
                icon={<FaFileAlt />}
                tone="primary"
                hint="Jumlah template tersedia"
              />
              <AdminMetricCard
                label="Template Aktif"
                value={countAktif}
                icon={<FaCheck />}
                tone="info"
                hint="Siap digunakan warga"
              />
              <AdminMetricCard
                label="Template Nonaktif"
                value={countNonaktif}
                icon={<FaBan />}
                tone="neutral"
                hint="Template yang nonaktif"
              />
            </div>

            <AdminToolbar>
              <AdminFilterTabs
                tabs={[
                  {
                    value: "semua",
                    label: "Semua Template",
                    count: templates.length,
                  },
                  { value: "aktif", label: "Aktif", count: countAktif },
                  {
                    value: "nonaktif",
                    label: "Nonaktif",
                    count: countNonaktif,
                  },
                ]}
                value={activeTab}
                onChange={setActiveTab}
              />
            </AdminToolbar>

            <AdminTableShell
              loading={isLoading}
              error={error}
              onRetry={() => void fetchTemplateData()}
              empty={filteredData.length === 0}
              emptyLabel="Tidak ada template surat yang ditemukan."
              footer={
                <AdminTablePagination
                  page={page}
                  pageSize={pageSize}
                  totalItems={totalItems}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                  label="template surat"
                />
              }
            >
              <div className="flex flex-col gap-4 border-b border-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-on-surface">
                    Daftar Template
                  </h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Template DOCX dengan placeholder {"{{ field }}"} untuk
                    surat yang dicetak warga
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-surface-container-low">
                      <th className={thClass}>ID</th>
                      <th className={thClass}>Kode</th>
                      <th className={thClass}>Nama Template</th>
                      <th className={thClass}>Deskripsi</th>
                      <th className={thClass}>File</th>
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
                        <td className={tdClass}>
                          <span className="rounded-lg bg-secondary-container px-2 py-1 font-mono text-xs font-medium text-on-secondary-container">
                            {item.kode}
                          </span>
                        </td>
                        <td className={`${tdClass} font-medium text-on-surface`}>
                          {item.nama_template}
                        </td>
                        <td className={`${tdClass} max-w-xs`}>
                          {item.deskripsi || "-"}
                        </td>
                        <td className={tdClass}>
                          {item.file_template
                            ? item.file_template.split("/").pop()
                            : "-"}
                        </td>
                        <td className={tdClass}>
                          <AdminStatusBadge
                            label={item.status === "aktif" ? "Aktif" : "Nonaktif"}
                            tone={item.status === "aktif" ? "primary" : "neutral"}
                          />
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setPreviewTemplate(item)}
                              className={iconButtonClass}
                              title="Lihat Template"
                              aria-label={`Lihat template ${item.nama_template}`}
                            >
                              <FaEye className="text-primary" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setFieldModalTemplate(item)}
                              className={iconButtonClass}
                              title="Atur Field"
                              aria-label={`Atur field template ${item.nama_template}`}
                            >
                              <FaListUl className="text-primary" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEdit(item.id)}
                              className={iconButtonClass}
                              title="Edit"
                              aria-label={`Edit template ${item.nama_template}`}
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
                              aria-label={`Ubah status template ${item.nama_template}`}
                              disabled={isActionLoading}
                            >
                              <FaBan className="text-[var(--warning-fg)]" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(item.id)}
                              className="rounded-xl p-2 text-on-surface-variant transition-colors hover:bg-destructive/10 hover:text-destructive"
                              title="Hapus"
                              aria-label={`Hapus template ${item.nama_template}`}
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
        title="Hapus template surat?"
        description={`Template "${currentItem?.nama_template ?? ""}" akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`}
        isLoading={isActionLoading}
        onConfirm={() => void confirmDelete()}
        onCancel={deleteModal.close}
      />

      {fieldModalTemplate && (
        <TemplateFieldModal
          templateId={fieldModalTemplate.id}
          templateName={fieldModalTemplate.nama_template}
          onClose={() => setFieldModalTemplate(null)}
        />
      )}
    </div>
  );
};

export default TemplateSuratAdmin;
