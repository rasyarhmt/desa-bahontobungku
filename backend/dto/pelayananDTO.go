package dto

import (
	"time"
)

type (
	PelayananCreateRequestDTO struct {
		NamaLayanan     string `json:"nama_layanan" binding:"required" example:"Surat Keterangan Domisili"`
		Deskripsi       string `json:"deskripsi" binding:"required" example:"Layanan pembuatan surat keterangan domisili"`
		IDSuratTemplate int    `json:"id_surat_template" example:"1"`
		Status          string `json:"status" example:"aktif"`
	}

	PelayananUpdateRequestDTO struct {
		NamaLayanan     *string `json:"nama_layanan" example:"Surat Keterangan Domisili"`
		Deskripsi       *string `json:"deskripsi" example:"Deskripsi baru"`
		IDSuratTemplate *int    `json:"id_surat_template" example:"1"`
	}

	PelayananResponseDTO struct {
		ID              int       `json:"id" example:"1"`
		NamaLayanan     string    `json:"nama_layanan" example:"Surat Keterangan Domisili"`
		Deskripsi       string    `json:"deskripsi"`
		IDSuratTemplate int       `json:"id_surat_template" example:"1"`
		Status          string    `json:"status" example:"aktif"`
		CreatedAt       time.Time `json:"created_at"`
		UpdatedAt       time.Time `json:"updated_at"`
	}
)
