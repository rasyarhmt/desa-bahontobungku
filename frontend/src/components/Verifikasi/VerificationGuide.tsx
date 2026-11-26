import {
  ArrowRight,
  BadgeCheck,
  QrCode,
  Search,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

const STEPS: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: QrCode,
    title: "Pindai QR pada surat",
    description:
      "QR di dalam surat berisi tautan verifikasi dengan kode unik surat. Memindainya akan membuka halaman ini dengan kode terisi otomatis.",
  },
  {
    icon: Search,
    title: "Atau ambil kode dari berkas",
    description:
      "Jika QR tidak dapat dipindai, lihat nama PDF hasil unduhan berformat surat-KODE.pdf lalu ketik bagian KODE pada formulir.",
  },
  {
    icon: BadgeCheck,
    title: "Periksa hasilnya",
    description:
      "Sistem mencocokkan kode dengan catatan cetak desa, lalu menampilkan status surat, nama pemohon yang disamarkan, nomor surat jika tersedia, dan waktu cetaknya.",
  },
];

export default function VerificationGuide() {
  return (
    <section className="rounded-3xl border border-border bg-surface-container-low p-6 sm:p-8 lg:p-10">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
            Panduan Singkat
          </span>
          <h2 className="mt-1 font-display text-xl font-bold text-on-surface md:text-2xl">
            Bagaimana cara verifikasi?
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
            Kode unik tidak dicetak di dalam surat; kode tersebut tersimpan pada
            QR dan pada nama berkas PDF hasil generate surat.
          </p>
        </div>

        <Link
          to="/Pelayanan"
          className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-surface-container-lowest px-4 py-2 text-xs font-semibold text-primary shadow-sm transition-colors hover:border-primary hover:bg-primary hover:text-on-primary"
        >
          Lihat layanan surat
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-3">
        {STEPS.map(({ icon: Icon, title, description }, index) => (
          <div
            key={title}
            className="flex flex-col rounded-2xl border border-border/70 bg-surface-container-lowest p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>
              <span className="inline-flex size-7 items-center justify-center rounded-full bg-surface-container text-xs font-bold text-on-surface-variant">
                0{index + 1}
              </span>
            </div>
            <h3 className="mt-4 text-sm font-bold text-on-surface">{title}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-on-surface-variant">
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
