package repository

import (
	"context"
	"database/sql"
	"errors"

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

type suratKeluarScanner interface {
	Scan(dest ...interface{}) error
}

func scanSuratKeluar(row suratKeluarScanner) (*domain.SuratKeluar, error) {
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
	result, err := r.db.ExecContext(ctx,
		`INSERT INTO suratkeluar (nomorSurat, penerima, perihal, tanggalKirim, file, id_log_cetak)
		 VALUES (?, ?, ?, ?, ?, ?)`,
		s.NomorSurat, s.Penerima, s.Perihal, s.TanggalKirim, s.File, s.IDLogCetak)
	if err != nil {
		return 0, err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}
	return int(id), nil
}

func (r *suratKeluarRepository) GetAll(ctx context.Context) ([]domain.SuratKeluar, error) {
	rows, err := r.db.QueryContext(ctx, suratKeluarSelect+" ORDER BY tanggalKirim DESC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := make([]domain.SuratKeluar, 0)
	for rows.Next() {
		s, err := scanSuratKeluar(rows)
		if err != nil {
			return nil, err
		}
		result = append(result, *s)
	}
	return result, rows.Err()
}

func (r *suratKeluarRepository) GetByID(ctx context.Context, id int) (*domain.SuratKeluar, error) {
	row := r.db.QueryRowContext(ctx, suratKeluarSelect+" WHERE id = ?", id)
	s, err := scanSuratKeluar(row)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return s, nil
}

func (r *suratKeluarRepository) GetByNomorSurat(ctx context.Context, nomor string) (*domain.SuratKeluar, error) {
	row := r.db.QueryRowContext(ctx, suratKeluarSelect+" WHERE nomorSurat = ?", nomor)
	s, err := scanSuratKeluar(row)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return s, nil
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
	result, err := r.db.ExecContext(ctx, "DELETE FROM suratkeluar WHERE id = ?", id)
	if err != nil {
		return false, err
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return false, err
	}
	return affected > 0, nil
}
