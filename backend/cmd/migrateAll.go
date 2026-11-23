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
	migrateAllOldDSN string
	migrateAllDryRun bool
	migrateAllTables string
)

type migrateAllTable struct {
	name      string
	encrypted map[string]bool
}

var migrateAllTableOrder = []migrateAllTable{
	{name: "users"},
	{name: "aparatur"},
	{name: "berita"},
	{name: "danamasuk"},
	{name: "danakeluar"},
	{name: "pengumuman"},
	{name: "media"},
	{name: "surat_template"},
	{name: "status_keluarga"},
	{name: "pelayanan"},
	{
		name:      "suratmasuk",
		encrypted: map[string]bool{"pengirim": true, "perihal": true},
	},
	{
		name:      "log_cetak_surat",
		encrypted: map[string]bool{"nama_pemohon": true, "nik_pemohon": true},
	},
	{
		name:      "suratkeluar",
		encrypted: map[string]bool{"penerima": true, "perihal": true},
	},
	{name: "surat_template_field"},
}

func quoteIdentifier(name string) string {
	return "`" + strings.ReplaceAll(name, "`", "``") + "`"
}

func currentDatabaseName(ctx context.Context, db *sql.DB) (string, error) {
	var name sql.NullString
	if err := db.QueryRowContext(ctx, "SELECT DATABASE()").Scan(&name); err != nil {
		return "", err
	}
	if !name.Valid || strings.TrimSpace(name.String) == "" {
		return "", errors.New("database aktif tidak terdeteksi")
	}
	return name.String, nil
}

func tableColumns(ctx context.Context, db *sql.DB, schema, table string) ([]string, error) {
	rows, err := db.QueryContext(ctx, `
		SELECT column_name
		FROM information_schema.columns
		WHERE table_schema = ? AND table_name = ?
		ORDER BY ordinal_position`, schema, table)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	columns := make([]string, 0)
	for rows.Next() {
		var column string
		if err := rows.Scan(&column); err != nil {
			return nil, err
		}
		columns = append(columns, column)
	}
	return columns, rows.Err()
}

func normalizeScannedValue(value interface{}) interface{} {
	switch v := value.(type) {
	case nil:
		return nil
	case []byte:
		return string(v)
	case time.Time:
		return v.Format("2006-01-02 15:04:05")
	default:
		return v
	}
}

func fetchTableRows(ctx context.Context, db *sql.DB, table string, columns []string) ([]map[string]interface{}, error) {
	quoted := make([]string, 0, len(columns))
	for _, column := range columns {
		quoted = append(quoted, quoteIdentifier(column))
	}

	query := fmt.Sprintf("SELECT %s FROM %s", strings.Join(quoted, ", "), quoteIdentifier(table))
	rows, err := db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := make([]map[string]interface{}, 0)
	for rows.Next() {
		raw := make([]interface{}, len(columns))
		ptrs := make([]interface{}, len(columns))
		for i := range raw {
			ptrs[i] = &raw[i]
		}
		if err := rows.Scan(ptrs...); err != nil {
			return nil, err
		}

		row := make(map[string]interface{}, len(columns))
		for i, column := range columns {
			row[column] = normalizeScannedValue(raw[i])
		}
		result = append(result, row)
	}
	return result, rows.Err()
}

func encryptRowColumns(row map[string]interface{}, encrypted map[string]bool, key []byte) error {
	for column := range encrypted {
		value, ok := row[column]
		if !ok || value == nil {
			continue
		}
		text, ok := value.(string)
		if !ok || strings.TrimSpace(text) == "" {
			continue
		}
		enc, err := encryptIfPlaintext(text, key)
		if err != nil {
			return fmt.Errorf("enkripsi %s: %w", column, err)
		}
		row[column] = enc
	}
	return nil
}

func insertTableRows(ctx context.Context, tx *sql.Tx, table string, columns []string, rows []map[string]interface{}) (int, error) {
	if len(rows) == 0 {
		return 0, nil
	}

	quoted := make([]string, 0, len(columns))
	placeholders := make([]string, 0, len(columns))
	for _, column := range columns {
		quoted = append(quoted, quoteIdentifier(column))
		placeholders = append(placeholders, "?")
	}

	query := fmt.Sprintf(
		"INSERT IGNORE INTO %s (%s) VALUES (%s)",
		quoteIdentifier(table),
		strings.Join(quoted, ", "),
		strings.Join(placeholders, ", "),
	)

	changed := 0
	for _, row := range rows {
		values := make([]interface{}, 0, len(columns))
		for _, column := range columns {
			values = append(values, row[column])
		}
		res, err := tx.ExecContext(ctx, query, values...)
		if err != nil {
			return changed, fmt.Errorf("insert %s: %w", table, err)
		}
		affected, err := res.RowsAffected()
		if err == nil {
			changed += int(affected)
		}
	}
	return changed, nil
}

