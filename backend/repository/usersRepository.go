package repository

import (
	"context"
	"database/sql"
	"time"

	"github.com/rasyarhmt/desa-bahontobungku/domain"
)

type userRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) domain.UserRepository {
	return &userRepository{db: db}
}

func scanUser(row rowScanner) (*domain.User, error) {
	var u domain.User
	var lastLogin sql.NullTime

	dest := []interface{}{
		&u.ID, &u.Nama, &u.Email, &u.Password, &u.Role,
		&lastLogin, &u.CreatedAt, &u.UpdatedAt,
	}

	if err := row.Scan(dest...); err != nil {
		return nil, err
	}

	if lastLogin.Valid {
		u.LastLogin = &lastLogin.Time
	}
	return &u, nil
}

func (r *userRepository) GetUserByEmail(ctx context.Context, email string) (*domain.User, error) {
	return scanOne(r.db.QueryRowContext(ctx,
		"SELECT id, nama, email, password, role, last_login, created_at, updated_at FROM users WHERE email = ?", email), scanUser)
}

func (r *userRepository) GetUserByID(ctx context.Context, id int) (*domain.User, error) {
	return scanOne(r.db.QueryRowContext(ctx,
		"SELECT id, nama, email, password, role, last_login, created_at, updated_at FROM users WHERE id = ?", id), scanUser)
}

func (r *userRepository) GetAllUsers(ctx context.Context) ([]domain.User, error) {
	rows, err := r.db.QueryContext(ctx,
		"SELECT id, nama, email, password, role, last_login, created_at, updated_at FROM users ORDER BY id ASC")
	if err != nil {
		return nil, err
	}
	return scanAll(rows, scanUser)
}

func (r *userRepository) CreateUser(ctx context.Context, nama, email, password, role string) (int, error) {
	return execReturningID(r.db.ExecContext(ctx,
		"INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, ?)",
		nama, email, password, role))
}

func (r *userRepository) UpdateUserProfile(ctx context.Context, id int, nama, password string) error {
	_, err := r.db.ExecContext(ctx,
		"UPDATE users SET nama = ?, password = ? WHERE id = ?", nama, password, id)
	return err
}

func (r *userRepository) UpdateLastLogin(ctx context.Context, id int, lastLogin time.Time) error {
	_, err := r.db.ExecContext(ctx,
		"UPDATE users SET last_login = ? WHERE id = ?", lastLogin, id)
	return err
}

func (r *userRepository) DeleteUser(ctx context.Context, id int) (bool, error) {
	return execAffected(r.db.ExecContext(ctx, "DELETE FROM users WHERE id = ?", id))
}

func (r *userRepository) TransferSuperadmin(ctx context.Context, fromID, toID int) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	if _, err := tx.ExecContext(ctx, "UPDATE users SET role = 'admin' WHERE id = ?", fromID); err != nil {
		return err
	}
	if _, err := tx.ExecContext(ctx, "UPDATE users SET role = 'superadmin' WHERE id = ?", toID); err != nil {
		return err
	}
	return tx.Commit()
}

func (r *userRepository) ResetPassword(ctx context.Context, email, newPassword string) error {
	_, err := r.db.ExecContext(ctx,
		"UPDATE users SET password = ? WHERE email = ?", newPassword, email)
	return err
}
