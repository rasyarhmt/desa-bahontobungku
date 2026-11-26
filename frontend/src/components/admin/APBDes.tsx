import { useState } from "react";
import { FaCalendarAlt } from "react-icons/fa";

import ConfirmDialog from "@/components/admin/ConfirmDialog";
import AdminTablePagination from "@/components/admin/AdminTablePagination";
import {
  AdminFilterTabs,
  AdminPageHeader,
  AdminSelect,
  AdminTableShell,
  AdminToolbar,
} from "@/components/admin/admin-ui";
import { adminApbdesApi } from "@/lib/api/admin";
import { getErrorMessage } from "@/lib/errors";
import { useAsyncData, useTablePagination } from "@/hooks";
import DanaForm from "./DanaForm";
import ApbdesSummaryCards from "./ApbdesSummaryCards";
import ApbdesCharts from "./ApbdesCharts";
import DanaMasukTable from "./DanaMasukTable";
import DanaKeluarTable from "./DanaKeluarTable";
import type {
  DanaMasukFormPayload,
  DanaKeluarFormPayload,
  DanaMasukDisplay,
  DanaKeluarDisplay,
} from "./apbdesShared";
import { toast } from "@/lib/toast";

type DanaType = "masuk" | "keluar";
type ApbdesTab = "summary" | "income" | "expense";

