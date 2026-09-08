package repository

import (
	"context"
	"database/sql"
	"errors"

	"github.com/rasyarhmt/desa-bahontobungku/domain"
)

type logCetakSuratRepository struct {
	db *sql.DB
}

func NewLogCetakSuratRepository(db *sql.DB) domain.LogCetakSuratRepository {
	return &logCetakSuratRepository{db: db}
}

const logCetakSuratSelect = `
	SELECT l.id, l.kode_unik, l.id_template, l.id_pelayanan,
	       COALESCE(t.nama_template, ''), COALESCE(p.nama_layanan, ''),
	       l.nama_pemohon, l.nik_pemohon,
	       l.file, l.nomor_surat, l.status, l.created_at, l.updated_at
		FROM log_cetak_surat l
		LEFT JOIN surat_template t ON t.id = l.id_template
		LEFT JOIN pelayanan p ON p.id = l.id_pelayanan`

type logCetakSuratScanner interface {
	Scan(dest ...interface{}) error
}

func scanLogCetakSurat(row logCetakSuratScanner) (*domain.LogCetakSurat, error) {
	var l domain.LogCetakSurat
	var idTemplate sql.NullInt64
	var idPelayanan sql.NullInt64
	var nik sql.NullString
	var file sql.NullString
	var nomorSurat sql.NullString

	dest := []interface{}{
		&l.ID, &l.KodeUnik, &idTemplate, &idPelayanan,
		&l.NamaTemplate, &l.NamaLayanan,
		&l.NamaPemohon, &nik, &file, &nomorSurat, &l.Status, &l.CreatedAt, &l.UpdatedAt,
	}
	if err := row.Scan(dest...); err != nil {
		return nil, err
	}

	if idTemplate.Valid {
		v := int(idTemplate.Int64)
		l.IDTemplate = &v
	}
	if idPelayanan.Valid {
		v := int(idPelayanan.Int64)
		l.IDPelayanan = &v
	}
	l.NikPemohon = ""
	if nik.Valid {
		l.NikPemohon = nik.String
	}
	l.File = ""
	if file.Valid {
		l.File = file.String
	}
	if nomorSurat.Valid {
		l.NomorSurat = &nomorSurat.String
	}
	return &l, nil
}

func (r *logCetakSuratRepository) Create(ctx context.Context, l *domain.LogCetakSurat) (int, error) {
	result, err := r.db.ExecContext(ctx,
		`INSERT INTO log_cetak_surat (kode_unik, id_template, id_pelayanan, nama_pemohon, nik_pemohon, file, status)
		 VALUES (?, ?, ?, ?, ?, ?, ?)`,
		l.KodeUnik, l.IDTemplate, l.IDPelayanan, l.NamaPemohon, l.NikPemohon, l.File, l.Status)
	if err != nil {
		return 0, err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}
	return int(id), nil
}

func (r *logCetakSuratRepository) GetAll(ctx context.Context) ([]domain.LogCetakSurat, error) {
	rows, err := r.db.QueryContext(ctx, logCetakSuratSelect+" ORDER BY id DESC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := make([]domain.LogCetakSurat, 0)
	for rows.Next() {
		l, err := scanLogCetakSurat(rows)
		if err != nil {
			return nil, err
		}
		result = append(result, *l)
	}
	return result, rows.Err()
}

func (r *logCetakSuratRepository) GetByID(ctx context.Context, id int) (*domain.LogCetakSurat, error) {
	row := r.db.QueryRowContext(ctx, logCetakSuratSelect+" WHERE l.id = ?", id)
	l, err := scanLogCetakSurat(row)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return l, nil
}

func (r *logCetakSuratRepository) GetByKodeUnik(ctx context.Context, kode string) (*domain.LogCetakSurat, error) {
	row := r.db.QueryRowContext(ctx, logCetakSuratSelect+" WHERE l.kode_unik = ?", kode)
	l, err := scanLogCetakSurat(row)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return l, nil
}

func (r *logCetakSuratRepository) SetDiresmikan(ctx context.Context, id int, nomorSurat *string) error {
	_, err := r.db.ExecContext(ctx,
		"UPDATE log_cetak_surat SET status = ?, nomor_surat = ? WHERE id = ?",
		domain.LogCetakStatusDiresmikan, nomorSurat, id)
	return err
}
