import { useState } from "react";
import { Link } from "react-router-dom";
import {
  BadgeCheck,
  Clock3,
  ExternalLink,
  Loader2,
  QrCode,
  Search,
} from "lucide-react";

import { pelayananApi } from "@/lib/api/pelayanan";
import type { LogCetakVerifikasi } from "@/lib/api/schemas";
import { getErrorMessage } from "@/lib/errors";
import { formatDateTime } from "@/lib/format";

export default function VerificationWidget() {
  const [kode, setKode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LogCetakVerifikasi | null>(null);

  const verify = async (event: React.FormEvent) => {
    event.preventDefault();
    const value = kode.trim().toUpperCase();
    if (!value) {
      setError("Kode unik surat wajib diisi.");
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await pelayananApi.verifikasiSurat(value));
    } catch (err) {
      setError(getErrorMessage(err, "Kode surat tidak ditemukan."));
    } finally {
      setLoading(false);
    }
  };

  const resmikan = result?.status === "diresmikan";

  return (
    <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-xl lg:p-8">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <QrCode className="size-6" />
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold text-on-surface">
            Verifikasi Surat
          </h2>
          <p className="text-xs text-on-surface-variant">
            Cek keaslian surat melalui kode unik atau QR
          </p>
        </div>
      </div>

      <form onSubmit={verify} className="space-y-4">
        <div>
          <label
            htmlFor="verification-code"
            className="mb-1.5 block text-xs font-semibold text-on-surface-variant"
          >
            Kode Unik Surat
          </label>
          <div className="flex items-center rounded-xl bg-surface-container px-3.5 py-2.5">
            <Search className="mr-2.5 size-5 text-outline" />
            <input
              id="verification-code"
              value={kode}
              onChange={(event) => setKode(event.target.value.toUpperCase())}
              placeholder="Masukkan kode unik surat"
              className="w-full bg-transparent text-sm text-on-surface placeholder:text-outline focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-on-primary shadow-md transition-colors hover:bg-primary-container disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <BadgeCheck className="size-5" />
          )}
          {loading ? "Memverifikasi..." : "Verifikasi Surat"}
        </button>
      </form>

      {error && (
        <p className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-5 space-y-2 rounded-xl bg-surface-container p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
              Status Dokumen
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                resmikan
                  ? "bg-tertiary-fixed text-on-tertiary-fixed"
                  : "bg-surface-container-high text-on-surface-variant"
              }`}
            >
              {resmikan ? "Terverifikasi & Diresmikan" : "Menunggu Resmikan"}
            </span>
          </div>
          <p className="text-xs leading-relaxed text-on-surface">
            {result.nama_pemohon} • {result.nomor_surat || "Nomor belum ditetapkan"}
          </p>
          <p className="flex items-center gap-1.5 text-[11px] text-on-surface-variant">
            <Clock3 className="size-3.5" />
            Dicetak {formatDateTime(result.dicetak_pada, { month: "long" })}
          </p>
          <Link
            to={`/verifikasi?kode=${encodeURIComponent(kode.trim().toUpperCase())}`}
            className="inline-flex items-center gap-1.5 pt-1 text-xs font-semibold text-primary hover:underline"
          >
            Lihat detail verifikasi
            <ExternalLink className="size-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
