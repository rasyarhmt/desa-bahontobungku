package dto

import (
	"time"
)

type (
	UpdateProfileRequestDTO struct {
		Nama     *string `json:"nama" example:"Budi Santoso"`
		Password *string `json:"password" example:"Baru12345!"`
	}

	AddUserRequestDTO struct {
		Nama     string `json:"nama" binding:"required" example:"Budi Santoso"`
		Email    string `json:"email" binding:"required,email" example:"budi@desa.test"`
		Password string `json:"password" binding:"required,min=8" example:"Rahasia123!"`
	}

	ResetPasswordRequestDTO struct {
		Email string `json:"email" binding:"required,email" example:"budi@desa.test"`
	}

	TransferSuperadminRequestDTO struct {
		ToID int `json:"to_id" binding:"required" example:"2"`
	}

	UserResponseDTO struct {
		ID        int        `json:"id" example:"1"`
		Nama      string     `json:"nama" example:"Super Admin"`
		Email     string     `json:"email" example:"admin@desa.test"`
		Role      string     `json:"role" example:"superadmin"`
		LastLogin *time.Time `json:"last_login"`
	}
)
