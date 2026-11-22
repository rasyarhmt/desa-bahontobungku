import { aparaturApi } from "@/lib/api/aparatur";
import { pelayananApi } from "@/lib/api/pelayanan";
import type { Pelayanan } from "@/lib/api/schemas";
import type { HomeContact } from "@/content/home";
import { toHomeContact } from "@/content/home";
import { useAsyncData } from "@/hooks/useAsyncData";

export interface PelayananData {
  layanan: Pelayanan[];
  contact?: HomeContact;
}

const EMPTY_DATA: PelayananData = { layanan: [], contact: undefined };

export function usePelayananData() {
  return useAsyncData<PelayananData>(async () => {
    const [layanan, aparatur] = await Promise.all([
      pelayananApi.getAllPelayanan(),
      aparaturApi.getAllAparat().then(aparaturApi.formatAparatData),
    ]);

    return { layanan, contact: toHomeContact(aparatur) };
  }, EMPTY_DATA, {
    errorMessage: "Gagal memuat data layanan desa.",
  });
}
