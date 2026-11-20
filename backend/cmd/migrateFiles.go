package cmd

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"os"
	"path"
	"path/filepath"
	"strings"
	"time"

	"github.com/rasyarhmt/desa-bahontobungku/config"
	"github.com/rasyarhmt/desa-bahontobungku/utils"
	"github.com/spf13/cobra"
)

var (
	migrateFilesDryRun     bool
	migrateFilesUploadsDir string
)

type migrateFileTarget struct {
	table     string
	column    string
	folder    string
	encrypted bool
}

var migrateFileTargets = []migrateFileTarget{
	{table: "berita", column: "foto", folder: "berita"},
	{table: "media", column: "file", folder: "media"},
	{table: "media", column: "thumbnail", folder: "media"},
	{table: "aparatur", column: "foto", folder: "aparatur"},
	{table: "suratmasuk", column: "file", folder: "surat", encrypted: true},
	{table: "suratkeluar", column: "file", folder: "surat", encrypted: true},
	{table: "log_cetak_surat", column: "file", folder: "surat", encrypted: true},
	{table: "surat_template", column: "file_template", folder: "templates", encrypted: true},
}

type migrateFileItem struct {
	id   int
	path string
}

func findSourceFile(uploadsDir, folder, storedPath string) string {
	base := filepath.Base(filepath.FromSlash(storedPath))
	if base == "." || base == string(filepath.Separator) || base == "" {
		return ""
	}

	candidates := make([]string, 0, 3)
	if !strings.Contains(storedPath, "..") {
		candidates = append(candidates, filepath.Join(uploadsDir, filepath.FromSlash(storedPath)))
	}
	candidates = append(candidates,
		filepath.Join(uploadsDir, base),
		filepath.Join(uploadsDir, folder, base),
	)

	for _, candidate := range candidates {
		info, err := os.Stat(candidate)
		if err == nil && info.Mode().IsRegular() {
			return candidate
		}
	}
	return ""
}

func moveFile(src, dest string) error {
	if src == dest {
		return nil
	}
	if err := os.MkdirAll(filepath.Dir(dest), 0o755); err != nil {
		return err
	}
	if err := os.Rename(src, dest); err == nil {
		return nil
	}

	data, err := os.ReadFile(src)
	if err != nil {
		return err
	}
	if err := os.WriteFile(dest, data, 0o644); err != nil {
		return err
	}
	return os.Remove(src)
}

func fetchFileItems(ctx context.Context, table, column string) ([]migrateFileItem, error) {
	query := fmt.Sprintf(
		"SELECT id, %s FROM %s WHERE %s IS NOT NULL AND %s <> '' ORDER BY id",
		quoteIdentifier(column), quoteIdentifier(table),
		quoteIdentifier(column), quoteIdentifier(column),
	)
	rows, err := config.DB.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]migrateFileItem, 0)
	for rows.Next() {
		var item migrateFileItem
		var stored sql.NullString
		if err := rows.Scan(&item.id, &stored); err != nil {
			return nil, err
		}
		if !stored.Valid || strings.TrimSpace(stored.String) == "" {
			continue
		}
		item.path = strings.TrimSpace(stored.String)
		items = append(items, item)
	}
	return items, rows.Err()
}

func updateFilePath(ctx context.Context, tx *sql.Tx, table, column, newPath string, id int) error {
	query := fmt.Sprintf(
		"UPDATE %s SET %s = ? WHERE id = ?",
		quoteIdentifier(table), quoteIdentifier(column),
	)
	_, err := tx.ExecContext(ctx, query, newPath, id)
	return err
}

func encryptMigratedFile(src, folder, base string) (string, error) {
	data, err := os.ReadFile(src)
	if err != nil {
		return "", err
	}
	if folder == "templates" {
		return utils.EncryptFileContent(data, base)
	}
	return utils.EncryptArchiveFile(data, base)
}

