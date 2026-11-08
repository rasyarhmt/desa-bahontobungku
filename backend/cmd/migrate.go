package cmd

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"github.com/rasyarhmt/desa-bahontobungku/config"
	"github.com/spf13/cobra"
)

const defaultMigrationDir = "database/migrations"

var migrationDir string

func addMigrationFlags(cmd *cobra.Command) {
	cmd.Flags().StringVar(&migrationDir, "dir", defaultMigrationDir, "directory containing migration files")
}

func migrationFiles() ([]string, error) {
	files, err := filepath.Glob(filepath.Join(migrationDir, "*.sql"))
	if err != nil {
		return nil, fmt.Errorf("getting migration files: %w", err)
	}
	sort.Strings(files)
	return files, nil
}

func readMigration(file string) (upSQL, downSQL string, err error) {
	content, err := os.ReadFile(file)
	if err != nil {
		return "", "", fmt.Errorf("reading migration %s: %w", file, err)
	}

	parts := strings.SplitN(string(content), "-- +migrate Down", 2)
	upSQL = strings.TrimSpace(strings.Replace(parts[0], "-- +migrate Up", "", 1))
	if len(parts) == 2 {
		downSQL = strings.TrimSpace(parts[1])
	}
	return upSQL, downSQL, nil
}

var migrateCreateCmd = &cobra.Command{
	Use:   "migrate:create [name]",
	Short: "Create a new migration file",
	Args:  cobra.ExactArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		name := strings.ToLower(args[0])
		timestamp := time.Now().Format("20060102150405")
		filename := filepath.Join(migrationDir, fmt.Sprintf("%s_%s.sql", timestamp, name))
		content := "-- +migrate Up\n\n-- +migrate Down\n"

		if err := os.MkdirAll(migrationDir, os.ModePerm); err != nil {
			return fmt.Errorf("creating migrations folder: %w", err)
		}

		if err := os.WriteFile(filename, []byte(content), 0644); err != nil {
			return fmt.Errorf("creating migration file: %w", err)
		}

		fmt.Println("Migration created:", filename)
		return nil
	},
}

func runMigrateUp() error {
	conn, err := config.NewDB()
	if err != nil {
		return fmt.Errorf("unable to connect to database: %w", err)
	}
	defer conn.Close()

	files, err := migrationFiles()
	if err != nil {
		return err
	}

	ctx := context.Background()
	tx, err := conn.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("begin migration transaction: %w", err)
	}
	defer tx.Rollback()

	for _, file := range files {
		upSQL, _, err := readMigration(file)
		if err != nil {
			return err
		}
		if upSQL == "" {
			continue
		}

		if _, err := tx.ExecContext(ctx, upSQL); err != nil {
			return fmt.Errorf("failed to run migration %s: %w", file, err)
		}

		fmt.Println("Migrated:", file)
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("commit migrations: %w", err)
	}
	return nil
}

func runMigrateDown() error {
	conn, err := config.NewDB()
	if err != nil {
		return fmt.Errorf("unable to connect to database: %w", err)
	}
	defer conn.Close()

	files, err := migrationFiles()
	if err != nil {
		return err
	}

	ctx := context.Background()
	for i := len(files) - 1; i >= 0; i-- {
		file := files[i]
		_, downSQL, err := readMigration(file)
		if err != nil {
			return err
		}
		if downSQL == "" {
			continue
		}

		if _, err := conn.ExecContext(ctx, downSQL); err != nil {
			return fmt.Errorf("failed to rollback migration %s: %w", file, err)
		}

		fmt.Println("Rolled back:", file)
	}
	return nil
}

var migrateUpCmd = &cobra.Command{
	Use:   "migrate:up",
	Short: "Apply all up migrations",
	Run: func(cmd *cobra.Command, args []string) {
		if err := runMigrateUp(); err != nil {
			fmt.Fprintln(os.Stderr, err)
			os.Exit(1)
		}
	},
}

var migrateDownCmd = &cobra.Command{
	Use:   "migrate:down",
	Short: "Revert all down migrations",
	Run: func(cmd *cobra.Command, args []string) {
		if err := runMigrateDown(); err != nil {
			fmt.Fprintln(os.Stderr, err)
			os.Exit(1)
		}
	},
}

func init() {
	addMigrationFlags(migrateCreateCmd)
	addMigrationFlags(migrateUpCmd)
	addMigrationFlags(migrateDownCmd)

	rootCmd.AddCommand(migrateCreateCmd)
	rootCmd.AddCommand(migrateUpCmd)
	rootCmd.AddCommand(migrateDownCmd)
}
