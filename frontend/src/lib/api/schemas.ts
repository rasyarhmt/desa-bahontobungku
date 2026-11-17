import { z } from "zod";

// ============================================================================
// Envelope API umum + error
// ============================================================================

export const EnvelopeSchema = z.object({
  code: z.number(),
  message: z.string(),
  data: z.unknown().optional(),
});
export type Envelope<T = unknown> = z.infer<typeof EnvelopeSchema> & {
  data?: T;
};

export const AnyDataSchema = z.unknown();

// ============================================================================
// Auth
// ============================================================================

export const RefreshTokensSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string().optional(),
});
export type RefreshTokens = z.infer<typeof RefreshTokensSchema>;

export const AuthUserSchema = z.object({
  id: z.number(),
  nama: z.string(),
  email: z.string(),
  role: z.enum(["superadmin", "admin"]).catch("admin"),
});
export type AuthUser = z.infer<typeof AuthUserSchema>;

export const LoginResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string().optional(),
  user: AuthUserSchema.optional(),
});
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

// ============================================================================
// Pelayanan & cetak surat
// ============================================================================

export const PelayananSchema = z.object({
  id: z.number(),
  nama_layanan: z.string(),
  deskripsi: z.string(),
  id_surat_template: z.number().nullable(),
  status: z.string(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type Pelayanan = z.infer<typeof PelayananSchema>;
export const PelayananListSchema = z.array(PelayananSchema);

export const AjukanSuratRequestSchema = z.object({
  nama_pemohon: z.string(),
  nik_pemohon: z.string(),
  data: z.record(z.string(), z.string()).optional(),
});
export type AjukanSuratRequest = z.infer<typeof AjukanSuratRequestSchema>;

export const AjukanSuratSchema = z.object({
  id: z.number(),
  kode_unik: z.string(),
  nama_pemohon: z.string(),
  status: z.string(),
  file_url: z.string(),
  qr_url: z.string(),
  created_at: z.string().optional(),
});
export type AjukanSuratResponse = z.infer<typeof AjukanSuratSchema>;

export const TemplateFieldTipeSchema = z.enum([
  "text",
  "textarea",
  "date",
  "number",
  "select",
]);

export const TemplateFieldSchema = z.object({
  key: z.string(),
  label: z.string(),
  tipe: TemplateFieldTipeSchema,
  options: z
    .array(z.string())
    .nullish()
    .transform((v) => v ?? []),
  required: z
    .boolean()
    .nullish()
    .transform((v) => v ?? true),
  urutan: z
    .number()
    .nullish()
    .transform((v) => v ?? 0),
});
export type TemplateField = z.infer<typeof TemplateFieldSchema>;
export const TemplateFieldsSchema = z.array(TemplateFieldSchema);

export const TemplateFieldUpdateSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  tipe: TemplateFieldTipeSchema,
  options: z.array(z.string()),
  required: z.boolean().optional(),
  urutan: z.number(),
});
export type TemplateFieldUpdate = z.infer<typeof TemplateFieldUpdateSchema>;

export const TemplateFieldsUpdateSchema = z.object({
  fields: z.array(TemplateFieldUpdateSchema),
});

export const LogCetakVerifikasiSchema = z.object({
  status: z.enum(["dicetak", "diresmikan"]).catch("dicetak"),
  nomor_surat: z.string().nullable(),
  nama_pemohon: z.string(),
  dicetak_pada: z.string(),
});
export type LogCetakVerifikasi = z.infer<typeof LogCetakVerifikasiSchema>;

export const LogCetakSuratSchema = z.object({
  id: z.number(),
  kode_unik: z.string(),
  id_template: z.number().nullable().optional(),
  id_pelayanan: z.number().nullable().optional(),
  nama_template: z.string().nullable().optional(),
  nama_layanan: z.string().nullable().optional(),
  nama_pemohon: z.string(),
  nik_pemohon: z.string().optional(),
  file: z.string().nullable().optional(),
  nomor_surat: z.string().nullable().optional(),
  status: z.enum(["dicetak", "diresmikan"]).catch("dicetak"),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type LogCetakSurat = z.infer<typeof LogCetakSuratSchema>;
export const LogCetakSuratListSchema = z.array(LogCetakSuratSchema);

// ============================================================================
// Pengumuman
// ============================================================================

export const PengumumanSchema = z.object({
  id: z.number(),
  judul: z.string(),
  isi: z.string(),
  tanggal_mulai: z.string(),
  tanggal_selesai: z.string(),
  status: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type Pengumuman = z.infer<typeof PengumumanSchema>;
export const PengumumanListSchema = z.array(PengumumanSchema);

// ============================================================================
// Berita
// ============================================================================

export const BeritaSchema = z.object({
  id: z.number(),
  foto: z.string().default(""),
  has_foto: z.boolean().optional(),
  judul: z.string(),
  isi: z.string(),
  tanggal_terbit: z.string().nullable().optional(),
  penulis: z.string().optional(),
  status: z.string(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
});
export type Berita = z.infer<typeof BeritaSchema>;
export const BeritaListSchema = z.array(BeritaSchema);

// ============================================================================
// Media
// ============================================================================

export const MediaSchema = z.object({
  id: z.number(),
  nama: z.string(),
  tipe: z.string(),
  deskripsi: z.string().optional(),
  file: z.string().default(""),
  thumbnail: z.string().nullable().optional(),
  has_thumb: z.boolean().optional(),
  created_at: z.string(),
  updated_at: z.string().optional(),
});
export type Media = z.infer<typeof MediaSchema>;
export const MediaListSchema = z.array(MediaSchema);

// ============================================================================
// Aparatur
// ============================================================================

export const AparaturSchema = z.object({
  id: z.number(),
  nama: z.string(),
  jabatan: z.string().optional(),
  peran: z.string().optional(),
  foto: z.string().nullable().optional(),
  status: z.string().optional(),
  telepon: z.string().nullable().optional(),
  nip: z.string().nullable().optional(),
  nik: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
});
export type Aparatur = z.infer<typeof AparaturSchema>;
export const AparaturListSchema = z.array(AparaturSchema);

// ============================================================================
// Statistik penduduk
// ============================================================================

export const StatsTotalSchema = z.object({
  total: z.number(),
});
export type StatsTotal = z.infer<typeof StatsTotalSchema>;

/** Item kategori statistik (agama/umur) — bentuk backend variatif, di-passthrough. */
export const StatsCategorySchema = z.array(
  z
    .object({
      label: z.union([z.string(), z.number()]).optional(),
      nama: z.string().optional(),
      kategori: z.string().optional(),
      agama: z.string().optional(),
      rentang: z.string().optional(),
      title: z.string().optional(),
      color: z.string().optional(),
      jumlah: z.number().optional(),
      count: z.number().optional(),
      total: z.number().optional(),
    })
    .passthrough(),
);
export type StatsCategory = z.infer<typeof StatsCategorySchema>;

// ============================================================================
// APBDes / dana
// ============================================================================

export const DanaMasukSchema = z
  .object({
    id: z.number(),
    tahun: z.number(),
    bulan: z.number().optional(),
    sumber: z.string().optional(),
    keterangan: z.string().optional(),
    jumlah: z.number().optional(),
    created_at: z.string().nullable().optional(),
    updated_at: z.string().nullable().optional(),
  })
  .passthrough();
export type DanaMasuk = z.infer<typeof DanaMasukSchema>;
export const DanaMasukListSchema = z.array(DanaMasukSchema);

export const DanaKeluarSchema = z
  .object({
    id: z.number(),
    tahun: z.number(),
    bulan: z.number().optional(),
    kategori: z.string().optional(),
    keterangan: z.string().optional(),
    jumlah: z.number().optional(),
    created_at: z.string().nullable().optional(),
    updated_at: z.string().nullable().optional(),
  })
  .passthrough();
export type DanaKeluar = z.infer<typeof DanaKeluarSchema>;
export const DanaKeluarListSchema = z.array(DanaKeluarSchema);

export const APBDesMonthlySchema = z
  .object({
    bulan: z.union([z.number(), z.string()]),
    total: z.number(),
  })
  .passthrough();
export type APBDesMonthly = z.infer<typeof APBDesMonthlySchema>;

export const APBDesDetailSchema = z.object({
  pendapatan: z.array(APBDesMonthlySchema),
  pengeluaran: z.array(APBDesMonthlySchema),
});
export type APBDesDetail = z.infer<typeof APBDesDetailSchema>;

export const APBDesSummarySchema = z.array(
  z
    .object({
      tipe: z.string(),
      total: z.number().optional(),
    })
    .passthrough(),
);
export type APBDesSummary = z.infer<typeof APBDesSummarySchema>;

// ============================================================================
// Admin: user, surat masuk/keluar, template surat, penduduk
// ============================================================================

export const AdminUserSchema = z
  .object({
    id: z.number(),
    nama: z.string(),
    email: z.string(),
    role: z.string().optional(),
    created_at: z.string().nullable().optional(),
    updated_at: z.string().nullable().optional(),
  })
  .passthrough();
export type AdminUser = z.infer<typeof AdminUserSchema>;
export const AdminUserListSchema = z.array(AdminUserSchema);

export const SuratMasukSchema = z
  .object({
    id: z.number(),
    nomorSurat: z.string().nullable().optional(),
    perihal: z.string().nullable().optional(),
    pengirim: z.string().nullable().optional(),
    tanggalTerima: z.string().nullable().optional(),
    file: z.string().nullable().optional(),
    has_file: z.boolean().optional(),
    created_at: z.string().nullable().optional(),
  })
  .passthrough();
export type SuratMasuk = z.infer<typeof SuratMasukSchema>;
export const SuratMasukListSchema = z.array(SuratMasukSchema);

export const SuratKeluarSchema = z
  .object({
    id: z.number(),
    nomorSurat: z.string().nullable().optional(),
    perihal: z.string().nullable().optional(),
    penerima: z.string().nullable().optional(),
    tanggalKirim: z.string().nullable().optional(),
    file: z.string().nullable().optional(),
    has_file: z.boolean().optional(),
    created_at: z.string().nullable().optional(),
  })
  .passthrough();
export type SuratKeluar = z.infer<typeof SuratKeluarSchema>;
export const SuratKeluarListSchema = z.array(SuratKeluarSchema);

export const SuratTemplateSchema = z
  .object({
    id: z.number(),
    kode: z.string().optional(),
    nama_template: z.string().optional(),
    deskripsi: z.string().nullable().optional(),
    file_template: z.string().nullable().optional(),
    status: z.string().optional(),
    created_at: z.string().nullable().optional(),
    updated_at: z.string().nullable().optional(),
  })
  .passthrough();
export type SuratTemplate = z.infer<typeof SuratTemplateSchema>;
export const SuratTemplateListSchema = z.array(SuratTemplateSchema);

export const PendudukMemberSchema = z
  .object({
    id: z.number(),
    nik: z.string(),
    nama: z.string(),
    alamat: z.string().nullable().optional(),
    tanggal_lahir: z.string().nullable().optional(),
    tempat_lahir: z.string().nullable().optional(),
    nomor_kk: z.string().nullable().optional(),
    jenis_kelamin: z.string().nullable().optional(),
    agama: z.string().nullable().optional(),
    pekerjaan: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
    status_nama: z.string().nullable().optional(),
    id_status_keluarga: z.number().nullable().optional(),
    id_kepalakeluarga: z.number().nullable().optional(),
    nama_kepalakeluarga: z.string().nullable().optional(),
  })
  .passthrough();
export type PendudukMember = z.infer<typeof PendudukMemberSchema>;
export const PendudukMemberListSchema = z.array(PendudukMemberSchema);

export const StatusKeluargaSchema = z.object({
  id: z.number(),
  nama: z.string(),
  is_active: z.boolean(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type StatusKeluarga = z.infer<typeof StatusKeluargaSchema>;
export const StatusKeluargaListSchema = z.array(StatusKeluargaSchema);
