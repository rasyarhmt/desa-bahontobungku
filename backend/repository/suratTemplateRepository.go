package repository

import (
	"context"
	"database/sql"

	"github.com/rasyarhmt/desa-bahontobungku/domain"
)

type suratTemplateRepository struct {
	db *sql.DB
}

func NewSuratTemplateRepository(db *sql.DB) domain.SuratTemplateRepository {
	return &suratTemplateRepository{db: db}
}

const suratTemplateSelect = `
	SELECT id, kode, nama_template, file_template, deskripsi, status, created_at, updated_at
		FROM surat_template`

func scanSuratTemplate(row rowScanner) (*domain.SuratTemplate, error) {
	var t domain.SuratTemplate
	var deskripsi sql.NullString

	dest := []interface{}{
		&t.ID, &t.Kode, &t.NamaTemplate, &t.FileTemplate,
		&deskripsi, &t.Status, &t.CreatedAt, &t.UpdatedAt,
	}
	if err := row.Scan(dest...); err != nil {
		return nil, err
	}

	t.Deskripsi = ""
	if deskripsi.Valid {
		t.Deskripsi = deskripsi.String
	}
	return &t, nil
}

func (r *suratTemplateRepository) Create(ctx context.Context, t *domain.SuratTemplate) (int, error) {
	return execReturningID(r.db.ExecContext(ctx,
		`INSERT INTO surat_template (kode, nama_template, file_template, deskripsi, status)
		 VALUES (?, ?, ?, ?, ?)`,
		t.Kode, t.NamaTemplate, t.FileTemplate, t.Deskripsi, t.Status))
}

func (r *suratTemplateRepository) GetAll(ctx context.Context) ([]domain.SuratTemplate, error) {
	rows, err := r.db.QueryContext(ctx, suratTemplateSelect+" ORDER BY id ASC")
	if err != nil {
		return nil, err
	}
	return scanAll(rows, scanSuratTemplate)
}

func (r *suratTemplateRepository) GetByID(ctx context.Context, id int) (*domain.SuratTemplate, error) {
	return scanOne(r.db.QueryRowContext(ctx, suratTemplateSelect+" WHERE id = ?", id), scanSuratTemplate)
}

func (r *suratTemplateRepository) GetByKode(ctx context.Context, kode string) (*domain.SuratTemplate, error) {
	return scanOne(r.db.QueryRowContext(ctx, suratTemplateSelect+" WHERE kode = ?", kode), scanSuratTemplate)
}

func (r *suratTemplateRepository) Update(ctx context.Context, id int, t *domain.SuratTemplate) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE surat_template
		 SET kode = ?, nama_template = ?, file_template = ?, deskripsi = ?
		 WHERE id = ?`,
		t.Kode, t.NamaTemplate, t.FileTemplate, t.Deskripsi, id)
	return err
}

func (r *suratTemplateRepository) Delete(ctx context.Context, id int) (bool, error) {
	return execAffected(r.db.ExecContext(ctx, "DELETE FROM surat_template WHERE id = ?", id))
}

func (r *suratTemplateRepository) UpdateStatus(ctx context.Context, id int, status string) error {
	_, err := r.db.ExecContext(ctx, "UPDATE surat_template SET status = ? WHERE id = ?", status, id)
	return err
}
