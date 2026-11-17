package domain

import (
	"context"
	"time"
)

const (
	JenisKelaminLaki      = "laki-laki"
	JenisKelaminPerempuan = "perempuan"
)

type Penduduk struct {
	ID               int
	NIKHash          string
	NIK              string
	Nama             string
	Alamat           string
	TanggalLahir     string
	TempatLahir      string
	NoKK             string
	JenisKelamin     string
	Agama            string
	Pekerjaan        string
	IDStatusKeluarga *int
	StatusNama       string
	IDKepalakeluarga *int
	KKNama           string
	CreatedAt        time.Time
	UpdatedAt        time.Time
}

type StatsPenduduk struct {
	ID           int
	TanggalLahir string
	Agama        string
}

type PendudukRepository interface {
	Create(ctx context.Context, p *Penduduk) error
	GetByID(ctx context.Context, id int) (*Penduduk, error)
	GetByNIKHash(ctx context.Context, nikHash string) (*Penduduk, error)
	GetAll(ctx context.Context) ([]Penduduk, error)
	GetKepalaKeluargaByStatusID(ctx context.Context, statusID int) ([]Penduduk, error)
	GetStatsRows(ctx context.Context) ([]StatsPenduduk, error)
	Update(ctx context.Context, id int, p *Penduduk) error
	Delete(ctx context.Context, nikHash string) (bool, error)
	CountTotal(ctx context.Context) (int, error)
	CountByStatusID(ctx context.Context, statusID int) (int, error)
	CountByJenisKelamin(ctx context.Context, jenisKelamin string) (int, error)
	CountDependents(ctx context.Context, kepalaKeluargaID int) (int, error)
}
