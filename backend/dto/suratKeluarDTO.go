package dto

import (
	"time"
)

type (
	SuratKeluarCreateRequestDTO struct {
		NomorSurat   string `json:"nomorSurat" binding:"required" example:"005/DIS/IX/2026"`
		Penerima     string `json:"penerima" binding:"required" example:"Dinas Pendidikan"`
		Perihal      string `json:"perihal" example:"Undangan Rapat"`
		TanggalKirim string `json:"tanggalKirim" binding:"required" example:"2026-09-03"`
		IDLogCetak   *int   `json:"id_log_cetak" example:"1"`
		File         string `json:"-" example:"surat/123_undangan.pdf.enc"`
	}

	SuratKeluarUpdateRequestDTO struct {
		NomorSurat   *string `json:"nomorSurat" example:"005/DIS/IX/2026"`
		Penerima     *string `json:"penerima" example:"Dinas Pendidikan"`
		Perihal      *string `json:"perihal" example:"Undangan Rapat"`
		TanggalKirim *string `json:"tanggalKirim" example:"2026-09-03"`
		IDLogCetak   *int    `json:"id_log_cetak" example:"1"`
		File         *string `json:"-" example:"surat/123_undangan.pdf.enc"`
		DeleteFile   bool    `json:"deleteFile"`
	}

	SuratKeluarResponseDTO struct {
		ID           int       `json:"id" example:"1"`
		NomorSurat   string    `json:"nomorSurat" example:"005/DIS/IX/2026"`
		Penerima     string    `json:"penerima" example:"Dinas Pendidikan"`
		Perihal      *string   `json:"perihal"`
		TanggalKirim time.Time `json:"tanggalKirim"`
		File         string    `json:"file" example:"surat/123_undangan.pdf.enc"`
		HasFile      bool      `json:"has_file"`
		IDLogCetak   *int      `json:"id_log_cetak" example:"1"`
		CreatedAt    time.Time `json:"created_at"`
		UpdatedAt    time.Time `json:"updated_at"`
	}
)
