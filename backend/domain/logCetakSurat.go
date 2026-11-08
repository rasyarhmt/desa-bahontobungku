package domain

import (
	"context"
	"time"
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

type LogCetakSuratRepository interface {
	Create(ctx context.Context, l *LogCetakSurat) (int, error)
	GetAll(ctx context.Context) ([]LogCetakSurat, error)
	GetByID(ctx context.Context, id int) (*LogCetakSurat, error)
	GetByKodeUnik(ctx context.Context, kode string) (*LogCetakSurat, error)
	SetDiresmikan(ctx context.Context, id int, nomorSurat *string) error
}
