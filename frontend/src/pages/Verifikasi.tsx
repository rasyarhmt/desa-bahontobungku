import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import VerificationForm from "@/components/Verifikasi/VerificationForm";
import VerificationGuide from "@/components/Verifikasi/VerificationGuide";
import VerificationHero from "@/components/Verifikasi/VerificationHero";
import VerificationResult from "@/components/Verifikasi/VerificationResult";
import HomeFooter from "@/components/home/HomeFooter";
import HomeHeader from "@/components/home/HomeHeader";
import { pelayananApi } from "@/lib/api/pelayanan";
import type { LogCetakVerifikasi } from "@/lib/api/schemas";
import { getErrorMessage } from "@/lib/errors";
import { CONTAINER_CLASS, INNER_SECTION_CLASS } from "@/lib/utils";

export default function Verifikasi() {
  const [searchParams] = useSearchParams();
  const [kode, setKode] = useState(() =>
    (searchParams.get("kode") ?? "").toUpperCase(),
  );
  const [result, setResult] = useState<LogCetakVerifikasi | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoVerified = useRef(false);

  const verify = useCallback(async (kodeUnik: string) => {
    const value = kodeUnik.trim().toUpperCase();
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
      setError(
        getErrorMessage(err, "Terjadi kesalahan saat memverifikasi surat."),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoVerified.current) return;

    const prefilled = searchParams.get("kode");
    if (!prefilled) return;

    autoVerified.current = true;
    setKode(prefilled.toUpperCase());
    void verify(prefilled);
  }, [searchParams, verify]);

  return (
    <div className="home-theme min-h-screen bg-surface font-sans text-on-surface antialiased">
      <HomeHeader />

      <main className="w-full pt-28">
        <VerificationHero />

        <div className={`${INNER_SECTION_CLASS} ${CONTAINER_CLASS}`}>
          <div className="space-y-6">
            <VerificationForm
              kode={kode}
              onKodeChange={setKode}
              onSubmit={() => void verify(kode)}
              loading={loading}
              error={error}
            />

            {result && <VerificationResult result={result} kode={kode} />}

            <VerificationGuide />
          </div>
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}
