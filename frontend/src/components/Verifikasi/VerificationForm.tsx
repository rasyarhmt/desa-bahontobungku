import {
  AlertTriangle,
  BadgeCheck,
  Loader2,
  Search,
  ShieldCheck,
} from "lucide-react";

interface VerificationFormProps {
  kode: string;
  onKodeChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
}

export default function VerificationForm({
  kode,
  onKodeChange,
  onSubmit,
  loading,
  error,
}: VerificationFormProps) {
  return (
    <section className="rounded-3xl border border-border bg-surface-container-lowest p-6 shadow-sm sm:p-8 lg:p-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
              Formulir Verifikasi
            </span>
            <h2 className="mt-0.5 font-display text-xl font-bold text-on-surface md:text-2xl">
              Masukkan Kode Unik Surat
            </h2>
          </div>
        </div>
        <span className="hidden rounded-full bg-surface-container px-3.5 py-1.5 text-xs font-medium text-on-surface-variant sm:inline-flex">
          Otomatis huruf kapital
        </span>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
        className="mt-7"
      >
        <label
          htmlFor="kode-verifikasi"
          className="mb-2 block text-xs font-semibold text-on-surface-variant"
        >
          Kode Unik Surat
        </label>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 items-center rounded-2xl border border-border bg-surface-container-low px-4 py-3.5 transition-all focus-within:border-primary focus-within:bg-surface-container-lowest focus-within:ring-2 focus-within:ring-primary/20">
            <Search className="mr-3 size-5 shrink-0 text-outline" />
            <input
              id="kode-verifikasi"
              type="text"
              value={kode}
              onChange={(event) =>
                onKodeChange(event.target.value.toUpperCase())
              }
              placeholder="Contoh: BHB-2026-XXXX"
              autoComplete="off"
              className="w-full bg-transparent font-mono text-sm font-semibold tracking-wider text-on-surface outline-none placeholder:font-sans placeholder:font-normal placeholder:tracking-normal placeholder:text-outline"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !kode.trim()}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-primary px-7 py-3.5 text-sm font-semibold text-on-primary shadow-sm transition-all hover:bg-tertiary-container disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <BadgeCheck className="size-5" />
            )}
            {loading ? "Memverifikasi..." : "Verifikasi Surat"}
          </button>
        </div>

        <p className="mt-2.5 text-xs text-on-surface-variant">
          Kode unik tercetak di bagian bawah surat atau di samping QR Code
          dokumen resmi.
        </p>
      </form>

      {error && (
        <div
          role="alert"
          className="mt-5 flex items-start gap-2.5 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3.5 text-xs leading-relaxed text-destructive"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </section>
  );
}
