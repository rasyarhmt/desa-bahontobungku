package domain

import (
	"context"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/rasyarhmt/desa-bahontobungku/dto"
)

const (
	TemplateStatusAktif    = "aktif"
	TemplateStatusNonaktif = "nonaktif"
)

type SuratTemplate struct {
	ID           int
	Kode         string
	NamaTemplate string
	FileTemplate string
	Deskripsi    string
	Status       string
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

type (
	SuratTemplateRepository interface {
		Create(ctx context.Context, t *SuratTemplate) (int, error)
		GetAll(ctx context.Context) ([]SuratTemplate, error)
		GetByID(ctx context.Context, id int) (*SuratTemplate, error)
		GetByKode(ctx context.Context, kode string) (*SuratTemplate, error)
		Update(ctx context.Context, id int, t *SuratTemplate) error
		Delete(ctx context.Context, id int) (bool, error)
		UpdateStatus(ctx context.Context, id int, status string) error
	}

	SuratTemplateUsecase interface {
		Create(ctx context.Context, req dto.SuratTemplateCreateRequestDTO) error
		GetAll(ctx context.Context) ([]dto.SuratTemplateResponseDTO, error)
		GetByID(ctx context.Context, id int) (*dto.SuratTemplateResponseDTO, error)
		Update(ctx context.Context, id int, req dto.SuratTemplateUpdateRequestDTO) error
		Delete(ctx context.Context, id int) error
		ToggleStatus(ctx context.Context, id int) error
	}

	SuratTemplateHandler interface {
		Create(c *gin.Context)
		GetAll(c *gin.Context)
		GetByID(c *gin.Context)
		Update(c *gin.Context)
		Delete(c *gin.Context)
		ToggleStatus(c *gin.Context)
	}
)
