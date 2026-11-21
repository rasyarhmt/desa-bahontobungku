import { useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Banknote, Wallet, X, Save } from "lucide-react";

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
  const Icon = isMasuk ? Banknote : Wallet;

  const theme = isMasuk
    ? {
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-700",
        ring: "focus:ring-[#0b6393]",
        button: "bg-[#0b6393] hover:bg-[#0a547d]",
      }
    : {
        iconBg: "bg-red-50",
        iconColor: "text-red-700",
        ring: "focus:ring-[#0b6393]",
        button: "bg-[#0b6393] hover:bg-[#0a547d]",
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

  const inputClass = `w-full min-h-11 rounded-xl border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 focus:outline-none focus:ring-2 ${theme.ring}`;
  const fieldPrefix = props.mode;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
     
    >
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`rounded-xl p-2 ${theme.iconBg}`}>
              <Icon
                aria-hidden="true"
                className={`size-5 ${theme.iconColor}`}
              />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">
              {isEditing
                ? `Edit Data ${title}`
                : `Tambah Data ${title}`}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Tutup"
            title="Tutup"
            className="flex size-11 shrink-0 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor={`${fieldPrefix}-tahun`}
              className="mb-1 block text-base font-semibold text-slate-800"
            >
              Tahun
            </label>
            <input
              id={`${fieldPrefix}-tahun`}
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
            <label
              htmlFor={`${fieldPrefix}-bulan`}
              className="mb-1 block text-base font-semibold text-slate-800"
            >
              Bulan
            </label>
            <select
              id={`${fieldPrefix}-bulan`}
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
            <label
              htmlFor={`${fieldPrefix}-jumlah`}
              className="mb-1 block text-base font-semibold text-slate-800"
            >
              Jumlah
            </label>
            <input
              id={`${fieldPrefix}-jumlah`}
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
            <label
              htmlFor={`${fieldPrefix}-${fieldName}`}
              className="mb-1 block text-base font-semibold text-slate-800"
            >
              {fieldLabel}
            </label>
            <input
              id={`${fieldPrefix}-${fieldName}`}
              type="text"
              name={fieldName}
              value={fieldValue}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor={`${fieldPrefix}-keterangan`}
              className="mb-1 block text-base font-semibold text-slate-800"
            >
              Keterangan
            </label>
            <textarea
              id={`${fieldPrefix}-keterangan`}
              name="keterangan"
              value={formData.keterangan}
              onChange={handleChange}
              required
              rows={3}
              className={inputClass}
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex min-h-11 items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-base font-semibold text-slate-700 transition-colors hover:bg-slate-200"
            >
              <X aria-hidden="true" className="size-5" />
              <span>Batal</span>
            </button>
            <button
              type="submit"
              className={`flex min-h-11 items-center gap-2 rounded-xl px-4 py-2 text-base font-semibold text-white transition-colors ${theme.button}`}
            >
              <Save aria-hidden="true" className="size-5" />
              <span>{isEditing ? "Update" : "Simpan"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DanaForm;
