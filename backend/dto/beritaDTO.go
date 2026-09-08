package dto

import "time"

type (
	BeritaCreateRequestDTO struct {
		Judul         string `json:"judul" example:"Kegiatan Gotong Royong"`
		Isi           string `json:"isi" example:"Warga desa bergotong royong membersihkan lingkungan."`
		TanggalTerbit string `json:"tanggal_terbit" example:"2026-09-05"`
		Penulis       string `json:"penulis" example:"Admin Desa"`
		Foto          string `json:"foto" example:"berita/123_foto.jpg"`
		Status        string `json:"status" example:"dipublikasi"`
	}

	BeritaUpdateRequestDTO struct {
		Judul         *string `json:"judul" example:"Kegiatan Gotong Royong"`
		Isi           *string `json:"isi" example:"Warga desa bergotong royong membersihkan lingkungan."`
		TanggalTerbit *string `json:"tanggal_terbit" example:"2026-09-05"`
		Penulis       *string `json:"penulis" example:"Admin Desa"`
		Foto          *string `json:"foto" example:"berita/123_foto.jpg"`
		DeleteFoto    bool    `json:"delete_foto" example:"false"`
		Status        *string `json:"status" example:"dipublikasi"`
	}

	BeritaResponseDTO struct {
		ID            int       `json:"id" example:"1"`
		Foto          string    `json:"foto" example:"berita/123_foto.jpg"`
		HasFoto       bool      `json:"has_foto" example:"true"`
		Judul         string    `json:"judul" example:"Kegiatan Gotong Royong"`
		Isi           string    `json:"isi" example:"Warga desa bergotong royong membersihkan lingkungan."`
		TanggalTerbit time.Time `json:"tanggal_terbit" example:"2026-09-05T00:00:00Z"`
		Penulis       string    `json:"penulis" example:"Admin Desa"`
		Status        string    `json:"status" example:"dipublikasi"`
		CreatedAt     time.Time `json:"created_at"`
		UpdatedAt     time.Time `json:"updated_at"`
	}
)
