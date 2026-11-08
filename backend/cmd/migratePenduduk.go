package cmd

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"os"
	"strings"
	"time"

	_ "github.com/go-sql-driver/mysql"
	"github.com/rasyarhmt/desa-bahontobungku/config"
	"github.com/rasyarhmt/desa-bahontobungku/utils"
	"github.com/spf13/cobra"
)

var (
	pendudukOldDSN string
	pendudukDryRun bool
)

type oldPendudukRow struct {
	ID               int
	Nama             string
	NIK              string
	Alamat           string
	TanggalLahir     string
	JenisKelamin     string
	Agama            string
	IDKepalaKeluarga *int
	Status           string
}

type preparedPenduduk struct {
	Old          oldPendudukRow
	NIKHash      string
	EncNIK       string
	EncNama      string
	EncAlamat    string
	JenisKelamin string
	StatusID     *int
}

func loadOldPenduduk(ctx context.Context, dsn string) ([]oldPendudukRow, error) {
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, fmt.Errorf("membuka koneksi DB lama: %w", err)
	}
	defer db.Close()

	db.SetMaxOpenConns(2)
	if err := db.PingContext(ctx); err != nil {
		return nil, fmt.Errorf("ping DB lama: %w", err)
	}

	rows, err := db.QueryContext(ctx, `
		SELECT id, nama, nik,
		       COALESCE(alamat, ''),
		       DATE_FORMAT(tanggalLahir, '%Y-%m-%d'),
		       COALESCE(jenisKelamin, ''),
		       COALESCE(agama, ''),
		       id_kepalakeluarga,
		       COALESCE(status, '')
		FROM penduduk
		ORDER BY id ASC`)
	if err != nil {
		return nil, fmt.Errorf("query penduduk lama: %w", err)
	}
	defer rows.Close()

	result := make([]oldPendudukRow, 0)
	for rows.Next() {
		var (
			o       oldPendudukRow
			tanggal sql.NullString
			kkID    sql.NullInt64
		)
		if err := rows.Scan(
			&o.ID, &o.Nama, &o.NIK, &o.Alamat,
			&tanggal, &o.JenisKelamin, &o.Agama, &kkID, &o.Status,
		); err != nil {
			return nil, fmt.Errorf("scan penduduk lama: %w", err)
		}
		if tanggal.Valid {
			o.TanggalLahir = tanggal.String
		}
		if kkID.Valid {
			id := int(kkID.Int64)
			o.IDKepalaKeluarga = &id
		}
		result = append(result, o)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterasi penduduk lama: %w", err)
	}
	return result, nil
}

func loadStatusKeluargaMap(ctx context.Context, db *sql.DB) (map[string]int, error) {
	rows, err := db.QueryContext(ctx, "SELECT id, nama FROM status_keluarga")
	if err != nil {
		return nil, fmt.Errorf("query status_keluarga: %w", err)
	}
	defer rows.Close()

	result := make(map[string]int)
	for rows.Next() {
		var (
			id   int
			nama string
		)
		if err := rows.Scan(&id, &nama); err != nil {
			return nil, fmt.Errorf("scan status_keluarga: %w", err)
		}
		result[strings.ToLower(strings.TrimSpace(nama))] = id
	}
	return result, rows.Err()
}

func normalizeJenisKelaminPenduduk(value string) (string, error) {
	switch strings.ToLower(strings.TrimSpace(value)) {
	case "laki-laki", "laki laki":
		return "laki-laki", nil
	case "perempuan":
		return "perempuan", nil
	default:
		return "", fmt.Errorf("jenis kelamin tidak dikenal: %q", value)
	}
}

func nullableString(value string) interface{} {
	if strings.TrimSpace(value) == "" {
		return nil
	}
	return value
}

// Kalau nilai sudah bisa didekripsi dengan KEK saat ini, anggap sudah terenkripsi.
func encryptIfPlaintext(value string, key []byte) (string, error) {
	if strings.TrimSpace(value) == "" {
		return "", nil
	}
	if _, err := utils.DecryptString(value, key); err == nil {
		return value, nil
	}
	return utils.EncryptString(value, key)
}

