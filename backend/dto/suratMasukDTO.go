package dto

import (
	"time"
)

type (
	SuratMasukCreateRequestDTO struct {
		NomorSurat    string `json:"nomorSurat" binding:"required" example:"005/DIS/IX/2026"`
		Pengirim      string `json:"pengirim" binding:"required" example:"Dinas Pendidikan"`
		Perihal       string `json:"perihal" example:"Undangan Rapat"`
		TanggalTerima string `json:"tanggalTerima" binding:"required" example:"2026-09-03"`
		File          string `json:"-" example:"surat/123_undangan.pdf.enc"`
	}

	SuratMasukUpdateRequestDTO struct {
		NomorSurat    *string `json:"nomorSurat" example:"005/DIS/IX/2026"`
		Pengirim      *string `json:"pengirim" example:"Dinas Pendidikan"`
		Perihal       *string `json:"perihal" example:"Undangan Rapat"`
		TanggalTerima *string `json:"tanggalTerima" example:"2026-09-03"`
		File          *string `json:"-" example:"surat/123_undangan.pdf.enc"`
		DeleteFile    bool    `json:"deleteFile"`
	}

	SuratMasukResponseDTO struct {
		ID            int       `json:"id" example:"1"`
		NomorSurat    string    `json:"nomorSurat" example:"005/DIS/IX/2026"`
		Pengirim      string    `json:"pengirim" example:"Dinas Pendidikan"`
		Perihal       *string   `json:"perihal"`
		TanggalTerima time.Time `json:"tanggalTerima"`
		File          string    `json:"file" example:"surat/123_undangan.pdf.enc"`
		HasFile       bool      `json:"has_file"`
		CreatedAt     time.Time `json:"created_at"`
		UpdatedAt     time.Time `json:"updated_at"`
	}
)
