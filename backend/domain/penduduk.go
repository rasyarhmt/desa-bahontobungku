package domain

import (
	"context"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/rasyarhmt/desa-bahontobungku/dto"
)

const (
	StatusKepalaKeluarga = "kepala keluarga"
	StatusIstri          = "istri"
	StatusAnak           = "anak"
	StatusMertua         = "mertua"
	StatusCucu           = "cucu"
	StatusMenantu        = "menantu"

	JenisKelaminLaki      = "laki-laki"
	JenisKelaminPerempuan = "perempuan"
)

type Penduduk struct {
	ID               int
	NIKHash          string
	NIK              string
	Nama             string
	Alamat           string
	TanggalLahir     string
	TempatLahir      string
	JenisKelamin     string
	Agama            string
	Status           string
	IDKepalakeluarga *int
	KKNama           string
	CreatedAt        time.Time
	UpdatedAt        time.Time
}

type StatsPenduduk struct {
	ID           int
	TanggalLahir string
	Agama        string
}

type (
	PendudukRepository interface {
		Create(ctx context.Context, p *Penduduk) error
		GetByID(ctx context.Context, id int) (*Penduduk, error)
		GetByNIKHash(ctx context.Context, nikHash string) (*Penduduk, error)
		GetAll(ctx context.Context) ([]Penduduk, error)
		GetKepalaKeluarga(ctx context.Context) ([]Penduduk, error)
		GetStatsRows(ctx context.Context) ([]StatsPenduduk, error)
		Update(ctx context.Context, id int, p *Penduduk) error
		Delete(ctx context.Context, nikHash string) (bool, error)
		CountTotal(ctx context.Context) (int, error)
		CountByStatus(ctx context.Context, status string) (int, error)
		CountByJenisKelamin(ctx context.Context, jenisKelamin string) (int, error)
		CountDependents(ctx context.Context, kepalaKeluargaID int) (int, error)
	}

	PendudukUsecase interface {
		Create(ctx context.Context, req dto.PendudukRequestDTO) error
		GetByNIK(ctx context.Context, nik string) (*dto.PendudukResponseDTO, error)
		GetAll(ctx context.Context) ([]dto.PendudukResponseDTO, error)
		GetKepalaKeluarga(ctx context.Context) ([]dto.PendudukResponseDTO, error)
		Update(ctx context.Context, req dto.PendudukUpdateRequestDTO) error
		Delete(ctx context.Context, nik string) error
		CountTotal(ctx context.Context) (int, error)
		CountKepalaKeluarga(ctx context.Context) (int, error)
		CountLakiLaki(ctx context.Context) (int, error)
		CountPerempuan(ctx context.Context) (int, error)
		GetReligiStats(ctx context.Context) ([]dto.ReligiStatsDTO, error)
		GetUmurStats(ctx context.Context) ([]dto.UmurStatsDTO, error)
	}

	PendudukHandler interface {
		Create(c *gin.Context)
		GetByNIK(c *gin.Context)
		GetAll(c *gin.Context)
		GetKepalaKeluarga(c *gin.Context)
		Update(c *gin.Context)
		Delete(c *gin.Context)
		GetTotalStats(c *gin.Context)
		GetKepalaKeluargaStats(c *gin.Context)
		GetLakiLakiStats(c *gin.Context)
		GetPerempuanStats(c *gin.Context)
		GetReligiStats(c *gin.Context)
		GetUmurStats(c *gin.Context)
	}
)
