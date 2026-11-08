import { useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { FaMoneyBillWave, FaMoneyCheckAlt, FaTimes } from "react-icons/fa";

export interface DanaMasukPayload {
  tahun: number;
  bulan: number;
  jumlah: number;
  sumber: string;
  keterangan: string;
}

export interface DanaKeluarPayload {
  tahun: number;
  bulan: number;
  jumlah: number;
  kategori: string;
  keterangan: string;
}

interface CommonProps {
  onCancel: () => void;
  isEditing: boolean;
}

type DanaFormProps =
  | (CommonProps & {
      mode: "masuk";
      onSubmit: (data: DanaMasukPayload) => void;
      initialData?: {
        tahun?: number;
        bulan?: number;
        jumlah?: number;
        sumber?: string;
        keterangan?: string;
      } | null;
    })
  | (CommonProps & {
      mode: "keluar";
      onSubmit: (data: DanaKeluarPayload) => void;
      initialData?: {
        tahun?: number;
        bulan?: number;
        jumlah?: number;
        kategori?: string;
        keterangan?: string;
      } | null;
    });

const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const DanaForm = (props: DanaFormProps) => {
  const { onCancel, initialData, isEditing } = props;
  const isMasuk = props.mode === "masuk";
  const fieldName = isMasuk ? "sumber" : "kategori";
  const fieldLabel = isMasuk ? "Sumber" : "Kategori";
  const title = isMasuk ? "Pendapatan" : "Pengeluaran";
  const Icon = isMasuk ? FaMoneyBillWave : FaMoneyCheckAlt;

  const theme = isMasuk
    ? {
        iconBg: "bg-green-100",
        iconColor: "text-green-500",
        ring: "focus:ring-green-500",
        button: "bg-green-500 hover:bg-green-600",
      }
    : {
        iconBg: "bg-red-100",
        iconColor: "text-red-500",
        ring: "focus:ring-red-500",
        button: "bg-red-500 hover:bg-red-600",
      };

  const [formData, setFormData] = useState({
    tahun: new Date().getFullYear().toString(),
    bulan: "1",
    jumlah: "",
    keterangan: "",
  });
  const [fieldValue, setFieldValue] = useState("");

  useEffect(() => {
    if (!initialData) return;

    setFormData({
      tahun:
        initialData.tahun?.toString() ?? new Date().getFullYear().toString(),
      bulan: initialData.bulan?.toString() ?? "1",
      jumlah: initialData.jumlah?.toString() ?? "",
      keterangan: initialData.keterangan ?? "",
    });
    if (props.mode === "masuk") {
      setFieldValue(props.initialData?.sumber ?? "");
    } else {
      setFieldValue(props.initialData?.kategori ?? "");
    }
  }, [initialData, props.mode, props.initialData]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === fieldName) {
      setFieldValue(value);
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const base = {
      tahun: Number(formData.tahun),
      bulan: Number(formData.bulan),
      jumlah: Number(formData.jumlah),
      keterangan: formData.keterangan,
    };
    if (props.mode === "masuk") {
      props.onSubmit({ ...base, sumber: fieldValue });
    } else {
      props.onSubmit({ ...base, kategori: fieldValue });
    }
  };

  const inputClass = `w-full border border-gray-300 rounded-lg p-2 focus:ring-2 ${theme.ring} focus:outline-none`;

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm bg-gray-700/30 flex items-center justify-center z-50"
      style={{ fontFamily: "poppins" }}
    >
      <div className="bg-white/95 backdrop-filter rounded-2xl shadow-xl p-6 w-full max-w-md border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`${theme.iconBg} p-2 rounded-lg`}>
              <Icon className={theme.iconColor} size={20} />
            </div>
            <h2 className="font-semibold text-xl text-gray-800">
              {isEditing
                ? `Edit Data ${title}`
                : `Tambah Data ${title}`}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
            title="Tutup"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tahun
            </label>
            <input
              type="number"
              name="tahun"
              value={formData.tahun}
              onChange={handleChange}
              min="2000"
              max="2100"
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bulan
            </label>
            <select
              name="bulan"
              value={formData.bulan}
              onChange={handleChange}
              required
              className={inputClass}
            >
              {MONTHS.map((month, index) => (
                <option key={month} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jumlah
            </label>
            <input
              type="number"
              name="jumlah"
              value={formData.jumlah}
              onChange={handleChange}
              required
              min="0"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {fieldLabel}
            </label>
            <input
              type="text"
              name={fieldName}
              value={fieldValue}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Keterangan
            </label>
            <textarea
              name="keterangan"
              value={formData.keterangan}
              onChange={handleChange}
              required
              rows={3}
              className={inputClass}
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className={`px-4 py-2 ${theme.button} text-white rounded-lg transition-colors`}
            >
              {isEditing ? "Update" : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DanaForm;
