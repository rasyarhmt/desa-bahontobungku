package repository

import (
	"context"
	"database/sql"
	"errors"

	"github.com/rasyarhmt/desa-bahontobungku/domain"
)

type pengumumanRepository struct {
	db *sql.DB
}

func NewPengumumanRepository(db *sql.DB) domain.PengumumanRepository {
	return &pengumumanRepository{db: db}
}

const pengumumanSelect = `
	SELECT id, judul, isi, tanggalMulai, tanggalSelesai, created_at, updated_at
	FROM pengumuman`

const pengumumanOrder = " ORDER BY tanggalMulai DESC, id DESC"

func scanPengumuman(row rowScanner) (*domain.Pengumuman, error) {
	var p domain.Pengumuman
	var tanggalMulai, tanggalSelesai sql.NullTime

	dest := []interface{}{
		&p.ID, &p.Judul, &p.Isi, &tanggalMulai, &tanggalSelesai,
		&p.CreatedAt, &p.UpdatedAt,
	}
	if err := row.Scan(dest...); err != nil {
		return nil, err
	}

	if tanggalMulai.Valid {
		p.TanggalMulai = tanggalMulai.Time
	}
	if tanggalSelesai.Valid {
		p.TanggalSelesai = tanggalSelesai.Time
	}
	return &p, nil
}

func (r *pengumumanRepository) Create(ctx context.Context, p *domain.Pengumuman) error {
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO pengumuman (judul, isi, tanggalMulai, tanggalSelesai)
		 VALUES (?, ?, ?, ?)`,
		p.Judul, p.Isi, p.TanggalMulai, p.TanggalSelesai)
	return err
}

func (r *pengumumanRepository) GetAll(ctx context.Context) ([]domain.Pengumuman, error) {
	rows, err := r.db.QueryContext(ctx, pengumumanSelect+pengumumanOrder)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := make([]domain.Pengumuman, 0)
	for rows.Next() {
		p, err := scanPengumuman(rows)
		if err != nil {
			return nil, err
		}
		result = append(result, *p)
	}
	return result, rows.Err()
}

func (r *pengumumanRepository) GetByID(ctx context.Context, id int) (*domain.Pengumuman, error) {
	row := r.db.QueryRowContext(ctx, pengumumanSelect+" WHERE id = ?", id)
	p, err := scanPengumuman(row)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return p, nil
}

func (r *pengumumanRepository) Update(ctx context.Context, id int, p *domain.Pengumuman) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE pengumuman
		 SET judul = ?, isi = ?, tanggalMulai = ?, tanggalSelesai = ?
		 WHERE id = ?`,
		p.Judul, p.Isi, p.TanggalMulai, p.TanggalSelesai, id)
	return err
}

func (r *pengumumanRepository) Delete(ctx context.Context, id int) (bool, error) {
	result, err := r.db.ExecContext(ctx, "DELETE FROM pengumuman WHERE id = ?", id)
	if err != nil {
		return false, err
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return false, err
	}
	return affected > 0, nil
}
