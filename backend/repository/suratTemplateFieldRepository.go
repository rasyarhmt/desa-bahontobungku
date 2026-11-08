package repository

import (
	"context"
	"database/sql"
	"encoding/json"
	"strings"

	"github.com/rasyarhmt/desa-bahontobungku/domain"
)

type suratTemplateFieldRepository struct {
	db *sql.DB
}

func NewSuratTemplateFieldRepository(db *sql.DB) domain.SuratTemplateFieldRepository {
	return &suratTemplateFieldRepository{db: db}
}

const suratTemplateFieldSelect = `
	SELECT id, id_template, field_key, label, tipe, options, required, urutan, created_at, updated_at
		FROM surat_template_field`

func scanSuratTemplateField(row rowScanner) (*domain.SuratTemplateField, error) {
	var f domain.SuratTemplateField
	var options sql.NullString

	dest := []interface{}{
		&f.ID, &f.IDTemplate, &f.FieldKey, &f.Label, &f.Tipe,
		&options, &f.Required, &f.Urutan, &f.CreatedAt, &f.UpdatedAt,
	}
	if err := row.Scan(dest...); err != nil {
		return nil, err
	}

	f.Options = []string{}
	if options.Valid && strings.TrimSpace(options.String) != "" {
		_ = json.Unmarshal([]byte(options.String), &f.Options)
	}
	return &f, nil
}

func (r *suratTemplateFieldRepository) GetByTemplateID(
	ctx context.Context,
	templateID int,
) ([]domain.SuratTemplateField, error) {
	rows, err := r.db.QueryContext(ctx,
		suratTemplateFieldSelect+" WHERE id_template = ? ORDER BY urutan ASC, id ASC",
		templateID,
	)
	if err != nil {
		return nil, err
	}
	return scanAll(rows, scanSuratTemplateField)
}

func (r *suratTemplateFieldRepository) SyncFields(
	ctx context.Context,
	templateID int,
	fields []domain.SuratTemplateField,
) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	rows, err := tx.QueryContext(ctx,
		"SELECT id, field_key FROM surat_template_field WHERE id_template = ?",
		templateID,
	)
	if err != nil {
		return err
	}

	existing := make(map[string]int)
	for rows.Next() {
		var id int
		var key string
		if err := rows.Scan(&id, &key); err != nil {
			rows.Close()
			return err
		}
		existing[key] = id
	}
	if err := rows.Close(); err != nil {
		return err
	}
	if err := rows.Err(); err != nil {
		return err
	}

	keep := make(map[string]bool, len(fields))
	for _, f := range fields {
		key := strings.TrimSpace(f.FieldKey)
		if key == "" {
			continue
		}
		keep[key] = true

		options := "[]"
		if len(f.Options) > 0 {
			b, errMarshal := json.Marshal(f.Options)
			if errMarshal != nil {
				return errMarshal
			}
			options = string(b)
		}

		if id, ok := existing[key]; ok {
			if _, err := tx.ExecContext(ctx,
				`UPDATE surat_template_field
				 SET label = ?, tipe = ?, options = ?, required = ?, urutan = ?
				 WHERE id = ?`,
				f.Label, f.Tipe, options, f.Required, f.Urutan, id,
			); err != nil {
				return err
			}
			continue
		}

		if _, err := tx.ExecContext(ctx,
			`INSERT INTO surat_template_field
				(id_template, field_key, label, tipe, options, required, urutan)
			 VALUES (?, ?, ?, ?, ?, ?, ?)`,
			templateID, key, f.Label, f.Tipe, options, f.Required, f.Urutan,
		); err != nil {
			return err
		}
	}

	for key, id := range existing {
		if keep[key] {
			continue
		}
		if _, err := tx.ExecContext(ctx,
			"DELETE FROM surat_template_field WHERE id = ?", id,
		); err != nil {
			return err
		}
	}

	return tx.Commit()
}
