package dto

import "time"

type (
	PengumumanCreateRequestDTO struct {
		Judul          string `json:"judul" example:"Informasi Pemadaman Listrik"`
		Isi            string `json:"isi" example:"Listrik akan padam pada hari Selasa pukul 09.00 WITA."`
		TanggalMulai   string `json:"tanggal_mulai" example:"2026-09-05"`
		TanggalSelesai string `json:"tanggal_selesai" example:"2026-09-12"`
	}

	PengumumanUpdateRequestDTO struct {
		Judul          *string `json:"judul" example:"Informasi Pemadaman Listrik"`
		Isi            *string `json:"isi" example:"Listrik akan padam pada hari Selasa pukul 09.00 WITA."`
		TanggalMulai   *string `json:"tanggal_mulai" example:"2026-09-05"`
		TanggalSelesai *string `json:"tanggal_selesai" example:"2026-09-12"`
	}

	PengumumanResponseDTO struct {
		ID             int       `json:"id" example:"1"`
		Judul          string    `json:"judul" example:"Informasi Pemadaman Listrik"`
		Isi            string    `json:"isi" example:"Listrik akan padam pada hari Selasa pukul 09.00 WITA."`
		TanggalMulai   time.Time `json:"tanggal_mulai" example:"2026-09-05T00:00:00Z"`
		TanggalSelesai time.Time `json:"tanggal_selesai" example:"2026-09-12T00:00:00Z"`
		CreatedAt      time.Time `json:"created_at"`
		UpdatedAt      time.Time `json:"updated_at"`
	}
)