func runMigratePenduduk() error {
	if config.AppConfig == nil || strings.TrimSpace(config.AppConfig.MasterKEK) == "" {
		return errors.New("MasterKEK belum di-set pada environment")
	}

	dsn := strings.TrimSpace(pendudukOldDSN)
	if dsn == "" {
		dsn = strings.TrimSpace(os.Getenv("OLD_DB_DSN"))
	}
	if dsn == "" {
		return errors.New("DSN DB lama kosong: isi --old-dsn atau env OLD_DB_DSN")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()

	oldRows, err := loadOldPenduduk(ctx, dsn)
	if err != nil {
		return err
	}
	if len(oldRows) == 0 {
		fmt.Println("Tidak ada data pada tabel penduduk lama.")
		return nil
	}

	statusMap, err := loadStatusKeluargaMap(ctx, config.DB)
	if err != nil {
		return err
	}

	key := utils.GetMasterKEK()

	prepared := make([]preparedPenduduk, 0, len(oldRows))
	seenHash := make(map[string]int, len(oldRows))
	oldStatusByID := make(map[int]string, len(oldRows))
	warnings := make([]string, 0)

	for _, o := range oldRows {
		rawNIK := strings.TrimSpace(o.NIK)
		plainNIK := rawNIK
		encNIK := ""

		if rawNIK != "" {
			if dec, derr := utils.DecryptString(rawNIK, key); derr == nil {
				plainNIK = strings.TrimSpace(dec)
				encNIK = rawNIK
			} else {
				encNIK, err = utils.EncryptString(rawNIK, key)
				if err != nil {
					return fmt.Errorf("enkripsi NIK id lama %d: %w", o.ID, err)
				}
			}
		}

		nikHash := utils.HashHex(plainNIK)
		if prev, exists := seenHash[nikHash]; exists {
			return fmt.Errorf("NIK duplikat setelah normalisasi (id lama %d dan %d)", prev, o.ID)
		}
		seenHash[nikHash] = o.ID

		if len(plainNIK) != 16 {
			warnings = append(warnings, fmt.Sprintf("id lama %d: NIK bukan 16 digit", o.ID))
		}

		encNama, err := encryptIfPlaintext(strings.TrimSpace(o.Nama), key)
		if err != nil {
			return fmt.Errorf("enkripsi nama id lama %d: %w", o.ID, err)
		}
		encAlamat, err := encryptIfPlaintext(o.Alamat, key)
		if err != nil {
			return fmt.Errorf("enkripsi alamat id lama %d: %w", o.ID, err)
		}

		jenisKelamin, err := normalizeJenisKelaminPenduduk(o.JenisKelamin)
		if err != nil {
			return fmt.Errorf("id lama %d: %w", o.ID, err)
		}

		statusKey := strings.ToLower(strings.TrimSpace(o.Status))
		var statusID *int
		if statusKey != "" {
			id, ok := statusMap[statusKey]
			if !ok {
				return fmt.Errorf("status %q (id lama %d) belum ada di tabel status_keluarga", o.Status, o.ID)
			}
			statusID = &id
		} else {
			warnings = append(warnings, fmt.Sprintf("id lama %d: status kosong", o.ID))
		}
		oldStatusByID[o.ID] = statusKey

		if statusKey == "kepala keluarga" && o.IDKepalaKeluarga != nil {
			warnings = append(warnings, fmt.Sprintf("id lama %d: status kepala keluarga tapi id_kepalakeluarga terisi", o.ID))
		}
		if o.TanggalLahir == "0000-00-00" {
			warnings = append(warnings, fmt.Sprintf("id lama %d: tanggal lahir 0000-00-00", o.ID))
		}

		prepared = append(prepared, preparedPenduduk{
			Old:          o,
			NIKHash:      nikHash,
			EncNIK:       encNIK,
			EncNama:      encNama,
			EncAlamat:    encAlamat,
			JenisKelamin: jenisKelamin,
			StatusID:     statusID,
		})
	}

	tx, err := config.DB.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("begin transaksi: %w", err)
	}
	defer tx.Rollback()

	idMap := make(map[int]int, len(prepared))
	var inserted, skipped int

	for _, p := range prepared {
		var existingID int
		err := tx.QueryRowContext(ctx,
			"SELECT id FROM penduduk WHERE nik_hash = ?", p.NIKHash).Scan(&existingID)
		if err == nil {
			idMap[p.Old.ID] = existingID
			skipped++
			continue
		}
		if !errors.Is(err, sql.ErrNoRows) {
			return fmt.Errorf("cek NIK id lama %d: %w", p.Old.ID, err)
		}

		var statusID interface{}
		if p.StatusID != nil {
			statusID = *p.StatusID
		}

		res, err := tx.ExecContext(ctx, `
			INSERT INTO penduduk
				(nik_hash, nik, nama, alamat, tanggalLahir, tempatLahir, nomor_kk,
				 jenisKelamin, agama, id_status_keluarga, id_kepalakeluarga)
			VALUES (?, ?, ?, ?, ?, NULL, NULL, ?, ?, ?, NULL)`,
			p.NIKHash,
			p.EncNIK,
			p.EncNama,
			nullableString(p.EncAlamat),
			nullableString(p.Old.TanggalLahir),
			p.JenisKelamin,
			nullableString(strings.TrimSpace(p.Old.Agama)),
			statusID,
		)
		if err != nil {
			return fmt.Errorf("insert penduduk id lama %d: %w", p.Old.ID, err)
		}

		newID, err := res.LastInsertId()
		if err != nil {
			return fmt.Errorf("last insert id lama %d: %w", p.Old.ID, err)
		}
		idMap[p.Old.ID] = int(newID)
		inserted++
	}

	var relLinked, relSkipped int
	for _, p := range prepared {
		kkOld := p.Old.IDKepalaKeluarga
		if kkOld == nil {
			continue
		}
		if *kkOld == p.Old.ID {
			warnings = append(warnings, fmt.Sprintf("id lama %d: id_kepalakeluarga menunjuk dirinya sendiri", p.Old.ID))
			relSkipped++
			continue
		}

		kkStatus, found := oldStatusByID[*kkOld]
		if !found {
			warnings = append(warnings, fmt.Sprintf("id lama %d: id_kepalakeluarga=%d tidak ditemukan", p.Old.ID, *kkOld))
			relSkipped++
			continue
		}
		if kkStatus != "" && kkStatus != "kepala keluarga" {
			warnings = append(warnings, fmt.Sprintf("id lama %d: id_kepalakeluarga=%d berstatus %q, bukan kepala keluarga", p.Old.ID, *kkOld, kkStatus))
		}

		newKK, ok := idMap[*kkOld]
		if !ok {
			relSkipped++
			continue
		}
		newSelf, ok := idMap[p.Old.ID]
		if !ok {
			relSkipped++
			continue
		}

		if _, err := tx.ExecContext(ctx,
			"UPDATE penduduk SET id_kepalakeluarga = ? WHERE id = ? AND id_kepalakeluarga IS NULL",
			newKK, newSelf,
		); err != nil {
			return fmt.Errorf("update relasi id lama %d: %w", p.Old.ID, err)
		}
		relLinked++
	}

	fmt.Printf("Total data lama        : %d\n", len(oldRows))
	fmt.Printf("Insert baru            : %d\n", inserted)
	fmt.Printf("Dilewati (sudah ada)   : %d\n", skipped)
	fmt.Printf("Relasi KK terhubung    : %d\n", relLinked)
	fmt.Printf("Relasi KK dilewati     : %d\n", relSkipped)

	if len(warnings) > 0 {
		fmt.Printf("Peringatan (%d):\n", len(warnings))
		limit := len(warnings)
		if limit > 50 {
			limit = 50
		}
		for _, w := range warnings[:limit] {
			fmt.Println("  -", w)
		}
		if len(warnings) > limit {
			fmt.Printf("  ... dan %d peringatan lain\n", len(warnings)-limit)
		}
	}

	if pendudukDryRun {
		fmt.Println("DRY RUN: perubahan dibatalkan (rollback).")
		return nil
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("commit: %w", err)
	}
	fmt.Println("Migrasi penduduk selesai.")
	return nil
}

var migratePendudukCmd = &cobra.Command{
	Use:   "migrate:penduduk",
	Short: "Migrasi penduduk dari DB lama (plaintext) ke skema baru (terenkripsi)",
	Run: func(cmd *cobra.Command, args []string) {
		if err := runMigratePenduduk(); err != nil {
			fmt.Fprintln(os.Stderr, "ERROR:", err)
			os.Exit(1)
		}
	},
}

func init() {
	migratePendudukCmd.Flags().StringVar(&pendudukOldDSN, "old-dsn", "", "DSN database lama (atau set env OLD_DB_DSN)")
	migratePendudukCmd.Flags().BoolVar(&pendudukDryRun, "dry-run", false, "jalankan tanpa menyimpan perubahan (rollback)")
	rootCmd.AddCommand(migratePendudukCmd)
}
