package domain

import (
	"context"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/rasyarhmt/desa-bahontobungku/dto"
)

type Pengumuman struct {
	ID             int
	Judul          string
	Isi            string
	TanggalMulai   time.Time
	TanggalSelesai time.Time
	CreatedAt      time.Time
	UpdatedAt      time.Time
}

type (
	PengumumanRepository interface {
		Create(ctx context.Context, p *Pengumuman) error
		GetAll(ctx context.Context) ([]Pengumuman, error)
		GetByID(ctx context.Context, id int) (*Pengumuman, error)
		Update(ctx context.Context, id int, p *Pengumuman) error
		Delete(ctx context.Context, id int) (bool, error)
	}

	PengumumanUsecase interface {
		Create(ctx context.Context, req dto.PengumumanCreateRequestDTO) (*dto.PengumumanResponseDTO, error)
		GetAll(ctx context.Context) ([]dto.PengumumanResponseDTO, error)
		GetByID(ctx context.Context, id int) (*dto.PengumumanResponseDTO, error)
		Update(ctx context.Context, id int, req dto.PengumumanUpdateRequestDTO) error
		Delete(ctx context.Context, id int) error
	}

	PengumumanHandler interface {
		Create(c *gin.Context)
		GetAll(c *gin.Context)
		GetByID(c *gin.Context)
		Update(c *gin.Context)
		Delete(c *gin.Context)
	}
)
