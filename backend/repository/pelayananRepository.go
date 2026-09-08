package repository

import (
	"context"
	"database/sql"
	"errors"

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

type pelayananScanner interface {
	Scan(dest ...interface{}) error
}

func scanPelayanan(row pelayananScanner) (*domain.Pelayanan, error) {
	var p domain.Pelayanan
	var deskripsi sql.NullString
	var idSuratTemplate sql.NullInt64

	dest := []interface{}{
		&p.ID, &p.NamaLayanan, &deskripsi, &idSuratTemplate,
		&p.Status, &p.CreatedAt, &p.UpdatedAt,
	}
	if err := row.Scan(dest...); err != nil {
		return nil, err
	}

	p.Deskripsi = ""
	if deskripsi.Valid {
		p.Deskripsi = deskripsi.String
	}
	if idSuratTemplate.Valid {
		v := int(idSuratTemplate.Int64)
		p.IDSuratTemplate = &v
	}
	return &p, nil
}

func (r *pelayananRepository) Create(ctx context.Context, p *domain.Pelayanan) (int, error) {
	result, err := r.db.ExecContext(ctx,
		`INSERT INTO pelayanan (nama_layanan, deskripsi, id_surat_template, status)
		 VALUES (?, ?, ?, ?)`,
		p.NamaLayanan, p.Deskripsi, p.IDSuratTemplate, p.Status)
	if err != nil {
		return 0, err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}
	return int(id), nil
}

func (r *pelayananRepository) GetAll(ctx context.Context) ([]domain.Pelayanan, error) {
	rows, err := r.db.QueryContext(ctx, pelayananSelect+" ORDER BY id ASC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := make([]domain.Pelayanan, 0)
	for rows.Next() {
		p, err := scanPelayanan(rows)
		if err != nil {
			return nil, err
		}
		result = append(result, *p)
	}
	return result, rows.Err()
}

func (r *pelayananRepository) GetByID(ctx context.Context, id int) (*domain.Pelayanan, error) {
	row := r.db.QueryRowContext(ctx, pelayananSelect+" WHERE id = ?", id)
	p, err := scanPelayanan(row)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return p, nil
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
	result, err := r.db.ExecContext(ctx, "DELETE FROM pelayanan WHERE id = ?", id)
	if err != nil {
		return false, err
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return false, err
	}
	return affected > 0, nil
}

func (r *pelayananRepository) UpdateStatus(ctx context.Context, id int, status string) error {
	_, err := r.db.ExecContext(ctx, "UPDATE pelayanan SET status = ? WHERE id = ?", status, id)
	return err
}
