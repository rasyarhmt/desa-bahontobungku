package repository

import (
	"context"
	"database/sql"

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
	return scanAll(rows, scanBerita)
}

func (r *beritaRepository) GetPublished(ctx context.Context) ([]domain.Berita, error) {
	rows, err := r.db.QueryContext(ctx,
		beritaSelect+" WHERE status = ?"+beritaOrder, domain.BeritaStatusDipublikasi)
	if err != nil {
		return nil, err
	}
	return scanAll(rows, scanBerita)
}

func (r *beritaRepository) GetByID(ctx context.Context, id int) (*domain.Berita, error) {
	return scanOne(r.db.QueryRowContext(ctx, beritaSelect+" WHERE id = ?", id), scanBerita)
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
	return execAffected(r.db.ExecContext(ctx, "DELETE FROM berita WHERE id = ?", id))
}