func runMigrateAll() error {
	if config.AppConfig == nil || strings.TrimSpace(config.AppConfig.MasterKEK) == "" {
		return errors.New("MasterKEK belum di-set pada environment")
	}

	dsn := strings.TrimSpace(migrateAllOldDSN)
	if dsn == "" {
		dsn = strings.TrimSpace(os.Getenv("OLD_DB_DSN"))
	}
	if dsn == "" {
		return errors.New("DSN DB lama kosong: isi --old-dsn atau env OLD_DB_DSN")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Minute)
	defer cancel()

	oldDB, err := sql.Open("mysql", dsn)
	if err != nil {
		return fmt.Errorf("membuka koneksi DB lama: %w", err)
	}
	defer oldDB.Close()
	oldDB.SetMaxOpenConns(2)
	if err := oldDB.PingContext(ctx); err != nil {
		return fmt.Errorf("ping DB lama: %w", err)
	}

	oldSchema, err := currentDatabaseName(ctx, oldDB)
	if err != nil {
		return fmt.Errorf("nama DB lama: %w", err)
	}
	newSchema, err := currentDatabaseName(ctx, config.DB)
	if err != nil {
		return fmt.Errorf("nama DB baru: %w", err)
	}

	selected := make(map[string]bool)
	if strings.TrimSpace(migrateAllTables) != "" {
		for _, name := range strings.Split(migrateAllTables, ",") {
			selected[strings.ToLower(strings.TrimSpace(name))] = true
		}
	}

	key := utils.GetMasterKEK()
	tx, err := config.DB.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("begin transaksi: %w", err)
	}
	defer tx.Rollback()

	total := 0
	for _, spec := range migrateAllTableOrder {
		if len(selected) > 0 && !selected[strings.ToLower(spec.name)] {
			continue
		}
		if spec.name == "penduduk" || spec.name == "user_refresh_token" {
			continue
		}

		oldColumns, err := tableColumns(ctx, oldDB, oldSchema, spec.name)
		if err != nil {
			return fmt.Errorf("kolom DB lama %s: %w", spec.name, err)
		}
		newColumns, err := tableColumns(ctx, config.DB, newSchema, spec.name)
		if err != nil {
			return fmt.Errorf("kolom DB baru %s: %w", spec.name, err)
		}

		newColumnSet := make(map[string]bool, len(newColumns))
		for _, column := range newColumns {
			newColumnSet[strings.ToLower(column)] = true
		}

		columns := make([]string, 0, len(oldColumns))
		for _, column := range oldColumns {
			if newColumnSet[strings.ToLower(column)] {
				columns = append(columns, column)
			}
		}
		if len(columns) == 0 {
			fmt.Printf("%-22s dilewati (tidak ada kolom yang cocok)\n", spec.name)
			continue
		}

		rows, err := fetchTableRows(ctx, oldDB, spec.name, columns)
		if err != nil {
			return fmt.Errorf("baca %s: %w", spec.name, err)
		}

		for _, row := range rows {
			if err := encryptRowColumns(row, spec.encrypted, key); err != nil {
				return fmt.Errorf("%s: %w", spec.name, err)
			}
		}

		inserted, err := insertTableRows(ctx, tx, spec.name, columns, rows)
		if err != nil {
			return err
		}
		total += inserted
		fmt.Printf("%-22s %d baris dibaca, %d baris masuk\n", spec.name, len(rows), inserted)
	}

	if migrateAllDryRun {
		fmt.Printf("DRY RUN: %d baris akan masuk, perubahan dibatalkan (rollback).\n", total)
		return nil
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("commit: %w", err)
	}
	fmt.Printf("Migrasi semua data selesai. %d baris masuk.\n", total)
	return nil
}

var migrateAllCmd = &cobra.Command{
	Use:   "migrate:all",
	Short: "Migrasi seluruh tabel lama ke skema baru dengan enkripsi kolom sensitif",
	Run: func(cmd *cobra.Command, args []string) {
		if err := runMigrateAll(); err != nil {
			fmt.Fprintln(os.Stderr, "ERROR:", err)
			os.Exit(1)
		}
	},
}

func init() {
	migrateAllCmd.Flags().StringVar(&migrateAllOldDSN, "old-dsn", "", "DSN database lama (atau set env OLD_DB_DSN)")
	migrateAllCmd.Flags().BoolVar(&migrateAllDryRun, "dry-run", false, "jalankan tanpa menyimpan perubahan (rollback)")
	migrateAllCmd.Flags().StringVar(&migrateAllTables, "tables", "", "batasi tabel, pisahkan dengan koma")
	rootCmd.AddCommand(migrateAllCmd)
}
