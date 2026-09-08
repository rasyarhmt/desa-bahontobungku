package domain

import (
	"context"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/rasyarhmt/desa-bahontobungku/dto"
)

type DanaMasuk struct {
	ID         int
	Tahun      int
	Bulan      int
	Jumlah     float64
	Sumber     string
	Keterangan string
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

type DanaKeluar struct {
	ID         int
	Tahun      int
	Bulan      int
	Jumlah     float64
	Kategori   string
	Keterangan string
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

type (
	DanaRepository interface {
		CreateMasuk(ctx context.Context, d *DanaMasuk) error
		CreateKeluar(ctx context.Context, d *DanaKeluar) error
		GetAllMasuk(ctx context.Context) ([]DanaMasuk, error)
		GetAllKeluar(ctx context.Context) ([]DanaKeluar, error)
		GetMasukByID(ctx context.Context, id int) (*DanaMasuk, error)
		GetKeluarByID(ctx context.Context, id int) (*DanaKeluar, error)
		UpdateMasuk(ctx context.Context, id int, d *DanaMasuk) error
		UpdateKeluar(ctx context.Context, id int, d *DanaKeluar) error
		DeleteMasuk(ctx context.Context, id int) (bool, error)
		DeleteKeluar(ctx context.Context, id int) (bool, error)
		GetSummaryByYear(ctx context.Context, tahun int) (*dto.DanaSummaryItemDTO, *dto.DanaSummaryItemDTO, error)
		GetDetailByYear(ctx context.Context, tahun int) (*dto.DanaDetailDTO, error)
	}

	DanaUsecase interface {
		CreateMasuk(ctx context.Context, req dto.DanaMasukCreateRequestDTO) (*dto.DanaMasukResponseDTO, error)
		CreateKeluar(ctx context.Context, req dto.DanaKeluarCreateRequestDTO) (*dto.DanaKeluarResponseDTO, error)
		GetAllMasuk(ctx context.Context) ([]dto.DanaMasukResponseDTO, error)
		GetAllKeluar(ctx context.Context) ([]dto.DanaKeluarResponseDTO, error)
		GetMasukByID(ctx context.Context, id int) (*dto.DanaMasukResponseDTO, error)
		GetKeluarByID(ctx context.Context, id int) (*dto.DanaKeluarResponseDTO, error)
		UpdateMasuk(ctx context.Context, id int, req dto.DanaMasukUpdateRequestDTO) error
		UpdateKeluar(ctx context.Context, id int, req dto.DanaKeluarUpdateRequestDTO) error
		DeleteMasuk(ctx context.Context, id int) error
		DeleteKeluar(ctx context.Context, id int) error
		GetSummary(ctx context.Context, tahun int) ([]dto.DanaSummaryItemDTO, error)
		GetDetail(ctx context.Context, tahun int) (*dto.DanaDetailDTO, error)
	}

	DanaHandler interface {
		CreateMasuk(c *gin.Context)
		CreateKeluar(c *gin.Context)
		GetAllMasuk(c *gin.Context)
		GetAllKeluar(c *gin.Context)
		GetMasukByID(c *gin.Context)
		GetKeluarByID(c *gin.Context)
		GetSummary(c *gin.Context)
		GetDetail(c *gin.Context)
		UpdateMasuk(c *gin.Context)
		UpdateKeluar(c *gin.Context)
		DeleteMasuk(c *gin.Context)
		DeleteKeluar(c *gin.Context)
	}
)
