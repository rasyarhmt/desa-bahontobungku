package repository

import (
	"context"
	"database/sql"
	"errors"

	"github.com/rasyarhmt/desa-bahontobungku/domain"
)

type danaRepository struct {
	db *sql.DB
}

func NewDanaRepository(db *sql.DB) domain.DanaRepository {
	return &danaRepository{db: db}
}

const danaMasukSelect = `
	SELECT id, tahun, bulan, jumlah, sumber, keterangan, created_at, updated_at
	FROM danamasuk`

const danaKeluarSelect = `
	SELECT id, tahun, bulan, jumlah, kategori, keterangan, created_at, updated_at
	FROM danakeluar`

const danaOrder = " ORDER BY tahun DESC, bulan ASC, id DESC"

func scanDanaMasuk(row rowScanner) (*domain.DanaMasuk, error) {
	var d domain.DanaMasuk
	var jumlah sql.NullFloat64

	dest := []interface{}{
		&d.ID, &d.Tahun, &d.Bulan, &jumlah, &d.Sumber, &d.Keterangan,
		&d.CreatedAt, &d.UpdatedAt,
	}
	if err := row.Scan(dest...); err != nil {
		return nil, err
	}
	if jumlah.Valid {
		d.Jumlah = jumlah.Float64
	}
	return &d, nil
}

func scanDanaKeluar(row rowScanner) (*domain.DanaKeluar, error) {
	var d domain.DanaKeluar
	var jumlah sql.NullFloat64

	dest := []interface{}{
		&d.ID, &d.Tahun, &d.Bulan, &jumlah, &d.Kategori, &d.Keterangan,
		&d.CreatedAt, &d.UpdatedAt,
	}
	if err := row.Scan(dest...); err != nil {
		return nil, err
	}
	if jumlah.Valid {
		d.Jumlah = jumlah.Float64
	}
	return &d, nil
}

type danaTotalRow struct {
	tahun int
	total float64
}

func scanDanaTotal(row rowScanner) (*danaTotalRow, error) {
	var r danaTotalRow
	if err := row.Scan(&r.tahun, &r.total); err != nil {
		return nil, err
	}
	return &r, nil
}

func (r *danaRepository) CreateMasuk(ctx context.Context, d *domain.DanaMasuk) error {
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO danamasuk (tahun, bulan, jumlah, sumber, keterangan)
		 VALUES (?, ?, ?, ?, ?)`,
		d.Tahun, d.Bulan, d.Jumlah, d.Sumber, d.Keterangan)
	return err
}

func (r *danaRepository) CreateKeluar(ctx context.Context, d *domain.DanaKeluar) error {
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO danakeluar (tahun, bulan, jumlah, kategori, keterangan)
		 VALUES (?, ?, ?, ?, ?)`,
		d.Tahun, d.Bulan, d.Jumlah, d.Kategori, d.Keterangan)
	return err
}

func (r *danaRepository) GetAllMasuk(ctx context.Context) ([]domain.DanaMasuk, error) {
	rows, err := r.db.QueryContext(ctx, danaMasukSelect+danaOrder)
	if err != nil {
		return nil, err
	}
	return scanAll(rows, scanDanaMasuk)
}

func (r *danaRepository) GetAllKeluar(ctx context.Context) ([]domain.DanaKeluar, error) {
	rows, err := r.db.QueryContext(ctx, danaKeluarSelect+danaOrder)
	if err != nil {
		return nil, err
	}
	return scanAll(rows, scanDanaKeluar)
}

func (r *danaRepository) GetMasukByID(ctx context.Context, id int) (*domain.DanaMasuk, error) {
	return scanOne(r.db.QueryRowContext(ctx, danaMasukSelect+" WHERE id = ?", id), scanDanaMasuk)
}

