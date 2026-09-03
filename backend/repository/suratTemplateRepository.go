package repository

import (
	"context"
	"database/sql"
	"errors"

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

type suratTemplateScanner interface {
	Scan(dest ...interface{}) error
}

func scanSuratTemplate(row suratTemplateScanner) (*domain.SuratTemplate, error) {
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
	result, err := r.db.ExecContext(ctx,
		`INSERT INTO surat_template (kode, nama_template, file_template, deskripsi, status)
		 VALUES (?, ?, ?, ?, ?)`,
		t.Kode, t.NamaTemplate, t.FileTemplate, t.Deskripsi, t.Status)
	if err != nil {
		return 0, err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}
	return int(id), nil
}

func (r *suratTemplateRepository) GetAll(ctx context.Context) ([]domain.SuratTemplate, error) {
	rows, err := r.db.QueryContext(ctx, suratTemplateSelect+" ORDER BY id ASC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := make([]domain.SuratTemplate, 0)
	for rows.Next() {
		t, err := scanSuratTemplate(rows)
		if err != nil {
			return nil, err
		}
		result = append(result, *t)
	}
	return result, rows.Err()
}

func (r *suratTemplateRepository) GetByID(ctx context.Context, id int) (*domain.SuratTemplate, error) {
	row := r.db.QueryRowContext(ctx, suratTemplateSelect+" WHERE id = ?", id)
	t, err := scanSuratTemplate(row)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return t, nil
}

func (r *suratTemplateRepository) GetByKode(ctx context.Context, kode string) (*domain.SuratTemplate, error) {
	row := r.db.QueryRowContext(ctx, suratTemplateSelect+" WHERE kode = ?", kode)
	t, err := scanSuratTemplate(row)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return t, nil
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
	result, err := r.db.ExecContext(ctx, "DELETE FROM surat_template WHERE id = ?", id)
	if err != nil {
		return false, err
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return false, err
	}
	return affected > 0, nil
}

func (r *suratTemplateRepository) UpdateStatus(ctx context.Context, id int, status string) error {
	_, err := r.db.ExecContext(ctx, "UPDATE surat_template SET status = ? WHERE id = ?", status, id)
	return err
}
