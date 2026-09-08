package dto

import "time"

type (
	AparaturCreateRequestDTO struct {
		Nama    string `json:"nama" example:"Bapak Kepala Desa"`
		Nip     string `json:"nip" example:"196001011985031001"`
		Jabatan string `json:"jabatan" example:"Kepala Desa"`
		Telepon string `json:"telepon" example:"081234567890"`
		Foto    string `json:"foto" example:"aparatur/123_kades.jpg"`
	}

	AparaturUpdateRequestDTO struct {
		Nama    *string `json:"nama" example:"Bapak Kepala Desa"`
		Nip     *string `json:"nip" example:"196001011985031001"`
		Jabatan *string `json:"jabatan" example:"Kepala Desa"`
		Telepon *string `json:"telepon" example:"081234567890"`
		Foto    *string `json:"foto" example:"aparatur/123_kades.jpg"`
	}

	AparaturResponseDTO struct {
		ID        int       `json:"id" example:"1"`
		Nama      string    `json:"nama" example:"Bapak Kepala Desa"`
		Nip       string    `json:"nip" example:"196001011985031001"`
		Jabatan   string    `json:"jabatan" example:"Kepala Desa"`
		Telepon   string    `json:"telepon" example:"081234567890"`
		Foto      string    `json:"foto" example:"aparatur/123_kades.jpg"`
		HasFoto   bool      `json:"has_foto" example:"true"`
		CreatedAt time.Time `json:"created_at"`
		UpdatedAt time.Time `json:"updated_at"`
	}
)
