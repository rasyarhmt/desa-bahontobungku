package dto

import (
	"time"
)

type (
	AjukanSuratRequestDTO struct {
		NamaPemohon string         `json:"nama_pemohon" binding:"required" example:"Rasya"`
		NikPemohon  string         `json:"nik_pemohon" binding:"required" example:"7371010101010001"`
		Data        map[string]any `json:"data"`
	}

	ResmikanSuratRequestDTO struct {
		NomorSurat string `json:"nomor_surat" binding:"required" example:"470/001/SK/2026"`
	}

	AjukanSuratResponseDTO struct {
		ID          int       `json:"id" example:"1"`
		KodeUnik    string    `json:"kode_unik" example:"A1B2C3D4E5"`
		NamaPemohon string    `json:"nama_pemohon" example:"Rasya"`
		Status      string    `json:"status" example:"dicetak"`
		FileURL     string    `json:"file_url" example:"/api/v1/log-cetak-surat/surat/A1B2C3D4E5/file"`
		QRURL       string    `json:"qr_url" example:"/api/v1/log-cetak-surat/verifikasi/A1B2C3D4E5/qr"`
		CreatedAt   time.Time `json:"created_at"`
	}

	LogCetakSuratResponseDTO struct {
		ID           int       `json:"id" example:"1"`
		KodeUnik     string    `json:"kode_unik" example:"A1B2C3D4E5"`
		IDTemplate   *int      `json:"id_template" example:"1"`
		IDPelayanan  *int      `json:"id_pelayanan" example:"1"`
		NamaTemplate string    `json:"nama_template" example:"Surat Keterangan Domisili"`
		NamaLayanan  string    `json:"nama_layanan" example:"Surat Keterangan Domisili"`
		NamaPemohon  string    `json:"nama_pemohon" example:"Rasya"`
		NikPemohon   string    `json:"nik_pemohon" example:"7371010101010001"`
		NomorSurat   *string   `json:"nomor_surat" example:"470/001/SK/2026"`
		File         string    `json:"file" example:"surat/1725377400_A1B2C3D4E5.pdf.enc"`
		Status       string    `json:"status" example:"dicetak"`
		CreatedAt    time.Time `json:"created_at"`
		UpdatedAt    time.Time `json:"updated_at"`
	}

	LogCetakSuratVerifikasiDTO struct {
		KodeUnik    string    `json:"kode_unik" example:"A1B2C3D4E5"`
		Status      string    `json:"status" example:"diresmikan"`
		NomorSurat  *string   `json:"nomor_surat" example:"470/001/SK/2026"`
		NamaPemohon string    `json:"nama_pemohon" example:"Rasya"`
		DicetakPada time.Time `json:"dicetak_pada"`
	}
)
