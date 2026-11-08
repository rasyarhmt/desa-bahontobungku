package domain

import (
	"context"
	"time"
)

const (
	PelayananStatusAktif    = "aktif"
	PelayananStatusNonaktif = "nonaktif"
)

type Pelayanan struct {
	ID              int
	NamaLayanan     string
	Deskripsi       string
	IDSuratTemplate int
	Status          string
	CreatedAt       time.Time
	UpdatedAt       time.Time
}

type PelayananRepository interface {
	Create(ctx context.Context, p *Pelayanan) (int, error)
	GetAll(ctx context.Context) ([]Pelayanan, error)
	GetByID(ctx context.Context, id int) (*Pelayanan, error)
	Update(ctx context.Context, id int, p *Pelayanan) error
	Delete(ctx context.Context, id int) (bool, error)
	UpdateStatus(ctx context.Context, id int, status string) error
}
