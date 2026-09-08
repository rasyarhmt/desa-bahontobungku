package domain

import (
	"context"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/rasyarhmt/desa-bahontobungku/dto"
)

const (
	LogCetakStatusDicetak    = "dicetak"
	LogCetakStatusDiresmikan = "diresmikan"
)

type LogCetakSurat struct {
	ID           int
	KodeUnik     string
	IDTemplate   *int
	IDPelayanan  *int
	NamaTemplate string
	NamaLayanan  string
	NamaPemohon  string
	NikPemohon   string
	File         string
	NomorSurat   *string
	Status       string
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

type (
	LogCetakSuratRepository interface {
		Create(ctx context.Context, l *LogCetakSurat) (int, error)
		GetAll(ctx context.Context) ([]LogCetakSurat, error)
		GetByID(ctx context.Context, id int) (*LogCetakSurat, error)
		GetByKodeUnik(ctx context.Context, kode string) (*LogCetakSurat, error)
		SetDiresmikan(ctx context.Context, id int, nomorSurat *string) error
	}

	LogCetakSuratUsecase interface {
		Ajukan(ctx context.Context, idPelayanan int, req dto.AjukanSuratRequestDTO) (*dto.AjukanSuratResponseDTO, error)
		GetAll(ctx context.Context) ([]dto.LogCetakSuratResponseDTO, error)
		GetByID(ctx context.Context, id int) (*dto.LogCetakSuratResponseDTO, error)
		DownloadByKode(ctx context.Context, kodeUnik string) ([]byte, string, error)
		DownloadByID(ctx context.Context, id int) ([]byte, string, error)
		Resmikan(ctx context.Context, id int, nomorSurat string) error
		Verifikasi(ctx context.Context, kodeUnik string) (*dto.LogCetakSuratVerifikasiDTO, error)
	}

	LogCetakSuratHandler interface {
		Ajukan(c *gin.Context)
		GetAll(c *gin.Context)
		GetByID(c *gin.Context)
		DownloadByKode(c *gin.Context)
		DownloadByID(c *gin.Context)
		Resmikan(c *gin.Context)
		Verifikasi(c *gin.Context)
		QR(c *gin.Context)
	}
)
