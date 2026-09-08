package dto

import "time"

type (
	DanaMasukCreateRequestDTO struct {
		Tahun      int     `json:"tahun" example:"2026"`
		Bulan      int     `json:"bulan" example:"9"`
		Jumlah     float64 `json:"jumlah" example:"12500000.50"`
		Sumber     string  `json:"sumber" example:"Dana Desa"`
		Keterangan string  `json:"keterangan" example:"DD Tahap III"`
	}

	DanaMasukUpdateRequestDTO struct {
		Tahun      *int     `json:"tahun" example:"2026"`
		Bulan      *int     `json:"bulan" example:"9"`
		Jumlah     *float64 `json:"jumlah" example:"12500000.50"`
		Sumber     *string  `json:"sumber" example:"Dana Desa"`
		Keterangan *string  `json:"keterangan" example:"DD Tahap III"`
	}

	DanaMasukResponseDTO struct {
		ID         int       `json:"id" example:"1"`
		Tahun      int       `json:"tahun" example:"2026"`
		Bulan      int       `json:"bulan" example:"9"`
		Jumlah     float64   `json:"jumlah" example:"12500000.50"`
		Sumber     string    `json:"sumber" example:"Dana Desa"`
		Keterangan string    `json:"keterangan" example:"DD Tahap III"`
		CreatedAt  time.Time `json:"created_at"`
		UpdatedAt  time.Time `json:"updated_at"`
	}

	DanaKeluarCreateRequestDTO struct {
		Tahun      int     `json:"tahun" example:"2026"`
		Bulan      int     `json:"bulan" example:"9"`
		Jumlah     float64 `json:"jumlah" example:"8000000.00"`
		Kategori   string  `json:"kategori" example:"Belanja Operasional"`
		Keterangan string  `json:"keterangan" example:"ATK kantor desa"`
	}

	DanaKeluarUpdateRequestDTO struct {
		Tahun      *int     `json:"tahun" example:"2026"`
		Bulan      *int     `json:"bulan" example:"9"`
		Jumlah     *float64 `json:"jumlah" example:"8000000.00"`
		Kategori   *string  `json:"kategori" example:"Belanja Operasional"`
		Keterangan *string  `json:"keterangan" example:"ATK kantor desa"`
	}

	DanaKeluarResponseDTO struct {
		ID         int       `json:"id" example:"1"`
		Tahun      int       `json:"tahun" example:"2026"`
		Bulan      int       `json:"bulan" example:"9"`
		Jumlah     float64   `json:"jumlah" example:"8000000.00"`
		Kategori   string    `json:"kategori" example:"Belanja Operasional"`
		Keterangan string    `json:"keterangan" example:"ATK kantor desa"`
		CreatedAt  time.Time `json:"created_at"`
		UpdatedAt  time.Time `json:"updated_at"`
	}

	DanaSummaryItemDTO struct {
		Tipe  string  `json:"tipe" example:"Pemasukan"`
		Tahun int     `json:"tahun" example:"2026"`
		Total float64 `json:"total" example:"12500000.50"`
	}

	DanaBulananDTO struct {
		Bulan int     `json:"bulan" example:"9"`
		Total float64 `json:"total" example:"12500000.50"`
	}

	DanaDetailDTO struct {
		Pendapatan  []DanaBulananDTO `json:"pendapatan"`
		Pengeluaran []DanaBulananDTO `json:"pengeluaran"`
	}
)