func (r *danaRepository) GetKeluarByID(ctx context.Context, id int) (*domain.DanaKeluar, error) {
	return scanOne(r.db.QueryRowContext(ctx, danaKeluarSelect+" WHERE id = ?", id), scanDanaKeluar)
}

func (r *danaRepository) UpdateMasuk(ctx context.Context, id int, d *domain.DanaMasuk) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE danamasuk
		 SET tahun = ?, bulan = ?, jumlah = ?, sumber = ?, keterangan = ?
		 WHERE id = ?`,
		d.Tahun, d.Bulan, d.Jumlah, d.Sumber, d.Keterangan, id)
	return err
}

func (r *danaRepository) UpdateKeluar(ctx context.Context, id int, d *domain.DanaKeluar) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE danakeluar
		 SET tahun = ?, bulan = ?, jumlah = ?, kategori = ?, keterangan = ?
		 WHERE id = ?`,
		d.Tahun, d.Bulan, d.Jumlah, d.Kategori, d.Keterangan, id)
	return err
}

func (r *danaRepository) DeleteMasuk(ctx context.Context, id int) (bool, error) {
	return execAffected(r.db.ExecContext(ctx, "DELETE FROM danamasuk WHERE id = ?", id))
}

func (r *danaRepository) DeleteKeluar(ctx context.Context, id int) (bool, error) {
	return execAffected(r.db.ExecContext(ctx, "DELETE FROM danakeluar WHERE id = ?", id))
}

func (r *danaRepository) GetSummaryByYear(ctx context.Context, tahun int) (*domain.DanaSummaryItem, *domain.DanaSummaryItem, error) {
	var pemasukan domain.DanaSummaryItem
	var pengeluaran domain.DanaSummaryItem

	pemasukanTipe := "Pemasukan"
	pengeluaranTipe := "Pengeluaran"

	rowMasuk := r.db.QueryRowContext(ctx,
		`SELECT tahun, COALESCE(SUM(jumlah), 0) FROM danamasuk WHERE tahun = ? GROUP BY tahun`, tahun)
	if err := rowMasuk.Scan(&pemasukan.Tahun, &pemasukan.Total); err != nil {
		if !errors.Is(err, sql.ErrNoRows) {
			return nil, nil, err
		}
	}
	pemasukan.Tipe = pemasukanTipe

	rowKeluar := r.db.QueryRowContext(ctx,
		`SELECT tahun, COALESCE(SUM(jumlah), 0) FROM danakeluar WHERE tahun = ? GROUP BY tahun`, tahun)
	if err := rowKeluar.Scan(&pengeluaran.Tahun, &pengeluaran.Total); err != nil {
		if !errors.Is(err, sql.ErrNoRows) {
			return nil, nil, err
		}
	}
	pengeluaran.Tipe = pengeluaranTipe

	return &pemasukan, &pengeluaran, nil
}

func (r *danaRepository) GetDetailByYear(ctx context.Context, tahun int) (*domain.DanaDetail, error) {
	detail := &domain.DanaDetail{
		Pendapatan:  make([]domain.DanaBulanan, 0),
		Pengeluaran: make([]domain.DanaBulanan, 0),
	}

	rows, err := r.db.QueryContext(ctx,
		`SELECT bulan, SUM(jumlah) FROM danamasuk WHERE tahun = ? GROUP BY bulan ORDER BY bulan`, tahun)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var d domain.DanaBulanan
		if err := rows.Scan(&d.Bulan, &d.Total); err != nil {
			return nil, err
		}
		detail.Pendapatan = append(detail.Pendapatan, d)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	rows, err = r.db.QueryContext(ctx,
		`SELECT bulan, SUM(jumlah) FROM danakeluar WHERE tahun = ? GROUP BY bulan ORDER BY bulan`, tahun)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var d domain.DanaBulanan
		if err := rows.Scan(&d.Bulan, &d.Total); err != nil {
			return nil, err
		}
		detail.Pengeluaran = append(detail.Pengeluaran, d)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return detail, nil
}
