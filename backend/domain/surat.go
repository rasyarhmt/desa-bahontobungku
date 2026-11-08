package domain

import (
	"context"
	"time"
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

type SuratMasukRepository interface {
	Create(ctx context.Context, s *SuratMasuk) (int, error)
	GetAll(ctx context.Context) ([]SuratMasuk, error)
	GetByID(ctx context.Context, id int) (*SuratMasuk, error)
	GetByNomorSurat(ctx context.Context, nomor string) (*SuratMasuk, error)
	Update(ctx context.Context, id int, s *SuratMasuk) error
	Delete(ctx context.Context, id int) (bool, error)
}

type SuratKeluarRepository interface {
	Create(ctx context.Context, s *SuratKeluar) (int, error)
	GetAll(ctx context.Context) ([]SuratKeluar, error)
	GetByID(ctx context.Context, id int) (*SuratKeluar, error)
	GetByNomorSurat(ctx context.Context, nomor string) (*SuratKeluar, error)
	Update(ctx context.Context, id int, s *SuratKeluar) error
	Delete(ctx context.Context, id int) (bool, error)
}
