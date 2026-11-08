package repository

import (
	"context"
	"database/sql"

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
	return scanAll(rows, scanPengumuman)
}

func (r *pengumumanRepository) GetByID(ctx context.Context, id int) (*domain.Pengumuman, error) {
	return scanOne(r.db.QueryRowContext(ctx, pengumumanSelect+" WHERE id = ?", id), scanPengumuman)
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
	return execAffected(r.db.ExecContext(ctx, "DELETE FROM pengumuman WHERE id = ?", id))
}
