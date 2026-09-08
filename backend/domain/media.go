package domain

import (
	"context"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/rasyarhmt/desa-bahontobungku/dto"
)

const (
	MediaTipeFoto    = "foto"
	MediaTipeVideo   = "video"
	MediaTipeDokumen = "dokumen"
)

type Media struct {
	ID        int
	Nama      string
	Tipe      string
	File      string
	Deskripsi string
	Thumbnail string
	CreatedAt time.Time
	UpdatedAt time.Time
}

type (
	MediaRepository interface {
		Create(ctx context.Context, m *Media) error
		GetAll(ctx context.Context) ([]Media, error)
		GetByID(ctx context.Context, id int) (*Media, error)
		Update(ctx context.Context, id int, m *Media) error
		Delete(ctx context.Context, id int) (bool, error)
	}

	MediaUsecase interface {
		Create(ctx context.Context, req dto.MediaCreateRequestDTO) (*dto.MediaResponseDTO, error)
		GetAll(ctx context.Context) ([]dto.MediaResponseDTO, error)
		GetByID(ctx context.Context, id int) (*dto.MediaResponseDTO, error)
		Update(ctx context.Context, id int, req dto.MediaUpdateRequestDTO) error
		Delete(ctx context.Context, id int) error
	}

	MediaHandler interface {
		Create(c *gin.Context)
		GetAll(c *gin.Context)
		GetByID(c *gin.Context)
		Update(c *gin.Context)
		Delete(c *gin.Context)
	}
)
