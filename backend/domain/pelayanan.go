package domain

import (
	"context"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/rasyarhmt/desa-bahontobungku/dto"
)

const (
	PelayananStatusAktif    = "aktif"
	PelayananStatusNonaktif = "nonaktif"
)

type Pelayanan struct {
	ID              int
	NamaLayanan     string
	Deskripsi       string
	IDSuratTemplate *int
	Status          string
	CreatedAt       time.Time
	UpdatedAt       time.Time
}

type (
	PelayananRepository interface {
		Create(ctx context.Context, p *Pelayanan) (int, error)
		GetAll(ctx context.Context) ([]Pelayanan, error)
		GetByID(ctx context.Context, id int) (*Pelayanan, error)
		Update(ctx context.Context, id int, p *Pelayanan) error
		Delete(ctx context.Context, id int) (bool, error)
		UpdateStatus(ctx context.Context, id int, status string) error
	}

	PelayananUsecase interface {
		Create(ctx context.Context, req dto.PelayananCreateRequestDTO) error
		GetAll(ctx context.Context) ([]dto.PelayananResponseDTO, error)
		GetByID(ctx context.Context, id int) (*dto.PelayananResponseDTO, error)
		GetTemplateFields(ctx context.Context, id int) ([]string, error)
		Update(ctx context.Context, id int, req dto.PelayananUpdateRequestDTO) error
		Delete(ctx context.Context, id int) error
		ToggleStatus(ctx context.Context, id int) error
	}

	PelayananHandler interface {
		Create(c *gin.Context)
		GetAll(c *gin.Context)
		GetByID(c *gin.Context)
		GetTemplateFields(c *gin.Context)
		Update(c *gin.Context)
		Delete(c *gin.Context)
		ToggleStatus(c *gin.Context)
	}
)
