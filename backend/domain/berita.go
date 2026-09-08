package domain

import (
	"context"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/rasyarhmt/desa-bahontobungku/dto"
)

const (
	BeritaStatusDraft       = "draft"
	BeritaStatusDipublikasi = "dipublikasi"
)

type Berita struct {
	ID            int
	Foto          string
	Judul         string
	Isi           string
	TanggalTerbit time.Time
	Penulis       string
	Status        string
	CreatedAt     time.Time
	UpdatedAt     time.Time
}

type (
	BeritaRepository interface {
		Create(ctx context.Context, b *Berita) error
		GetAll(ctx context.Context) ([]Berita, error)
		GetPublished(ctx context.Context) ([]Berita, error)
		GetByID(ctx context.Context, id int) (*Berita, error)
		Update(ctx context.Context, id int, b *Berita) error
		Delete(ctx context.Context, id int) (bool, error)
	}

	BeritaUsecase interface {
		Create(ctx context.Context, req dto.BeritaCreateRequestDTO) (*dto.BeritaResponseDTO, error)
		GetAll(ctx context.Context) ([]dto.BeritaResponseDTO, error)
		GetAllAdmin(ctx context.Context) ([]dto.BeritaResponseDTO, error)
		GetByStatus(ctx context.Context, status string) ([]dto.BeritaResponseDTO, error)
		GetByID(ctx context.Context, id int) (*dto.BeritaResponseDTO, error)
		GetByIDAdmin(ctx context.Context, id int) (*dto.BeritaResponseDTO, error)
		Update(ctx context.Context, id int, req dto.BeritaUpdateRequestDTO) error
		ToggleStatus(ctx context.Context, id int) (*dto.BeritaResponseDTO, error)
		Delete(ctx context.Context, id int) error
	}

	BeritaHandler interface {
		Create(c *gin.Context)
		GetAll(c *gin.Context)
		GetByStatus(c *gin.Context)
		GetByID(c *gin.Context)
		GetAllAdmin(c *gin.Context)
		GetByIDAdmin(c *gin.Context)
		Update(c *gin.Context)
		ToggleStatus(c *gin.Context)
		Delete(c *gin.Context)
	}
)
