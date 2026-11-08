package domain

import (
	"context"
	"time"
)

const (
	BeritaStatusDraft       = "draft"
	BeritaStatusDipublikasi = "dipublikasi"
)

type Berita struct {
	ID            int
	Foto          string
	Judul         string
	Isi           string
	TanggalTerbit time.Time
	Penulis       string
	Status        string
	CreatedAt     time.Time
	UpdatedAt     time.Time
}

type BeritaRepository interface {
	Create(ctx context.Context, b *Berita) error
	GetAll(ctx context.Context) ([]Berita, error)
	GetPublished(ctx context.Context) ([]Berita, error)
	GetByID(ctx context.Context, id int) (*Berita, error)
	Update(ctx context.Context, id int, b *Berita) error
	Delete(ctx context.Context, id int) (bool, error)
}
