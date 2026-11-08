import { useState } from "react";
import {
  FaMoneyBillWave,
  FaMoneyCheckAlt,
  FaChartPie,
  FaCalendarAlt,
  FaSpinner,
  FaExclamationTriangle,
} from "react-icons/fa";
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
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
        <span className="ml-2">Memuat data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <FaExclamationTriangle className="text-4xl text-yellow-500 mx-auto mb-4" />
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div
      className="space-y-8 bg-gray-50 min-h-screen"
      style={{ fontFamily: "poppins" }}
    >
      <div className="w-full mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Manajemen APBDes</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-gray-500" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab("summary")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                activeTab === "summary"
                  ? "bg-blue-500 text-white font-medium shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FaChartPie
                className={
                  activeTab === "summary" ? "text-white" : "text-blue-500"
                }
              />
              <span>Ringkasan</span>
            </button>
            <button
              onClick={() => setActiveTab("income")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                activeTab === "income"
                  ? "bg-green-500 text-white font-medium shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FaMoneyBillWave
                className={
                  activeTab === "income" ? "text-white" : "text-green-500"
                }
              />
              <span>Pendapatan</span>
            </button>
            <button
              onClick={() => setActiveTab("expense")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                activeTab === "expense"
                  ? "bg-red-500 text-white font-medium shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FaMoneyCheckAlt
                className={
                  activeTab === "expense" ? "text-white" : "text-red-500"
                }
              />
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
