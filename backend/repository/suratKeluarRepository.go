package repository

import (
	"context"
	"database/sql"

	"github.com/rasyarhmt/desa-bahontobungku/domain"
)

type suratKeluarRepository struct {
	db *sql.DB
}

func NewSuratKeluarRepository(db *sql.DB) domain.SuratKeluarRepository {
	return &suratKeluarRepository{db: db}
}

const suratKeluarSelect = `
	SELECT id, nomorSurat, penerima, perihal, tanggalKirim, file, id_log_cetak, created_at, updated_at
		FROM suratkeluar`

func scanSuratKeluar(row rowScanner) (*domain.SuratKeluar, error) {
	var s domain.SuratKeluar
	var perihal sql.NullString
	var idLogCetak sql.NullInt64

	dest := []interface{}{
		&s.ID, &s.NomorSurat, &s.Penerima, &perihal,
		&s.TanggalKirim, &s.File, &idLogCetak, &s.CreatedAt, &s.UpdatedAt,
	}
	if err := row.Scan(dest...); err != nil {
		return nil, err
	}

	if perihal.Valid {
		v := perihal.String
		s.Perihal = &v
	}
	if idLogCetak.Valid {
		v := int(idLogCetak.Int64)
		s.IDLogCetak = &v
	}
	return &s, nil
}

func (r *suratKeluarRepository) Create(ctx context.Context, s *domain.SuratKeluar) (int, error) {
	return execReturningID(r.db.ExecContext(ctx,
		`INSERT INTO suratkeluar (nomorSurat, penerima, perihal, tanggalKirim, file, id_log_cetak)
		 VALUES (?, ?, ?, ?, ?, ?)`,
		s.NomorSurat, s.Penerima, s.Perihal, s.TanggalKirim, s.File, s.IDLogCetak))
}

func (r *suratKeluarRepository) GetAll(ctx context.Context) ([]domain.SuratKeluar, error) {
	rows, err := r.db.QueryContext(ctx, suratKeluarSelect+" ORDER BY tanggalKirim DESC")
	if err != nil {
		return nil, err
	}
	return scanAll(rows, scanSuratKeluar)
}

func (r *suratKeluarRepository) GetByID(ctx context.Context, id int) (*domain.SuratKeluar, error) {
	return scanOne(r.db.QueryRowContext(ctx, suratKeluarSelect+" WHERE id = ?", id), scanSuratKeluar)
}

func (r *suratKeluarRepository) GetByNomorSurat(ctx context.Context, nomor string) (*domain.SuratKeluar, error) {
	return scanOne(r.db.QueryRowContext(ctx, suratKeluarSelect+" WHERE nomorSurat = ?", nomor), scanSuratKeluar)
}

func (r *suratKeluarRepository) Update(ctx context.Context, id int, s *domain.SuratKeluar) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE suratkeluar
		 SET nomorSurat = ?, penerima = ?, perihal = ?, tanggalKirim = ?, file = ?, id_log_cetak = ?
		 WHERE id = ?`,
		s.NomorSurat, s.Penerima, s.Perihal, s.TanggalKirim, s.File, s.IDLogCetak, id)
	return err
}

func (r *suratKeluarRepository) Delete(ctx context.Context, id int) (bool, error) {
	return execAffected(r.db.ExecContext(ctx, "DELETE FROM suratkeluar WHERE id = ?", id))
}
