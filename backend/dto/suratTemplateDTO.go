package dto

import (
	"time"
)

type (
	SuratTemplateCreateRequestDTO struct {
		Kode         string `json:"kode" binding:"required" example:"SK_DOMISILI"`
		NamaTemplate string `json:"nama_template" binding:"required" example:"Surat Keterangan Domisili"`
		FileTemplate string `json:"file_template" example:"templates/SK_DOMISILI.docx.enc"`
		Deskripsi    string `json:"deskripsi" example:"Template surat keterangan domisili"`
		Status       string `json:"status" example:"aktif"`
	}

	SuratTemplateUpdateRequestDTO struct {
		Kode         *string `json:"kode" example:"SK_DOMISILI"`
		NamaTemplate *string `json:"nama_template" example:"Surat Keterangan Domisili Baru"`
		FileTemplate *string `json:"file_template" example:"templates/SK_DOMISILI.html.enc"`
		Deskripsi    *string `json:"deskripsi" example:"Deskripsi baru"`
	}

	SuratTemplateResponseDTO struct {
		ID           int       `json:"id" example:"1"`
		Kode         string    `json:"kode" example:"SK_DOMISILI"`
		NamaTemplate string    `json:"nama_template" example:"Surat Keterangan Domisili"`
		FileTemplate string    `json:"file_template" example:"templates/SK_DOMISILI.html.enc"`
		Deskripsi    string    `json:"deskripsi"`
		Status       string    `json:"status" example:"aktif"`
		CreatedAt    time.Time `json:"created_at"`
		UpdatedAt    time.Time `json:"updated_at"`
	}
)
