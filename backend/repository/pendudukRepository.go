package repository

import (
	"context"
	"database/sql"

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
		p.nomor_kk, p.jenisKelamin, p.agama, p.id_status_keluarga, p.id_kepalakeluarga, p.created_at, p.updated_at,
		sk.nama AS status_nama,
		kk.nama AS kk_nama
		FROM penduduk p
		LEFT JOIN status_keluarga sk ON sk.id = p.id_status_keluarga
		LEFT JOIN penduduk kk ON kk.id = p.id_kepalakeluarga`

func scanPenduduk(row rowScanner) (*domain.Penduduk, error) {
	var p domain.Penduduk
	var alamat, tanggalLahir, tempatLahir, nomorKK, agama, statusNama, kkNama sql.NullString
	var statusID, kkID sql.NullInt64

	dest := []interface{}{
		&p.ID, &p.NIKHash, &p.NIK, &p.Nama, &alamat, &tanggalLahir, &tempatLahir,
		&nomorKK, &p.JenisKelamin, &agama, &statusID, &kkID, &p.CreatedAt, &p.UpdatedAt,
		&statusNama, &kkNama,
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
	if statusID.Valid {
		id := int(statusID.Int64)
		p.IDStatusKeluarga = &id
	}
	if statusNama.Valid {
		p.StatusNama = statusNama.String
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
		`INSERT INTO penduduk (nik_hash, nik, nama, alamat, tanggalLahir, tempatLahir, nomor_kk, jenisKelamin, agama, id_status_keluarga, id_kepalakeluarga)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		p.NIKHash, p.NIK, p.Nama, p.Alamat, p.TanggalLahir, p.TempatLahir, p.NoKK,
		p.JenisKelamin, p.Agama, p.IDStatusKeluarga, p.IDKepalakeluarga)
	return err
}

func (r *pendudukRepository) GetByID(ctx context.Context, id int) (*domain.Penduduk, error) {
	return scanOne(r.db.QueryRowContext(ctx, pendudukSelect+" WHERE p.id = ?", id), scanPenduduk)
}

func (r *pendudukRepository) GetByNIKHash(ctx context.Context, nikHash string) (*domain.Penduduk, error) {
	return scanOne(r.db.QueryRowContext(ctx, pendudukSelect+" WHERE p.nik_hash = ?", nikHash), scanPenduduk)
}

func (r *pendudukRepository) GetAll(ctx context.Context) ([]domain.Penduduk, error) {
	rows, err := r.db.QueryContext(ctx, pendudukSelect+" ORDER BY p.id ASC")
	if err != nil {
		return nil, err
	}
	return scanAll(rows, scanPenduduk)
}

func (r *pendudukRepository) GetKepalaKeluargaByStatusID(ctx context.Context, statusID int) ([]domain.Penduduk, error) {
	rows, err := r.db.QueryContext(ctx,
		pendudukSelect+" WHERE p.id_status_keluarga = ? ORDER BY p.id ASC", statusID)
	if err != nil {
		return nil, err
	}
	return scanAll(rows, scanPenduduk)
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
		     jenisKelamin = ?, agama = ?, id_status_keluarga = ?, id_kepalakeluarga = ?
		 WHERE id = ?`,
		p.NIKHash, p.NIK, p.Nama, p.Alamat, p.TanggalLahir, p.TempatLahir, p.NoKK,
		p.JenisKelamin, p.Agama, p.IDStatusKeluarga, p.IDKepalakeluarga, id)
	return err
}

func (r *pendudukRepository) Delete(ctx context.Context, nikHash string) (bool, error) {
	return execAffected(r.db.ExecContext(ctx, "DELETE FROM penduduk WHERE nik_hash = ?", nikHash))
}

func (r *pendudukRepository) CountTotal(ctx context.Context) (int, error) {
	var count int
	err := r.db.QueryRowContext(ctx, "SELECT COUNT(*) FROM penduduk").Scan(&count)
	return count, err
}

func (r *pendudukRepository) CountByStatusID(ctx context.Context, statusID int) (int, error) {
	var count int
	err := r.db.QueryRowContext(ctx,
		"SELECT COUNT(*) FROM penduduk WHERE id_status_keluarga = ?", statusID).Scan(&count)
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
