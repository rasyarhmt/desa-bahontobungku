package repository

import (
	"context"
	"database/sql"

	"github.com/rasyarhmt/desa-bahontobungku/domain"
)

type mediaRepository struct {
	db *sql.DB
}

func NewMediaRepository(db *sql.DB) domain.MediaRepository {
	return &mediaRepository{db: db}
}

const mediaSelect = `
	SELECT id, nama, tipe, file, deskripsi, thumbnail, created_at, updated_at
	FROM media`

const mediaOrder = " ORDER BY id DESC"

func scanMedia(row rowScanner) (*domain.Media, error) {
	var m domain.Media
	var thumbnail sql.NullString

	dest := []interface{}{
		&m.ID, &m.Nama, &m.Tipe, &m.File, &m.Deskripsi, &thumbnail,
		&m.CreatedAt, &m.UpdatedAt,
	}
	if err := row.Scan(dest...); err != nil {
		return nil, err
	}
	if thumbnail.Valid {
		m.Thumbnail = thumbnail.String
	}
	return &m, nil
}

func (r *mediaRepository) Create(ctx context.Context, m *domain.Media) error {
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO media (nama, tipe, file, deskripsi, thumbnail)
		 VALUES (?, ?, ?, ?, ?)`,
		m.Nama, m.Tipe, m.File, m.Deskripsi, m.Thumbnail)
	return err
}

func (r *mediaRepository) GetAll(ctx context.Context) ([]domain.Media, error) {
	rows, err := r.db.QueryContext(ctx, mediaSelect+mediaOrder)
	if err != nil {
		return nil, err
	}
	return scanAll(rows, scanMedia)
}

func (r *mediaRepository) GetByID(ctx context.Context, id int) (*domain.Media, error) {
	return scanOne(r.db.QueryRowContext(ctx, mediaSelect+" WHERE id = ?", id), scanMedia)
}

func (r *mediaRepository) Update(ctx context.Context, id int, m *domain.Media) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE media
		 SET nama = ?, tipe = ?, file = ?, deskripsi = ?, thumbnail = ?
		 WHERE id = ?`,
		m.Nama, m.Tipe, m.File, m.Deskripsi, m.Thumbnail, id)
	return err
}

func (r *mediaRepository) Delete(ctx context.Context, id int) (bool, error) {
	return execAffected(r.db.ExecContext(ctx, "DELETE FROM media WHERE id = ?", id))
}
