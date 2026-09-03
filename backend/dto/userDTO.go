package dto

import (
	"time"
)

type (
	UpdateProfileRequestDTO struct {
		Nama     *string `json:"nama"`
		Password *string `json:"password"`
	}

	AddUserRequestDTO struct {
		Nama     string `json:"nama" binding:"required"`
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=8"`
	}

	ResetPasswordRequestDTO struct {
		Email string `json:"email" binding:"required,email"`
	}

	TransferSuperadminRequestDTO struct {
		ToID int `json:"to_id" binding:"required"`
	}

	UserResponseDTO struct {
		ID        int        `json:"id"`
		Nama      string     `json:"nama"`
		Email     string     `json:"email"`
		Role      string     `json:"role"`
		LastLogin *time.Time `json:"last_login"`
	}
)
