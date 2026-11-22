import { pendudukApi, type PendudukSummary } from "@/lib/api/penduduk";
import { useAsyncData } from "@/hooks/useAsyncData";

const EMPTY_SUMMARY: PendudukSummary = {
  totalPenduduk: 0,
  totalKepalaKeluarga: 0,
  totalLakiLaki: 0,
  totalPerempuan: 0,
};

export function useProfileData() {
  return useAsyncData<PendudukSummary>(
    () => pendudukApi.getStatsSummary(),
    EMPTY_SUMMARY,
    { errorMessage: "Gagal memuat data profil desa." },
  );
}
