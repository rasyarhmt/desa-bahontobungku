package domain

import (
	"context"
	"time"
)

const NamaStatusKepalaKeluarga = "kepala keluarga"

type StatusKeluarga struct {
	ID        int
	Nama      string
	IsActive  bool
	CreatedAt time.Time
	UpdatedAt time.Time
}

type StatusKeluargaRepository interface {
	Create(ctx context.Context, s *StatusKeluarga) (int, error)
	GetAll(ctx context.Context) ([]StatusKeluarga, error)
	GetByID(ctx context.Context, id int) (*StatusKeluarga, error)
	GetByNama(ctx context.Context, nama string) (*StatusKeluarga, error)
	Update(ctx context.Context, id int, s *StatusKeluarga) error
	Delete(ctx context.Context, id int) (bool, error)
	ToggleActive(ctx context.Context, id int) (bool, error)
	CountPengguna(ctx context.Context, id int) (int, error)
}
