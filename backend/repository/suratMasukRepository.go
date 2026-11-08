package repository

import (
	"context"
	"database/sql"

	"github.com/rasyarhmt/desa-bahontobungku/domain"
)

type suratMasukRepository struct {
	db *sql.DB
}

func NewSuratMasukRepository(db *sql.DB) domain.SuratMasukRepository {
	return &suratMasukRepository{db: db}
}

const suratMasukSelect = `
	SELECT id, nomorSurat, pengirim, perihal, tanggalTerima, file, created_at, updated_at
		FROM suratmasuk`

func scanSuratMasuk(row rowScanner) (*domain.SuratMasuk, error) {
	var s domain.SuratMasuk
	var perihal sql.NullString

	dest := []interface{}{
		&s.ID, &s.NomorSurat, &s.Pengirim, &perihal,
		&s.TanggalTerima, &s.File, &s.CreatedAt, &s.UpdatedAt,
	}
	if err := row.Scan(dest...); err != nil {
		return nil, err
	}

	if perihal.Valid {
		v := perihal.String
		s.Perihal = &v
	}
	return &s, nil
}

func (r *suratMasukRepository) Create(ctx context.Context, s *domain.SuratMasuk) (int, error) {
	return execReturningID(r.db.ExecContext(ctx,
		`INSERT INTO suratmasuk (nomorSurat, pengirim, perihal, tanggalTerima, file)
		 VALUES (?, ?, ?, ?, ?)`,
		s.NomorSurat, s.Pengirim, s.Perihal, s.TanggalTerima, s.File))
}

func (r *suratMasukRepository) GetAll(ctx context.Context) ([]domain.SuratMasuk, error) {
	rows, err := r.db.QueryContext(ctx, suratMasukSelect+" ORDER BY tanggalTerima DESC")
	if err != nil {
		return nil, err
	}
	return scanAll(rows, scanSuratMasuk)
}

func (r *suratMasukRepository) GetByID(ctx context.Context, id int) (*domain.SuratMasuk, error) {
	return scanOne(r.db.QueryRowContext(ctx, suratMasukSelect+" WHERE id = ?", id), scanSuratMasuk)
}

func (r *suratMasukRepository) GetByNomorSurat(ctx context.Context, nomor string) (*domain.SuratMasuk, error) {
	return scanOne(r.db.QueryRowContext(ctx, suratMasukSelect+" WHERE nomorSurat = ?", nomor), scanSuratMasuk)
}

func (r *suratMasukRepository) Update(ctx context.Context, id int, s *domain.SuratMasuk) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE suratmasuk
		 SET nomorSurat = ?, pengirim = ?, perihal = ?, tanggalTerima = ?, file = ?
		 WHERE id = ?`,
		s.NomorSurat, s.Pengirim, s.Perihal, s.TanggalTerima, s.File, id)
	return err
}

func (r *suratMasukRepository) Delete(ctx context.Context, id int) (bool, error) {
	return execAffected(r.db.ExecContext(ctx, "DELETE FROM suratmasuk WHERE id = ?", id))
}
