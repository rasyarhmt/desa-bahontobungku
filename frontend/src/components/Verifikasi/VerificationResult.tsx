import { BadgeCheck, CalendarDays, Clock3, FileText, QrCode, UserRound, type LucideIcon } from "lucide-react";

import type { LogCetakVerifikasi } from "@/lib/api/schemas";
import { formatDateTime } from "@/lib/format";

interface VerificationResultProps {
  result: LogCetakVerifikasi;
  kode: string;
}

export default function VerificationResult({ result, kode }: VerificationResultProps) {
  const resmikan = result.status === "diresmikan";

  const details: { label: string; value: string; icon: LucideIcon }[] = [
    { label: "Kode yang Dicek", value: kode || "-", icon: QrCode },
    { label: "Nama Pemohon", value: result.nama_pemohon, icon: UserRound },
    { label: "Nomor Surat", value: result.nomor_surat || "-", icon: FileText },
    {
      label: "Dicetak Pada",
      value: formatDateTime(result.dicetak_pada, { month: "long" }),
      icon: CalendarDays,
    },
  ];

  return (
    <section className="space-y-5">
      <div
        className={`relative overflow-hidden rounded-3xl p-8 shadow-md ${
          resmikan ? "bg-primary-fixed/25" : "bg-surface-container-low"
        }`}
      >
        <div className="pointer-events-none absolute -top-20 -right-20 size-64 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span
              className={`flex size-14 shrink-0 items-center justify-center rounded-2xl ${
                resmikan
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-highest text-on-surface-variant"
              }`}
            >
              {resmikan ? (
                <BadgeCheck className="size-7" />
              ) : (
                <Clock3 className="size-7" />
              )}
            </span>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                Hasil Verifikasi
              </span>
              <h2 className="mt-1 font-display text-xl font-bold text-on-surface md:text-2xl">
                {resmikan ? "Surat Diresmikan" : "Surat Terdaftar"}
              </h2>
            </div>
          </div>

          <span
            className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold ${
              resmikan
                ? "bg-primary text-on-primary"
                : "bg-surface-container-high text-on-surface-variant"
            }`}
          >
            {resmikan ? (
              <BadgeCheck className="size-3.5" />
            ) : (
              <Clock3 className="size-3.5" />
            )}
            {resmikan ? "Terverifikasi & Diresmikan" : "Menunggu Resmikan"}
          </span>
        </div>

        <p className="relative z-10 mt-5 max-w-3xl text-sm leading-relaxed text-on-surface-variant">
          {resmikan
            ? "Dokumen ini cocok dengan catatan resmi surat desa dan telah diresmikan oleh perangkat desa."
            : "Dokumen ini ditemukan dalam catatan surat desa, namun belum ditandai sebagai diresmikan."}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {details.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-2xl bg-surface-container-lowest p-5 shadow-sm"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-surface-container text-primary">
              <Icon className="size-5" />
            </span>
            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
                {label}
              </div>
              <div className="mt-0.5 truncate text-sm font-bold text-on-surface">
                {value}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        className={`rounded-2xl px-5 py-4 text-xs leading-relaxed ${
          resmikan
            ? "bg-tertiary-fixed/30 text-on-tertiary-fixed"
            : "bg-surface-container-high text-on-surface-variant"
        }`}
      >
        {resmikan
          ? "Surat ini terverifikasi asli dan dapat digunakan sebagai dokumen resmi."
          : "Surat ini terdaftar namun belum diresmikan. Silakan hubungi kantor desa untuk penyelesaiannya."}
      </div>
    </section>
  );
}
