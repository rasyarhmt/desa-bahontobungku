import type { DanaMasuk, DanaKeluar } from "@/lib/api/schemas";

export interface DanaMasukFormPayload {
  tahun: number;
  bulan: number;
  jumlah: number;
  sumber: string;
  keterangan: string;
}

export interface DanaKeluarFormPayload {
  tahun: number;
  bulan: number;
  jumlah: number;
  kategori: string;
  keterangan: string;
}

export interface DanaMasukDisplay extends DanaMasuk {
  sumber?: string;
  keterangan?: string;
}

export interface DanaKeluarDisplay extends DanaKeluar {
  kategori?: string;
  keterangan?: string;
}