func runMigrateFiles() error {
	if config.AppConfig == nil || strings.TrimSpace(config.AppConfig.MasterKEK) == "" {
		return errors.New("MasterKEK belum di-set pada environment")
	}

	uploadsDir := strings.TrimSpace(migrateFilesUploadsDir)
	if uploadsDir == "" {
		uploadsDir = "uploads"
	}
	if _, err := os.Stat(uploadsDir); err != nil {
		return fmt.Errorf("folder uploads %q tidak ditemukan: %w", uploadsDir, err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Minute)
	defer cancel()

	tx, err := config.DB.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("begin transaksi: %w", err)
	}
	defer tx.Rollback()

	totalChanged := 0
	for _, target := range migrateFileTargets {
		items, err := fetchFileItems(ctx, target.table, target.column)
		if err != nil {
			return fmt.Errorf("baca %s.%s: %w", target.table, target.column, err)
		}

		changed := 0
		missing := 0
		skipped := 0
		for _, item := range items {
			if target.encrypted && strings.HasSuffix(strings.ToLower(item.path), ".enc") {
				skipped++
				continue
			}

			base := filepath.Base(filepath.FromSlash(item.path))
			src := findSourceFile(uploadsDir, target.folder, item.path)
			if src == "" {
				fmt.Printf("MISSING %s.%s id=%d: %s\n", target.table, target.column, item.id, item.path)
				missing++
				continue
			}

			if migrateFilesDryRun {
				changed++
				continue
			}

			if target.encrypted {
				newPath, err := encryptMigratedFile(src, target.folder, base)
				if err != nil {
					return fmt.Errorf("enkripsi %s.%s id=%d: %w", target.table, target.column, item.id, err)
				}
				if err := updateFilePath(ctx, tx, target.table, target.column, newPath, item.id); err != nil {
					return fmt.Errorf("update %s.%s id=%d: %w", target.table, target.column, item.id, err)
				}
				encryptedPath := filepath.Join(uploadsDir, filepath.FromSlash(newPath))
				if src != encryptedPath {
					if err := os.Remove(src); err != nil && !errors.Is(err, os.ErrNotExist) {
						return fmt.Errorf("hapus plaintext %s: %w", src, err)
					}
				}
				changed++
				continue
			}

			newRel := path.Join(target.folder, base)
			dest := filepath.Join(uploadsDir, filepath.FromSlash(newRel))
			if src == dest {
				skipped++
				continue
			}
			if err := moveFile(src, dest); err != nil {
				return fmt.Errorf("pindah %s -> %s: %w", src, dest, err)
			}
			if err := updateFilePath(ctx, tx, target.table, target.column, newRel, item.id); err != nil {
				return fmt.Errorf("update %s.%s id=%d: %w", target.table, target.column, item.id, err)
			}
			changed++
		}

		totalChanged += changed
		fmt.Printf("%-20s %-14s ubah=%d missing=%d skip=%d\n",
			target.table, target.column, changed, missing, skipped)
	}

	if migrateFilesDryRun {
		fmt.Printf("DRY RUN: %d file akan dipindah/dienkripsi, perubahan dibatalkan (rollback).\n", totalChanged)
		return nil
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("commit: %w", err)
	}
	fmt.Printf("Migrasi file selesai. %d file dipindah/dienkripsi.\n", totalChanged)
	return nil
}

var migrateFilesCmd = &cobra.Command{
	Use:   "migrate:files",
	Short: "Pindahkan dan enkripsi file uploads lama ke struktur folder baru",
	Run: func(cmd *cobra.Command, args []string) {
		if err := runMigrateFiles(); err != nil {
			fmt.Fprintln(os.Stderr, "ERROR:", err)
			os.Exit(1)
		}
	},
}

func init() {
	migrateFilesCmd.Flags().BoolVar(&migrateFilesDryRun, "dry-run", false, "jalankan tanpa menyimpan perubahan (rollback)")
	migrateFilesCmd.Flags().StringVar(&migrateFilesUploadsDir, "uploads-dir", "uploads", "folder uploads relatif terhadap binary")
	rootCmd.AddCommand(migrateFilesCmd)
}
