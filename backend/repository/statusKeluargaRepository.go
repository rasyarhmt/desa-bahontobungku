package repository

import (
	"context"
	"database/sql"
	"errors"

	"github.com/rasyarhmt/desa-bahontobungku/domain"
)

type statusKeluargaRepository struct {
	db *sql.DB
}

func NewStatusKeluargaRepository(db *sql.DB) domain.StatusKeluargaRepository {
	return &statusKeluargaRepository{db: db}
}

const statusKeluargaSelect = `
	SELECT id, nama, is_active, created_at, updated_at
		FROM status_keluarga`

func scanStatusKeluarga(row rowScanner) (*domain.StatusKeluarga, error) {
	var s domain.StatusKeluarga
	if err := row.Scan(&s.ID, &s.Nama, &s.IsActive, &s.CreatedAt, &s.UpdatedAt); err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *statusKeluargaRepository) Create(ctx context.Context, s *domain.StatusKeluarga) (int, error) {
	return execReturningID(r.db.ExecContext(ctx,
		"INSERT INTO status_keluarga (nama, is_active) VALUES (?, ?)",
		s.Nama, s.IsActive))
}

func (r *statusKeluargaRepository) GetAll(ctx context.Context) ([]domain.StatusKeluarga, error) {
	rows, err := r.db.QueryContext(ctx, statusKeluargaSelect+" ORDER BY id ASC")
	if err != nil {
		return nil, err
	}
	return scanAll(rows, scanStatusKeluarga)
}

func (r *statusKeluargaRepository) GetByID(ctx context.Context, id int) (*domain.StatusKeluarga, error) {
	return scanOne(r.db.QueryRowContext(ctx, statusKeluargaSelect+" WHERE id = ?", id), scanStatusKeluarga)
}

func (r *statusKeluargaRepository) GetByNama(ctx context.Context, nama string) (*domain.StatusKeluarga, error) {
	return scanOne(r.db.QueryRowContext(ctx, statusKeluargaSelect+" WHERE nama = ?", nama), scanStatusKeluarga)
}

func (r *statusKeluargaRepository) Update(ctx context.Context, id int, s *domain.StatusKeluarga) error {
	_, err := r.db.ExecContext(ctx,
		"UPDATE status_keluarga SET nama = ?, is_active = ? WHERE id = ?",
		s.Nama, s.IsActive, id)
	return err
}

func (r *statusKeluargaRepository) Delete(ctx context.Context, id int) (bool, error) {
	return execAffected(r.db.ExecContext(ctx, "DELETE FROM status_keluarga WHERE id = ?", id))
}

func (r *statusKeluargaRepository) ToggleActive(ctx context.Context, id int) (bool, error) {
	var current bool
	if err := r.db.QueryRowContext(ctx,
		"SELECT is_active FROM status_keluarga WHERE id = ?", id).Scan(&current); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return false, nil
		}
		return false, err
	}

	newValue := !current
	if _, err := r.db.ExecContext(ctx,
		"UPDATE status_keluarga SET is_active = ? WHERE id = ?", newValue, id); err != nil {
		return false, err
	}
	return newValue, nil
}

func (r *statusKeluargaRepository) CountPengguna(ctx context.Context, id int) (int, error) {
	var count int
	err := r.db.QueryRowContext(ctx,
		"SELECT COUNT(*) FROM penduduk WHERE id_status_keluarga = ?", id).Scan(&count)
	return count, err
}
