package dto

import "time"

type (
	MediaCreateRequestDTO struct {
		Nama      string `json:"nama" example:"Gotong Royong Desa"`
		Tipe      string `json:"tipe" example:"foto"`
		Deskripsi string `json:"deskripsi" example:"Kegiatan gotong royong warga desa."`
		File      string `json:"file" example:"media/123_gotong.jpg"`
		Thumbnail string `json:"thumbnail" example:"media/123_thumb.jpg"`
	}

	MediaUpdateRequestDTO struct {
		Nama      *string `json:"nama" example:"Gotong Royong Desa"`
		Tipe      *string `json:"tipe" example:"video"`
		Deskripsi *string `json:"deskripsi" example:"Kegiatan gotong royong warga desa."`
		File      *string `json:"file" example:"media/123_kegiatan.mp4"`
		Thumbnail *string `json:"thumbnail" example:"media/123_thumb.jpg"`
	}

	MediaResponseDTO struct {
		ID        int       `json:"id" example:"1"`
		Nama      string    `json:"nama" example:"Gotong Royong Desa"`
		Tipe      string    `json:"tipe" example:"foto"`
		Deskripsi string    `json:"deskripsi" example:"Kegiatan gotong royong warga desa."`
		File      string    `json:"file" example:"media/123_gotong.jpg"`
		Thumbnail string    `json:"thumbnail" example:"media/123_thumb.jpg"`
		HasThumb  bool      `json:"has_thumb" example:"false"`
		CreatedAt time.Time `json:"created_at"`
		UpdatedAt time.Time `json:"updated_at"`
	}
)
