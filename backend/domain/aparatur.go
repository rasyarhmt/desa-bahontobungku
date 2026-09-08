package domain

import (
	"context"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/rasyarhmt/desa-bahontobungku/dto"
)

type Aparatur struct {
	ID        int
	Nama      string
	Nip       string
	Jabatan   string
	Telepon   string
	Foto      string
	CreatedAt time.Time
	UpdatedAt time.Time
}

type (
	AparaturRepository interface {
		Create(ctx context.Context, a *Aparatur) error
		GetAll(ctx context.Context) ([]Aparatur, error)
		GetByID(ctx context.Context, id int) (*Aparatur, error)
		GetByNIP(ctx context.Context, nip string) (*Aparatur, error)
		Update(ctx context.Context, id int, a *Aparatur) error
		Delete(ctx context.Context, id int) (bool, error)
	}

	AparaturUsecase interface {
		Create(ctx context.Context, req dto.AparaturCreateRequestDTO) (*dto.AparaturResponseDTO, error)
		GetAll(ctx context.Context) ([]dto.AparaturResponseDTO, error)
		GetByID(ctx context.Context, id int) (*dto.AparaturResponseDTO, error)
		GetByNIP(ctx context.Context, nip string) (*dto.AparaturResponseDTO, error)
		Update(ctx context.Context, id int, req dto.AparaturUpdateRequestDTO) error
		Delete(ctx context.Context, id int) error
	}

	AparaturHandler interface {
		Create(c *gin.Context)
		GetAll(c *gin.Context)
		GetByID(c *gin.Context)
		GetByNIP(c *gin.Context)
		Update(c *gin.Context)
		Delete(c *gin.Context)
	}
)
