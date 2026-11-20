package cmd

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/rasyarhmt/desa-bahontobungku/config"
	"github.com/rasyarhmt/desa-bahontobungku/utils"
	"github.com/spf13/cobra"
)

var encryptBackfillDryRun bool

func runEncryptBackfill() error {
	if config.AppConfig == nil || strings.TrimSpace(config.AppConfig.MasterKEK) == "" {
		return errors.New("MasterKEK belum di-set pada environment")
	}
	key := utils.GetMasterKEK()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Minute)
	defer cancel()

	conn, err := config.NewDB()
	if err != nil {
		return fmt.Errorf("koneksi database: %w", err)
	}
	defer conn.Close()

	tx, err := conn.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("begin transaksi: %w", err)
	}
	defer tx.Rollback()

	pendudukCount, err := backfillPenduduk(ctx, tx, key)
	if err != nil {
		return err
	}
	masukCount, err := backfillSuratMasuk(ctx, tx, key)
	if err != nil {
		return err
	}
	keluarCount, err := backfillSuratKeluar(ctx, tx, key)
	if err != nil {
		return err
	}

	fmt.Printf("penduduk.tanggalLahir/tempatLahir : %d baris\n", pendudukCount)
	fmt.Printf("suratmasuk.pengirim/perihal       : %d baris\n", masukCount)
	fmt.Printf("suratkeluar.penerima/perihal      : %d baris\n", keluarCount)

	if encryptBackfillDryRun {
		fmt.Println("DRY RUN: perubahan dibatalkan (rollback).")
		return nil
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("commit: %w", err)
	}
	fmt.Println("Backfill enkripsi selesai.")
	return nil
}

func encryptColumn(value sql.NullString, key []byte) (sql.NullString, error) {
	if !value.Valid || strings.TrimSpace(value.String) == "" {
		return value, nil
	}
	enc, err := encryptIfPlaintext(value.String, key)
	if err != nil {
		return sql.NullString{}, err
	}
	return sql.NullString{String: enc, Valid: true}, nil
}

func backfillPenduduk(ctx context.Context, tx *sql.Tx, key []byte) (int, error) {
	rows, err := tx.QueryContext(ctx, "SELECT id, tanggalLahir, tempatLahir FROM penduduk")
	if err != nil {
		return 0, fmt.Errorf("query penduduk: %w", err)
	}

	type pendudukRow struct {
		id      int
		tanggal sql.NullString
		tempat  sql.NullString
	}
	items := make([]pendudukRow, 0)
	for rows.Next() {
		var it pendudukRow
		if err := rows.Scan(&it.id, &it.tanggal, &it.tempat); err != nil {
			rows.Close()
			return 0, fmt.Errorf("scan penduduk: %w", err)
		}
		items = append(items, it)
	}
	rows.Close()
	if err := rows.Err(); err != nil {
		return 0, fmt.Errorf("iterasi penduduk: %w", err)
	}

	changed := 0
	for _, it := range items {
		tanggal, err := encryptColumn(it.tanggal, key)
		if err != nil {
			return changed, fmt.Errorf("enkripsi tanggalLahir id %d: %w", it.id, err)
		}
		tempat, err := encryptColumn(it.tempat, key)
		if err != nil {
			return changed, fmt.Errorf("enkripsi tempatLahir id %d: %w", it.id, err)
		}
		if tanggal == it.tanggal && tempat == it.tempat {
			continue
		}
		if _, err := tx.ExecContext(ctx,
			"UPDATE penduduk SET tanggalLahir = ?, tempatLahir = ? WHERE id = ?",
			tanggal, tempat, it.id); err != nil {
			return changed, fmt.Errorf("update penduduk id %d: %w", it.id, err)
		}
		changed++
	}
	return changed, nil
}

