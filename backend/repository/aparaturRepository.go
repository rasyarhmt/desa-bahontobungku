package repository

import (
	"context"
	"database/sql"

	"github.com/rasyarhmt/desa-bahontobungku/domain"
)

type aparaturRepository struct {
	db *sql.DB
}

func NewAparaturRepository(db *sql.DB) domain.AparaturRepository {
	return &aparaturRepository{db: db}
}

const aparaturSelect = `
	SELECT id, nama, nip, jabatan, telepon, foto, created_at, updated_at
	FROM aparatur`

const aparaturOrder = `
	ORDER BY
		CASE
			WHEN jabatan LIKE 'Kepala Desa' THEN 1
			WHEN jabatan LIKE '%Sekretaris%' THEN 2
			WHEN jabatan LIKE '%Kepala%' THEN 3
			WHEN jabatan LIKE '%Bendahara%' THEN 4
			ELSE 99
		END,
		nama ASC`

func scanAparatur(row rowScanner) (*domain.Aparatur, error) {
	var a domain.Aparatur
	var nip, telepon, foto sql.NullString

	dest := []interface{}{
		&a.ID, &a.Nama, &nip, &a.Jabatan, &telepon, &foto,
		&a.CreatedAt, &a.UpdatedAt,
	}
	if err := row.Scan(dest...); err != nil {
		return nil, err
	}
	if nip.Valid {
		a.Nip = nip.String
	}
	if telepon.Valid {
		a.Telepon = telepon.String
	}
	if foto.Valid {
		a.Foto = foto.String
	}
	return &a, nil
}

func (r *aparaturRepository) Create(ctx context.Context, a *domain.Aparatur) error {
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO aparatur (nama, nip, jabatan, telepon, foto)
		 VALUES (?, ?, ?, ?, ?)`,
		a.Nama, a.Nip, a.Jabatan, a.Telepon, a.Foto)
	return err
}

func (r *aparaturRepository) GetAll(ctx context.Context) ([]domain.Aparatur, error) {
	rows, err := r.db.QueryContext(ctx, aparaturSelect+aparaturOrder)
	if err != nil {
		return nil, err
	}
	return scanAll(rows, scanAparatur)
}

func (r *aparaturRepository) GetByID(ctx context.Context, id int) (*domain.Aparatur, error) {
	return scanOne(r.db.QueryRowContext(ctx, aparaturSelect+" WHERE id = ?", id), scanAparatur)
}

func (r *aparaturRepository) GetByNIP(ctx context.Context, nip string) (*domain.Aparatur, error) {
	return scanOne(r.db.QueryRowContext(ctx, aparaturSelect+" WHERE nip = ?", nip), scanAparatur)
}

func (r *aparaturRepository) Update(ctx context.Context, id int, a *domain.Aparatur) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE aparatur
		 SET nama = ?, nip = ?, jabatan = ?, telepon = ?, foto = ?
		 WHERE id = ?`,
		a.Nama, a.Nip, a.Jabatan, a.Telepon, a.Foto, id)
	return err
}

func (r *aparaturRepository) Delete(ctx context.Context, id int) (bool, error) {
	return execAffected(r.db.ExecContext(ctx, "DELETE FROM aparatur WHERE id = ?", id))
}
