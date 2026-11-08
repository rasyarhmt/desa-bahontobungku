package domain

import (
	"context"
	"time"
)

type Pengumuman struct {
	ID             int
	Judul          string
	Isi            string
	TanggalMulai   time.Time
	TanggalSelesai time.Time
	CreatedAt      time.Time
	UpdatedAt      time.Time
}

type PengumumanRepository interface {
	Create(ctx context.Context, p *Pengumuman) error
	GetAll(ctx context.Context) ([]Pengumuman, error)
	GetByID(ctx context.Context, id int) (*Pengumuman, error)
	Update(ctx context.Context, id int, p *Pengumuman) error
	Delete(ctx context.Context, id int) (bool, error)
}
