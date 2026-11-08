package domain

import (
	"context"
	"time"
)

type Aparatur struct {
	ID        int
	Nama      string
	Nip       string
	Jabatan   string
	Telepon   string
	Foto      string
	CreatedAt time.Time
	UpdatedAt time.Time
}

type AparaturRepository interface {
	Create(ctx context.Context, a *Aparatur) error
	GetAll(ctx context.Context) ([]Aparatur, error)
	GetByID(ctx context.Context, id int) (*Aparatur, error)
	GetByNIP(ctx context.Context, nip string) (*Aparatur, error)
	Update(ctx context.Context, id int, a *Aparatur) error
	Delete(ctx context.Context, id int) (bool, error)
}
