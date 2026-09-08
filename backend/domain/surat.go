package domain

import (
	"context"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/rasyarhmt/desa-bahontobungku/dto"
)

type SuratMasuk struct {
	ID            int
	NomorSurat    string
	Pengirim      string
	Perihal       *string
	TanggalTerima time.Time
	File          string
	CreatedAt     time.Time
	UpdatedAt     time.Time
}

type SuratKeluar struct {
	ID           int
	NomorSurat   string
	Penerima     string
	Perihal      *string
	TanggalKirim time.Time
	File         string
	IDLogCetak   *int
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

type (
	SuratMasukRepository interface {
		Create(ctx context.Context, s *SuratMasuk) (int, error)
		GetAll(ctx context.Context) ([]SuratMasuk, error)
		GetByID(ctx context.Context, id int) (*SuratMasuk, error)
		GetByNomorSurat(ctx context.Context, nomor string) (*SuratMasuk, error)
		Update(ctx context.Context, id int, s *SuratMasuk) error
		Delete(ctx context.Context, id int) (bool, error)
	}

	SuratKeluarRepository interface {
		Create(ctx context.Context, s *SuratKeluar) (int, error)
		GetAll(ctx context.Context) ([]SuratKeluar, error)
		GetByID(ctx context.Context, id int) (*SuratKeluar, error)
		GetByNomorSurat(ctx context.Context, nomor string) (*SuratKeluar, error)
		Update(ctx context.Context, id int, s *SuratKeluar) error
		Delete(ctx context.Context, id int) (bool, error)
	}

	SuratMasukUsecase interface {
		Create(ctx context.Context, req dto.SuratMasukCreateRequestDTO) error
		GetAll(ctx context.Context) ([]dto.SuratMasukResponseDTO, error)
		GetByID(ctx context.Context, id int) (*dto.SuratMasukResponseDTO, error)
		Update(ctx context.Context, id int, req dto.SuratMasukUpdateRequestDTO) error
		Delete(ctx context.Context, id int) error
		DownloadFile(ctx context.Context, id int) ([]byte, string, error)
	}

	SuratKeluarUsecase interface {
		Create(ctx context.Context, req dto.SuratKeluarCreateRequestDTO) error
		GetAll(ctx context.Context) ([]dto.SuratKeluarResponseDTO, error)
		GetByID(ctx context.Context, id int) (*dto.SuratKeluarResponseDTO, error)
		Update(ctx context.Context, id int, req dto.SuratKeluarUpdateRequestDTO) error
		Delete(ctx context.Context, id int) error
		DownloadFile(ctx context.Context, id int) ([]byte, string, error)
	}

	SuratMasukHandler interface {
		Create(c *gin.Context)
		GetAll(c *gin.Context)
		GetByID(c *gin.Context)
		DownloadFile(c *gin.Context)
		Update(c *gin.Context)
		Delete(c *gin.Context)
	}

	SuratKeluarHandler interface {
		Create(c *gin.Context)
		GetAll(c *gin.Context)
		GetByID(c *gin.Context)
		DownloadFile(c *gin.Context)
		Update(c *gin.Context)
		Delete(c *gin.Context)
	}
)
