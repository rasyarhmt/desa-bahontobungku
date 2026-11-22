import { aparaturApi, type AparatFormatted } from "@/lib/api/aparatur";
import { beritaApi } from "@/lib/api/berita";
import { pelayananApi } from "@/lib/api/pelayanan";
import { pendudukApi, type PendudukSummary } from "@/lib/api/penduduk";
import type { Berita, Pelayanan } from "@/lib/api/schemas";
import { useAsyncData } from "@/hooks/useAsyncData";

export interface HomeData {
  summary: PendudukSummary;
  berita: Berita[];
  aparatur: AparatFormatted[];
  pelayanan: Pelayanan[];
}

const EMPTY_HOME_DATA: HomeData = {
  summary: {
    totalPenduduk: 0,
    totalKepalaKeluarga: 0,
    totalLakiLaki: 0,
    totalPerempuan: 0,
  },
  berita: [],
  aparatur: [],
  pelayanan: [],
};

export function useHomeData() {
  return useAsyncData<HomeData>(async () => {
    const [summary, berita, aparatur, pelayanan] = await Promise.all([
      pendudukApi.getStatsSummary(),
      beritaApi.getLatestBerita(3),
      aparaturApi.getAllAparat().then(aparaturApi.formatAparatData),
      pelayananApi.getAllPelayanan(),
    ]);

    return { summary, berita, aparatur, pelayanan };
  }, EMPTY_HOME_DATA, {
    errorMessage: "Gagal memuat data halaman desa.",
  });
}
