package repository

import (
	"context"
	"database/sql"
	"errors"

	"github.com/rasyarhmt/desa-bahontobungku/domain"
)

type beritaRepository struct {
	db *sql.DB
}

func NewBeritaRepository(db *sql.DB) domain.BeritaRepository {
	return &beritaRepository{db: db}
}

const beritaSelect = `
	SELECT id, foto, judul, isi, tanggalTerbit, penulis, status, created_at, updated_at
	FROM berita`

const beritaOrder = " ORDER BY tanggalTerbit DESC, id DESC"

func scanBerita(row rowScanner) (*domain.Berita, error) {
	var b domain.Berita
	var foto sql.NullString
	var tanggalTerbit sql.NullTime

	dest := []interface{}{
		&b.ID, &foto, &b.Judul, &b.Isi, &tanggalTerbit, &b.Penulis, &b.Status,
		&b.CreatedAt, &b.UpdatedAt,
	}
	if err := row.Scan(dest...); err != nil {
		return nil, err
	}

	if foto.Valid {
		b.Foto = foto.String
	}
	if tanggalTerbit.Valid {
		b.TanggalTerbit = tanggalTerbit.Time
	}
	return &b, nil
}

func (r *beritaRepository) Create(ctx context.Context, b *domain.Berita) error {
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO berita (foto, judul, isi, tanggalTerbit, penulis, status)
		 VALUES (?, ?, ?, ?, ?, ?)`,
		b.Foto, b.Judul, b.Isi, b.TanggalTerbit, b.Penulis, b.Status)
	return err
}

func (r *beritaRepository) GetAll(ctx context.Context) ([]domain.Berita, error) {
	rows, err := r.db.QueryContext(ctx, beritaSelect+beritaOrder)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := make([]domain.Berita, 0)
	for rows.Next() {
		b, err := scanBerita(rows)
		if err != nil {
			return nil, err
		}
		result = append(result, *b)
	}
	return result, rows.Err()
}

func (r *beritaRepository) GetPublished(ctx context.Context) ([]domain.Berita, error) {
	rows, err := r.db.QueryContext(ctx,
		beritaSelect+" WHERE status = ?"+beritaOrder, domain.BeritaStatusDipublikasi)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := make([]domain.Berita, 0)
	for rows.Next() {
		b, err := scanBerita(rows)
		if err != nil {
			return nil, err
		}
		result = append(result, *b)
	}
	return result, rows.Err()
}

func (r *beritaRepository) GetByID(ctx context.Context, id int) (*domain.Berita, error) {
	row := r.db.QueryRowContext(ctx, beritaSelect+" WHERE id = ?", id)
	b, err := scanBerita(row)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return b, nil
}

func (r *beritaRepository) Update(ctx context.Context, id int, b *domain.Berita) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE berita
		 SET foto = ?, judul = ?, isi = ?, tanggalTerbit = ?, penulis = ?, status = ?
		 WHERE id = ?`,
		b.Foto, b.Judul, b.Isi, b.TanggalTerbit, b.Penulis, b.Status, id)
	return err
}

func (r *beritaRepository) Delete(ctx context.Context, id int) (bool, error) {
	result, err := r.db.ExecContext(ctx, "DELETE FROM berita WHERE id = ?", id)
	if err != nil {
		return false, err
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return false, err
	}
	return affected > 0, nil
}
