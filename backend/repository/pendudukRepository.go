package repository

import (
	"context"
	"database/sql"
	"errors"

	"github.com/rasyarhmt/desa-bahontobungku/domain"
)

type pendudukRepository struct {
	db *sql.DB
}

func NewPendudukRepository(db *sql.DB) domain.PendudukRepository {
	return &pendudukRepository{db: db}
}

const pendudukSelect = `
	SELECT p.id, p.nik_hash, p.nik, p.nama, p.alamat, p.tanggalLahir, p.tempatLahir,
		p.nomor_kk, p.jenisKelamin, p.agama, p.status, p.id_kepalakeluarga, p.created_at, p.updated_at,
		kk.nama AS kk_nama
		FROM penduduk p
		LEFT JOIN penduduk kk ON kk.id = p.id_kepalakeluarga`

type rowScanner interface {
	Scan(dest ...interface{}) error
}

func scanPenduduk(row rowScanner) (*domain.Penduduk, error) {
	var p domain.Penduduk
	var alamat, tanggalLahir, tempatLahir, nomorKK, agama, status, kkNama sql.NullString
	var kkID sql.NullInt64

	dest := []interface{}{
		&p.ID, &p.NIKHash, &p.NIK, &p.Nama, &alamat, &tanggalLahir, &tempatLahir,
		&nomorKK, &p.JenisKelamin, &agama, &status, &kkID, &p.CreatedAt, &p.UpdatedAt, &kkNama,
	}
	if err := row.Scan(dest...); err != nil {
		return nil, err
	}

	if alamat.Valid {
		p.Alamat = alamat.String
	}
	if tanggalLahir.Valid {
		p.TanggalLahir = tanggalLahir.String
	}
	if tempatLahir.Valid {
		p.TempatLahir = tempatLahir.String
	}
	if nomorKK.Valid {
		p.NoKK = nomorKK.String
	}
	if agama.Valid {
		p.Agama = agama.String
	}
	if status.Valid {
		p.Status = status.String
	}
	if kkID.Valid {
		id := int(kkID.Int64)
		p.IDKepalakeluarga = &id
	}
	if kkNama.Valid {
		p.KKNama = kkNama.String
	}
	return &p, nil
}

func (r *pendudukRepository) Create(ctx context.Context, p *domain.Penduduk) error {
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO penduduk (nik_hash, nik, nama, alamat, tanggalLahir, tempatLahir, nomor_kk, jenisKelamin, agama, status, id_kepalakeluarga)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		p.NIKHash, p.NIK, p.Nama, p.Alamat, p.TanggalLahir, p.TempatLahir, p.NoKK,
		p.JenisKelamin, p.Agama, p.Status, p.IDKepalakeluarga)
	return err
}

func (r *pendudukRepository) GetByID(ctx context.Context, id int) (*domain.Penduduk, error) {
	row := r.db.QueryRowContext(ctx, pendudukSelect+" WHERE p.id = ?", id)
	p, err := scanPenduduk(row)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return p, nil
}

func (r *pendudukRepository) GetByNIKHash(ctx context.Context, nikHash string) (*domain.Penduduk, error) {
	row := r.db.QueryRowContext(ctx, pendudukSelect+" WHERE p.nik_hash = ?", nikHash)
	p, err := scanPenduduk(row)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return p, nil
}

func (r *pendudukRepository) GetAll(ctx context.Context) ([]domain.Penduduk, error) {
	rows, err := r.db.QueryContext(ctx, pendudukSelect+" ORDER BY p.id ASC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := make([]domain.Penduduk, 0)
	for rows.Next() {
		p, err := scanPenduduk(rows)
		if err != nil {
			return nil, err
		}
		result = append(result, *p)
	}
	return result, rows.Err()
}

func (r *pendudukRepository) GetKepalaKeluarga(ctx context.Context) ([]domain.Penduduk, error) {
	rows, err := r.db.QueryContext(ctx, pendudukSelect+" WHERE p.status = ? ORDER BY p.id ASC", domain.StatusKepalaKeluarga)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := make([]domain.Penduduk, 0)
	for rows.Next() {
		p, err := scanPenduduk(rows)
		if err != nil {
			return nil, err
		}
		result = append(result, *p)
	}
	return result, rows.Err()
}

func (r *pendudukRepository) GetStatsRows(ctx context.Context) ([]domain.StatsPenduduk, error) {
	rows, err := r.db.QueryContext(ctx,
		"SELECT id, tanggalLahir, agama FROM penduduk")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := make([]domain.StatsPenduduk, 0)
	for rows.Next() {
		var s domain.StatsPenduduk
		var tanggalLahir, agama sql.NullString
		if err := rows.Scan(&s.ID, &tanggalLahir, &agama); err != nil {
			return nil, err
		}
		if tanggalLahir.Valid {
			s.TanggalLahir = tanggalLahir.String
		}
		if agama.Valid {
			s.Agama = agama.String
		}
		result = append(result, s)
	}
	return result, rows.Err()
}

func (r *pendudukRepository) Update(ctx context.Context, id int, p *domain.Penduduk) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE penduduk
		 SET nik_hash = ?, nik = ?, nama = ?, alamat = ?, tanggalLahir = ?, tempatLahir = ?, nomor_kk = ?,
		     jenisKelamin = ?, agama = ?, status = ?, id_kepalakeluarga = ?
		 WHERE id = ?`,
		p.NIKHash, p.NIK, p.Nama, p.Alamat, p.TanggalLahir, p.TempatLahir, p.NoKK,
		p.JenisKelamin, p.Agama, p.Status, p.IDKepalakeluarga, id)
	return err
}

func (r *pendudukRepository) Delete(ctx context.Context, nikHash string) (bool, error) {
	result, err := r.db.ExecContext(ctx, "DELETE FROM penduduk WHERE nik_hash = ?", nikHash)
	if err != nil {
		return false, err
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return false, err
	}
	return affected > 0, nil
}

func (r *pendudukRepository) CountTotal(ctx context.Context) (int, error) {
	var count int
	err := r.db.QueryRowContext(ctx, "SELECT COUNT(*) FROM penduduk").Scan(&count)
	return count, err
}

func (r *pendudukRepository) CountByStatus(ctx context.Context, status string) (int, error) {
	var count int
	err := r.db.QueryRowContext(ctx, "SELECT COUNT(*) FROM penduduk WHERE status = ?", status).Scan(&count)
	return count, err
}

func (r *pendudukRepository) CountByJenisKelamin(ctx context.Context, jenisKelamin string) (int, error) {
	var count int
	err := r.db.QueryRowContext(ctx, "SELECT COUNT(*) FROM penduduk WHERE jenisKelamin = ?", jenisKelamin).Scan(&count)
	return count, err
}

func (r *pendudukRepository) CountDependents(ctx context.Context, kepalaKeluargaID int) (int, error) {
	var count int
	err := r.db.QueryRowContext(ctx,
		"SELECT COUNT(*) FROM penduduk WHERE id_kepalakeluarga = ?", kepalaKeluargaID).Scan(&count)
	return count, err
}
