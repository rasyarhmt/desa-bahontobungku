import { BadgeCheck, ClipboardList, FileText, QrCode } from "lucide-react";

import { CONTAINER_CLASS } from "@/lib/utils";

const STEPS = [
  {
    icon: ClipboardList,
    title: "Pilih Layanan & Isi Data",
    description:
      "Pilih layanan yang tersedia, lalu lengkapi data pemohon dan kolom formulir yang disediakan.",
  },
  {
    icon: FileText,
    title: "Surat Dibuat Otomatis",
    description:
      "Sistem menghasilkan dokumen surat sesuai template yang terdaftar pada layanan tersebut.",
  },
  {
    icon: QrCode,
    title: "Simpan Kode Unik & QR",
    description:
      "Setiap surat memiliki kode unik dan QR yang bisa disimpan untuk pengecekan keaslian.",
  },
  {
    icon: BadgeCheck,
    title: "Verifikasi Surat",
    description:
      "Gunakan kode unik atau QR pada halaman verifikasi untuk mengecek status dokumen.",
  },
];

export default function ApplicationSteps() {
  return (
    <section className="my-8 w-full bg-surface-container-low py-16">
      <div className={CONTAINER_CLASS}>
        <div className="mx-auto mb-12 max-w-2xl space-y-2 text-center">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            02 / Mekanisme Layanan
          </span>
          <h2 className="font-display text-2xl font-bold text-on-surface md:text-3xl">
            Alur Pengajuan Surat Digital
          </h2>
          <p className="text-sm text-on-surface-variant md:text-base">
            Empat langkah untuk mendapatkan dokumen resmi desa secara digital.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <div
              key={step.title}
              className="relative rounded-2xl bg-surface-container-lowest p-6 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-on-primary shadow-md">
                  <step.icon className="size-6" />
                </div>
                <span className="font-display text-3xl font-bold text-surface-container-high select-none">
                  0{index + 1}
                </span>
              </div>
              <h3 className="mb-2 font-display text-base font-semibold text-on-surface">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-on-surface-variant">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
