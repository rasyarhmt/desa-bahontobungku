package repository

import (
	"context"
	"database/sql"

	"github.com/rasyarhmt/desa-bahontobungku/domain"
)

type pelayananRepository struct {
	db *sql.DB
}

func NewPelayananRepository(db *sql.DB) domain.PelayananRepository {
	return &pelayananRepository{db: db}
}

const pelayananSelect = `
	SELECT id, nama_layanan, deskripsi, id_surat_template, status, created_at, updated_at
		FROM pelayanan`

func scanPelayanan(row rowScanner) (*domain.Pelayanan, error) {
	var p domain.Pelayanan
	var deskripsi sql.NullString

	dest := []interface{}{
		&p.ID, &p.NamaLayanan, &deskripsi, &p.IDSuratTemplate,
		&p.Status, &p.CreatedAt, &p.UpdatedAt,
	}
	if err := row.Scan(dest...); err != nil {
		return nil, err
	}

	p.Deskripsi = ""
	if deskripsi.Valid {
		p.Deskripsi = deskripsi.String
	}
	return &p, nil
}

func (r *pelayananRepository) Create(ctx context.Context, p *domain.Pelayanan) (int, error) {
	return execReturningID(r.db.ExecContext(ctx,
		`INSERT INTO pelayanan (nama_layanan, deskripsi, id_surat_template, status)
		 VALUES (?, ?, ?, ?)`,
		p.NamaLayanan, p.Deskripsi, p.IDSuratTemplate, p.Status))
}

func (r *pelayananRepository) GetAll(ctx context.Context) ([]domain.Pelayanan, error) {
	rows, err := r.db.QueryContext(ctx, pelayananSelect+" ORDER BY id ASC")
	if err != nil {
		return nil, err
	}
	return scanAll(rows, scanPelayanan)
}

func (r *pelayananRepository) GetByID(ctx context.Context, id int) (*domain.Pelayanan, error) {
	return scanOne(r.db.QueryRowContext(ctx, pelayananSelect+" WHERE id = ?", id), scanPelayanan)
}

func (r *pelayananRepository) Update(ctx context.Context, id int, p *domain.Pelayanan) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE pelayanan
		 SET nama_layanan = ?, deskripsi = ?, id_surat_template = ?
		 WHERE id = ?`,
		p.NamaLayanan, p.Deskripsi, p.IDSuratTemplate, id)
	return err
}

func (r *pelayananRepository) Delete(ctx context.Context, id int) (bool, error) {
	return execAffected(r.db.ExecContext(ctx, "DELETE FROM pelayanan WHERE id = ?", id))
}

func (r *pelayananRepository) UpdateStatus(ctx context.Context, id int, status string) error {
	_, err := r.db.ExecContext(ctx, "UPDATE pelayanan SET status = ? WHERE id = ?", status, id)
	return err
}