export default function APBDes() {
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString(),
  );
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [editingItem, setEditingItem] = useState<
    DanaMasukDisplay | DanaKeluarDisplay | null
  >(null);
  const [formType, setFormType] = useState<DanaType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    type: DanaType;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<ApbdesTab>("summary");

  const {
    data,
    isLoading,
    error,
    refetch: fetchData,
  } = useAsyncData<{ masuk: DanaMasukDisplay[]; keluar: DanaKeluarDisplay[] }>(
    async () => {
      const [masukData, keluarData] = await Promise.all([
        adminApbdesApi.getAllDanaMasuk(),
        adminApbdesApi.getAllDanaKeluar(),
      ]);

      const masuk = masukData.map((item) => ({
        id: item.id,
        tahun: item.tahun,
        bulan: item.bulan,
        jumlah: item.jumlah,
        sumber: typeof item.sumber === "string" ? item.sumber : "",
        keterangan: typeof item.keterangan === "string" ? item.keterangan : "",
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));

      const keluar = keluarData.map((item) => ({
        id: item.id,
        tahun: item.tahun,
        bulan: item.bulan,
        jumlah: item.jumlah,
        kategori: typeof item.kategori === "string" ? item.kategori : "",
        keterangan: typeof item.keterangan === "string" ? item.keterangan : "",
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));

      const years = new Set<number>();
      masukData.forEach((item) => years.add(item.tahun));
      keluarData.forEach((item) => years.add(item.tahun));

      const yearsArray = Array.from(years).sort((a, b) => b - a);
      setAvailableYears(yearsArray);

      if (yearsArray.length > 0) {
        setSelectedYear(yearsArray[0].toString());
      } else {
        setSelectedYear(new Date().getFullYear().toString());
      }

      return { masuk, keluar };
    },
    { masuk: [], keluar: [] },
    { errorMessage: "Gagal memuat data. Silakan coba lagi nanti." },
  );

  const danaMasuk = data.masuk;
  const danaKeluar = data.keluar;

  const filteredDanaMasuk = danaMasuk.filter(
    (item) => item.tahun.toString() === selectedYear,
  );
  const filteredDanaKeluar = danaKeluar.filter(
    (item) => item.tahun.toString() === selectedYear,
  );

  const {
    page: masukPage,
    setPage: setMasukPage,
    pageSize: masukPageSize,
    setPageSize: setMasukPageSize,
    pageItems: masukPageItems,
    totalItems: masukTotalItems,
    totalPages: masukTotalPages,
  } = useTablePagination(filteredDanaMasuk, {
    resetKey: `${selectedYear}|${activeTab}`,
  });

  const {
    page: keluarPage,
    setPage: setKeluarPage,
    pageSize: keluarPageSize,
    setPageSize: setKeluarPageSize,
    pageItems: keluarPageItems,
    totalItems: keluarTotalItems,
    totalPages: keluarTotalPages,
  } = useTablePagination(filteredDanaKeluar, {
    resetKey: `${selectedYear}|${activeTab}`,
  });

  const totalPendapatan = filteredDanaMasuk.reduce(
    (sum, item) => sum + Number.parseInt(String(item.jumlah ?? 0)),
    0,
  );
  const totalPengeluaran = filteredDanaKeluar.reduce(
    (sum, item) => sum + Number.parseInt(String(item.jumlah ?? 0)),
    0,
  );
  const saldo = totalPendapatan - totalPengeluaran;

  const closeForm = () => {
    setFormType(null);
    setEditingItem(null);
  };

  const handleAddDanaMasuk = async (formData: DanaMasukFormPayload) => {
    try {
      await adminApbdesApi.addDanaMasuk(formData);
      closeForm();
      fetchData();
    } catch (error) {
      console.error("Error adding dana masuk:", error);
      toast.error(
        getErrorMessage(error, "Terjadi kesalahan saat menyimpan data"),
      );
    }
  };

  const handleUpdateDanaMasuk = async (
    id: number,
    formData: DanaMasukFormPayload,
  ) => {
    try {
      await adminApbdesApi.updateDanaMasuk(id, formData);
      closeForm();
      fetchData();
    } catch (error) {
      console.error("Error updating dana masuk:", error);
      toast.error(
        getErrorMessage(error, "Terjadi kesalahan saat memperbarui data"),
      );
    }
  };

  const handleAddDanaKeluar = async (formData: DanaKeluarFormPayload) => {
    try {
      await adminApbdesApi.addDanaKeluar(formData);
      closeForm();
      fetchData();
    } catch (error) {
      console.error("Error adding dana keluar:", error);
      toast.error(
        getErrorMessage(error, "Terjadi kesalahan saat menyimpan data"),
      );
    }
  };

  const handleUpdateDanaKeluar = async (
    id: number,
    formData: DanaKeluarFormPayload,
  ) => {
    try {
      await adminApbdesApi.updateDanaKeluar(id, formData);
      closeForm();
      fetchData();
    } catch (error) {
      console.error("Error updating dana keluar:", error);
      toast.error(
        getErrorMessage(error, "Terjadi kesalahan saat memperbarui data"),
      );
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { id, type } = deleteTarget;

    try {
      if (type === "masuk") {
        await adminApbdesApi.deleteDanaMasuk(id);
      } else {
        await adminApbdesApi.deleteDanaKeluar(id);
      }
      fetchData();
    } catch (error) {
      console.error(
        `Error deleting dana ${type}:`,
        error,
      );
      toast.error(
        getErrorMessage(error, "Terjadi kesalahan saat menghapus data"),
      );
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleEditDanaMasuk = (item: DanaMasukDisplay) => {
    setEditingItem(item);
    setFormType("masuk");
  };

  const handleEditDanaKeluar = (item: DanaKeluarDisplay) => {
    setEditingItem(item);
    setFormType("keluar");
  };

  const openForm = (type: DanaType) => {
    setEditingItem(null);
    setFormType(type);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <AdminTableShell loading>
          <div />
        </AdminTableShell>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <AdminTableShell error={error} onRetry={() => void fetchData()}>
          <div />
        </AdminTableShell>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Keuangan Desa"
        title="Manajemen APBDes"
        description="Pantau pendapatan, pengeluaran, dan saldo anggaran desa."
        actions={
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-muted-foreground" />
            <AdminSelect
              aria-label="Tahun anggaran"
              value={selectedYear}
              onChange={(event) => setSelectedYear(event.target.value)}
              className="w-36"
            >
              {availableYears.length > 0 ? (
                availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))
              ) : (
                <option value={new Date().getFullYear()}>
                  {new Date().getFullYear()}
                </option>
              )}
            </AdminSelect>
          </div>
        }
        onAdd={() => openForm(activeTab === "expense" ? "keluar" : "masuk")}
        addLabel={
          activeTab === "expense" ? "Tambah Pengeluaran" : "Tambah Pendapatan"
        }
      />

      <AdminToolbar>
        <AdminFilterTabs
          tabs={[
            { value: "summary", label: "Ringkasan" },
            { value: "income", label: "Pendapatan" },
            { value: "expense", label: "Pengeluaran" },
          ]}
          value={activeTab}
          onChange={setActiveTab}
        />
      </AdminToolbar>

      {formType === "masuk" && (
        <DanaForm
          mode="masuk"
          onSubmit={
            editingItem
              ? (formData) =>
                  handleUpdateDanaMasuk(editingItem.id, formData)
              : handleAddDanaMasuk
          }
          onCancel={closeForm}
          initialData={editingItem as DanaMasukDisplay | null}
          isEditing={Boolean(editingItem)}
        />
      )}

      {formType === "keluar" && (
        <DanaForm
          mode="keluar"
          onSubmit={
            editingItem
              ? (formData) =>
                  handleUpdateDanaKeluar(editingItem.id, formData)
              : handleAddDanaKeluar
          }
          onCancel={closeForm}
          initialData={editingItem as DanaKeluarDisplay | null}
          isEditing={Boolean(editingItem)}
        />
      )}

      {!formType && (
        <>
          {activeTab === "summary" && (
            <div className="space-y-6">
              <ApbdesSummaryCards
                totalPendapatan={totalPendapatan}
                totalPengeluaran={totalPengeluaran}
                saldo={saldo}
                selectedYear={selectedYear}
              />
              <ApbdesCharts
                totalPendapatan={totalPendapatan}
                totalPengeluaran={totalPengeluaran}
                filteredDanaMasuk={filteredDanaMasuk}
                filteredDanaKeluar={filteredDanaKeluar}
              />
            </div>
          )}

          {activeTab === "income" && (
            <DanaMasukTable
              items={masukPageItems}
              totalPendapatan={totalPendapatan}
              selectedYear={selectedYear}
              onEdit={handleEditDanaMasuk}
              onDelete={(id) => setDeleteTarget({ id, type: "masuk" })}
              footer={
                <AdminTablePagination
                  page={masukPage}
                  pageSize={masukPageSize}
                  totalItems={masukTotalItems}
                  totalPages={masukTotalPages}
                  onPageChange={setMasukPage}
                  onPageSizeChange={setMasukPageSize}
                  label="pendapatan"
                />
              }
            />
          )}

          {activeTab === "expense" && (
            <DanaKeluarTable
              items={keluarPageItems}
              totalPengeluaran={totalPengeluaran}
              selectedYear={selectedYear}
              onEdit={handleEditDanaKeluar}
              onDelete={(id) => setDeleteTarget({ id, type: "keluar" })}
              footer={
                <AdminTablePagination
                  page={keluarPage}
                  pageSize={keluarPageSize}
                  totalItems={keluarTotalItems}
                  totalPages={keluarTotalPages}
                  onPageChange={setKeluarPage}
                  onPageSizeChange={setKeluarPageSize}
                  label="pengeluaran"
                />
              }
            />
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Hapus Data APBDes"
        description="Apakah Anda yakin ingin menghapus data ini?"
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
