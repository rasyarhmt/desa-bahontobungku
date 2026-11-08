package domain

import (
	"context"
	"time"
)

type DanaMasuk struct {
	ID         int
	Tahun      int
	Bulan      int
	Jumlah     float64
	Sumber     string
	Keterangan string
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

type DanaKeluar struct {
	ID         int
	Tahun      int
	Bulan      int
	Jumlah     float64
	Kategori   string
	Keterangan string
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

type DanaSummaryItem struct {
	Tipe  string
	Tahun int
	Total float64
}

type DanaBulanan struct {
	Bulan int
	Total float64
}

type DanaDetail struct {
	Pendapatan  []DanaBulanan
	Pengeluaran []DanaBulanan
}

type DanaRepository interface {
	CreateMasuk(ctx context.Context, d *DanaMasuk) error
	CreateKeluar(ctx context.Context, d *DanaKeluar) error
	GetAllMasuk(ctx context.Context) ([]DanaMasuk, error)
	GetAllKeluar(ctx context.Context) ([]DanaKeluar, error)
	GetMasukByID(ctx context.Context, id int) (*DanaMasuk, error)
	GetKeluarByID(ctx context.Context, id int) (*DanaKeluar, error)
	UpdateMasuk(ctx context.Context, id int, d *DanaMasuk) error
	UpdateKeluar(ctx context.Context, id int, d *DanaKeluar) error
	DeleteMasuk(ctx context.Context, id int) (bool, error)
	DeleteKeluar(ctx context.Context, id int) (bool, error)
	GetSummaryByYear(ctx context.Context, tahun int) (*DanaSummaryItem, *DanaSummaryItem, error)
	GetDetailByYear(ctx context.Context, tahun int) (*DanaDetail, error)
}