func backfillSuratMasuk(ctx context.Context, tx *sql.Tx, key []byte) (int, error) {
	rows, err := tx.QueryContext(ctx, "SELECT id, pengirim, perihal FROM suratmasuk")
	if err != nil {
		return 0, fmt.Errorf("query suratmasuk: %w", err)
	}

	type suratRow struct {
		id     int
		kolom1 sql.NullString
		kolom2 sql.NullString
	}
	items := make([]suratRow, 0)
	for rows.Next() {
		var it suratRow
		if err := rows.Scan(&it.id, &it.kolom1, &it.kolom2); err != nil {
			rows.Close()
			return 0, fmt.Errorf("scan suratmasuk: %w", err)
		}
		items = append(items, it)
	}
	rows.Close()
	if err := rows.Err(); err != nil {
		return 0, fmt.Errorf("iterasi suratmasuk: %w", err)
	}

	changed := 0
	for _, it := range items {
		pengirim, err := encryptColumn(it.kolom1, key)
		if err != nil {
			return changed, fmt.Errorf("enkripsi pengirim id %d: %w", it.id, err)
		}
		perihal, err := encryptColumn(it.kolom2, key)
		if err != nil {
			return changed, fmt.Errorf("enkripsi perihal id %d: %w", it.id, err)
		}
		if pengirim == it.kolom1 && perihal == it.kolom2 {
			continue
		}
		if _, err := tx.ExecContext(ctx,
			"UPDATE suratmasuk SET pengirim = ?, perihal = ? WHERE id = ?",
			pengirim, perihal, it.id); err != nil {
			return changed, fmt.Errorf("update suratmasuk id %d: %w", it.id, err)
		}
		changed++
	}
	return changed, nil
}

func backfillSuratKeluar(ctx context.Context, tx *sql.Tx, key []byte) (int, error) {
	rows, err := tx.QueryContext(ctx, "SELECT id, penerima, perihal FROM suratkeluar")
	if err != nil {
		return 0, fmt.Errorf("query suratkeluar: %w", err)
	}

	type suratRow struct {
		id     int
		kolom1 sql.NullString
		kolom2 sql.NullString
	}
	items := make([]suratRow, 0)
	for rows.Next() {
		var it suratRow
		if err := rows.Scan(&it.id, &it.kolom1, &it.kolom2); err != nil {
			rows.Close()
			return 0, fmt.Errorf("scan suratkeluar: %w", err)
		}
		items = append(items, it)
	}
	rows.Close()
	if err := rows.Err(); err != nil {
		return 0, fmt.Errorf("iterasi suratkeluar: %w", err)
	}

	changed := 0
	for _, it := range items {
		penerima, err := encryptColumn(it.kolom1, key)
		if err != nil {
			return changed, fmt.Errorf("enkripsi penerima id %d: %w", it.id, err)
		}
		perihal, err := encryptColumn(it.kolom2, key)
		if err != nil {
			return changed, fmt.Errorf("enkripsi perihal id %d: %w", it.id, err)
		}
		if penerima == it.kolom1 && perihal == it.kolom2 {
			continue
		}
		if _, err := tx.ExecContext(ctx,
			"UPDATE suratkeluar SET penerima = ?, perihal = ? WHERE id = ?",
			penerima, perihal, it.id); err != nil {
			return changed, fmt.Errorf("update suratkeluar id %d: %w", it.id, err)
		}
		changed++
	}
	return changed, nil
}

var encryptBackfillCmd = &cobra.Command{
	Use:   "migrate:encrypt",
	Short: "Backfill enkripsi AES-256-GCM untuk kolom sensitif yang masih plaintext",
	Run: func(cmd *cobra.Command, args []string) {
		if err := runEncryptBackfill(); err != nil {
			fmt.Fprintln(os.Stderr, "ERROR:", err)
			os.Exit(1)
		}
	},
}

func init() {
	encryptBackfillCmd.Flags().BoolVar(&encryptBackfillDryRun, "dry-run", false, "jalankan tanpa menyimpan perubahan (rollback)")
	rootCmd.AddCommand(encryptBackfillCmd)
}
