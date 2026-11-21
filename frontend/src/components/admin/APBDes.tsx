import { useState } from "react";
import {
  Banknote,
  Wallet,
  PieChart,
  CalendarDays,
  LoaderCircle,
  TriangleAlert,
} from "lucide-react";
import { adminApbdesApi } from "@/lib/api/admin";
import { getErrorMessage } from "@/lib/errors";
import { useAsyncData, useDisclosure } from "@/hooks";
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

export default function APBDes() {
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [editingItem, setEditingItem] = useState<
    DanaMasukDisplay | DanaKeluarDisplay | null
  >(null);
  const [activeTab, setActiveTab] = useState("summary");

  const { isOpen: showDanaMasukForm, setOpen: setShowDanaMasukForm } =
    useDisclosure();
  const { isOpen: showDanaKeluarForm, setOpen: setShowDanaKeluarForm } =
    useDisclosure();

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
    (item) => item.tahun.toString() === selectedYear
  );
  const filteredDanaKeluar = danaKeluar.filter(
    (item) => item.tahun.toString() === selectedYear
  );

  const totalPendapatan = filteredDanaMasuk.reduce(
    (sum, item) => sum + Number.parseInt(String(item.jumlah ?? 0)),
    0
  );
  const totalPengeluaran = filteredDanaKeluar.reduce(
    (sum, item) => sum + Number.parseInt(String(item.jumlah ?? 0)),
    0
  );
  const saldo = totalPendapatan - totalPengeluaran;

  const handleAddDanaMasuk = async (formData: DanaMasukFormPayload) => {
    try {
      await adminApbdesApi.addDanaMasuk(formData);
      setShowDanaMasukForm(false);
      fetchData();
    } catch (error) {
      console.error("Error adding dana masuk:", error);
      toast.error(
        getErrorMessage(error, "Terjadi kesalahan saat menyimpan data")
      );
    }
  };

  const handleUpdateDanaMasuk = async (
    id: number,
    formData: DanaMasukFormPayload
  ) => {
    try {
      await adminApbdesApi.updateDanaMasuk(id, formData);
      setShowDanaMasukForm(false);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      console.error("Error updating dana masuk:", error);
      toast.error(
        getErrorMessage(error, "Terjadi kesalahan saat memperbarui data")
      );
    }
  };

  const handleDeleteDanaMasuk = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      try {
        await adminApbdesApi.deleteDanaMasuk(id);
        fetchData();
      } catch (error) {
        console.error("Error deleting dana masuk:", error);
        toast.error(
          getErrorMessage(error, "Terjadi kesalahan saat menghapus data")
        );
      }
    }
  };

  const handleAddDanaKeluar = async (formData: DanaKeluarFormPayload) => {
    try {
      await adminApbdesApi.addDanaKeluar(formData);
      setShowDanaKeluarForm(false);
      fetchData();
    } catch (error) {
      console.error("Error adding dana keluar:", error);
      toast.error(
        getErrorMessage(error, "Terjadi kesalahan saat menyimpan data")
      );
    }
  };

  const handleUpdateDanaKeluar = async (
    id: number,
    formData: DanaKeluarFormPayload
  ) => {
    try {
      await adminApbdesApi.updateDanaKeluar(id, formData);
      setShowDanaKeluarForm(false);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      console.error("Error updating dana keluar:", error);
      toast.error(
        getErrorMessage(error, "Terjadi kesalahan saat memperbarui data")
      );
    }
  };

  const handleDeleteDanaKeluar = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      try {
        await adminApbdesApi.deleteDanaKeluar(id);
        fetchData();
      } catch (error) {
        console.error("Error deleting dana keluar:", error);
        toast.error(
          getErrorMessage(error, "Terjadi kesalahan saat menghapus data")
        );
      }
    }
  };

  const handleEditDanaMasuk = (item: DanaMasukDisplay) => {
    setEditingItem(item);
    setShowDanaMasukForm(true);
  };

  const handleEditDanaKeluar = (item: DanaKeluarDisplay) => {
    setEditingItem(item);
    setShowDanaKeluarForm(true);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center text-base text-slate-600">
        <LoaderCircle
          aria-hidden="true"
          className="size-7 animate-spin text-[#0b6393]"
        />
        <span className="ml-3">Memuat data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <TriangleAlert
          aria-hidden="true"
          className="mx-auto mb-4 size-10 text-amber-700"
        />
        <p className="mb-4 text-base text-red-700">{error}</p>
        <button
          type="button"
          onClick={fetchData}
          className="min-h-11 rounded-xl bg-[#0b6393] px-5 py-2 text-base font-semibold text-white transition-colors hover:bg-[#0a547d]"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen space-y-8 bg-[#f6f8fb]"
     
    >
      <div className="mx-auto w-full">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-slate-900">
            Manajemen APBDes
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <CalendarDays aria-hidden="true" className="size-5 text-slate-600" />
              <select
                aria-label="Pilih tahun anggaran"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0b6393]"
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
              </select>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("summary")}
              className={`flex min-h-11 items-center gap-2 rounded-xl px-4 py-2 text-base font-semibold transition-colors ${
                activeTab === "summary"
                  ? "bg-[#0b6393] text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <PieChart aria-hidden="true" className="size-5" />
              <span>Ringkasan</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("income")}
              className={`flex min-h-11 items-center gap-2 rounded-xl px-4 py-2 text-base font-semibold transition-colors ${
                activeTab === "income"
                  ? "bg-[#0b6393] text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Banknote aria-hidden="true" className="size-5" />
              <span>Pendapatan</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("expense")}
              className={`flex min-h-11 items-center gap-2 rounded-xl px-4 py-2 text-base font-semibold transition-colors ${
                activeTab === "expense"
                  ? "bg-[#0b6393] text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Wallet aria-hidden="true" className="size-5" />
              <span>Pengeluaran</span>
            </button>
          </div>
        </div>

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
          <div className="space-y-6">
            <DanaMasukTable
              items={filteredDanaMasuk}
              totalPendapatan={totalPendapatan}
              selectedYear={selectedYear}
              onAdd={() => {
                setEditingItem(null);
                setShowDanaMasukForm(true);
              }}
              onEdit={handleEditDanaMasuk}
              onDelete={handleDeleteDanaMasuk}
            />
          </div>
        )}

        {activeTab === "expense" && (
          <div className="space-y-6">
            <DanaKeluarTable
              items={filteredDanaKeluar}
              totalPengeluaran={totalPengeluaran}
              selectedYear={selectedYear}
              onAdd={() => {
                setEditingItem(null);
                setShowDanaKeluarForm(true);
              }}
              onEdit={handleEditDanaKeluar}
              onDelete={handleDeleteDanaKeluar}
            />
          </div>
        )}

        <div
          className={`${
            showDanaMasukForm || showDanaKeluarForm
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          } transition-opacity duration-300`}
        >
          {showDanaMasukForm && (
            <DanaForm
              mode="masuk"
              onSubmit={
                editingItem
                  ? (formData) =>
                      handleUpdateDanaMasuk(editingItem.id, formData)
                  : handleAddDanaMasuk
              }
              onCancel={() => {
                setShowDanaMasukForm(false);
                setEditingItem(null);
              }}
              initialData={editingItem as DanaMasukDisplay | null}
              isEditing={!!editingItem}
            />
          )}

          {showDanaKeluarForm && (
            <DanaForm
              mode="keluar"
              onSubmit={
                editingItem
                  ? (formData) =>
                      handleUpdateDanaKeluar(editingItem.id, formData)
                  : handleAddDanaKeluar
              }
              onCancel={() => {
                setShowDanaKeluarForm(false);
                setEditingItem(null);
              }}
              initialData={editingItem as DanaKeluarDisplay | null}
              isEditing={!!editingItem}
            />
          )}
        </div>
      </div>
    </div>
  );
}
