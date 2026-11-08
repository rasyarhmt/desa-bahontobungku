package domain

import (
	"context"
	"time"
)

const (
	TemplateStatusAktif    = "aktif"
	TemplateStatusNonaktif = "nonaktif"
)

type SuratTemplate struct {
	ID           int
	Kode         string
	NamaTemplate string
	FileTemplate string
	Deskripsi    string
	Status       string
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

type SuratTemplateRepository interface {
	Create(ctx context.Context, t *SuratTemplate) (int, error)
	GetAll(ctx context.Context) ([]SuratTemplate, error)
	GetByID(ctx context.Context, id int) (*SuratTemplate, error)
	GetByKode(ctx context.Context, kode string) (*SuratTemplate, error)
	Update(ctx context.Context, id int, t *SuratTemplate) error
	Delete(ctx context.Context, id int) (bool, error)
	UpdateStatus(ctx context.Context, id int, status string) error
}
