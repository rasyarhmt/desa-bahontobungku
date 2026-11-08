package dto

import (
	"time"
)

type (
	StatusKeluargaCreateRequestDTO struct {
		Nama     string `json:"nama" binding:"required" example:"Keponakan"`
		IsActive *bool  `json:"is_active" example:"true"`
	}

	StatusKeluargaUpdateRequestDTO struct {
		Nama     *string `json:"nama" example:"Keponakan"`
		IsActive *bool   `json:"is_active" example:"false"`
	}

	StatusKeluargaResponseDTO struct {
		ID        int       `json:"id" example:"1"`
		Nama      string    `json:"nama" example:"kepala keluarga"`
		IsActive  bool      `json:"is_active" example:"true"`
		CreatedAt time.Time `json:"created_at"`
		UpdatedAt time.Time `json:"updated_at"`
	}
)
