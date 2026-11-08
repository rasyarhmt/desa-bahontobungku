package domain

import (
	"context"
	"time"
)

const (
	MediaTipeFoto    = "foto"
	MediaTipeVideo   = "video"
	MediaTipeDokumen = "dokumen"
)

type Media struct {
	ID        int
	Nama      string
	Tipe      string
	File      string
	Deskripsi string
	Thumbnail string
	CreatedAt time.Time
	UpdatedAt time.Time
}

type MediaRepository interface {
	Create(ctx context.Context, m *Media) error
	GetAll(ctx context.Context) ([]Media, error)
	GetByID(ctx context.Context, id int) (*Media, error)
	Update(ctx context.Context, id int, m *Media) error
	Delete(ctx context.Context, id int) (bool, error)
}
