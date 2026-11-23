import { useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";

import {
  AdminField,
  AdminFormSection,
  AdminFormView,
  AdminInput,
  AdminSelect,
  AdminTextarea,
  adminPrimaryButtonClass,
} from "@/components/admin/admin-ui";

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

  return (
    <AdminFormView
      eyebrow="APBDes"
      title={`${isEditing ? "Edit" : "Tambah"} Data ${title}`}
      description="Isi detail transaksi sesuai dokumen anggaran desa."
      onBack={onCancel}
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        <AdminFormSection number={1} title="Periode Transaksi">
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField label="Tahun" htmlFor="dana-tahun" required>
              <AdminInput
                id="dana-tahun"
                type="number"
                name="tahun"
                value={formData.tahun}
                onChange={handleChange}
                min="2000"
                max="2100"
                required
              />
            </AdminField>
            <AdminField label="Bulan" htmlFor="dana-bulan" required>
              <AdminSelect
                id="dana-bulan"
                name="bulan"
                value={formData.bulan}
                onChange={handleChange}
                required
              >
                {MONTHS.map((month, index) => (
                  <option key={month} value={index + 1}>
                    {month}
                  </option>
                ))}
              </AdminSelect>
            </AdminField>
          </div>
        </AdminFormSection>

        <AdminFormSection
          number={2}
          title="Detail Dana"
          description={`Data ${title.toLowerCase()} yang akan dicatat.`}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField label="Jumlah" htmlFor="dana-jumlah" required>
              <AdminInput
                id="dana-jumlah"
                type="number"
                name="jumlah"
                value={formData.jumlah}
                onChange={handleChange}
                required
                min="0"
              />
            </AdminField>
            <AdminField label={fieldLabel} htmlFor="dana-field" required>
              <AdminInput
                id="dana-field"
                type="text"
                name={fieldName}
                value={fieldValue}
                onChange={handleChange}
                required
              />
            </AdminField>
          </div>
          <div className="mt-4">
            <AdminField label="Keterangan" htmlFor="dana-keterangan" required>
              <AdminTextarea
                id="dana-keterangan"
                name="keterangan"
                value={formData.keterangan}
                onChange={handleChange}
                required
                rows={3}
              />
            </AdminField>
          </div>
        </AdminFormSection>

        <div className="flex justify-end gap-2">
          <button type="submit" className={adminPrimaryButtonClass}>
            {isEditing ? "Update" : "Simpan"}
          </button>
        </div>
      </form>
    </AdminFormView>
  );
};

export default DanaForm;
