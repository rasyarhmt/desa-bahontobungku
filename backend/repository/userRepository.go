package repository

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/rasyarhmt/desa-bahontobungku/domain"
)

type userRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) domain.UserRepository {
	return &userRepository{db: db}
}

func scanUser(row interface {
	Scan(dest ...interface{}) error
}) (*domain.User, error) {
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
	row := r.db.QueryRowContext(ctx,
		"SELECT id, nama, email, password, role, last_login, created_at, updated_at FROM users WHERE email = ?", email)

	u, err := scanUser(row)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return u, nil
}

func (r *userRepository) GetUserByID(ctx context.Context, id int) (*domain.User, error) {
	row := r.db.QueryRowContext(ctx,
		"SELECT id, nama, email, password, role, last_login, created_at, updated_at FROM users WHERE id = ?", id)

	u, err := scanUser(row)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return u, nil
}

func (r *userRepository) GetAllUsers(ctx context.Context) ([]domain.User, error) {
	rows, err := r.db.QueryContext(ctx,
		"SELECT id, nama, email, password, role, last_login, created_at, updated_at FROM users ORDER BY id ASC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	users := make([]domain.User, 0)
	for rows.Next() {
		u, err := scanUser(rows)
		if err != nil {
			return nil, err
		}
		users = append(users, *u)
	}
	return users, rows.Err()
}

func (r *userRepository) CreateUser(ctx context.Context, nama, email, password, role string) (int, error) {
	result, err := r.db.ExecContext(ctx,
		"INSERT INTO user (nama, email, password, role) VALUES (?, ?, ?, ?)",
		nama, email, password, role)
	if err != nil {
		return 0, err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}
	return int(id), nil
}

func (r *userRepository) UpdateUserProfile(ctx context.Context, id int, nama, password string) error {
	_, err := r.db.ExecContext(ctx,
		"UPDATE user SET nama = ?, password = ? WHERE id = ?", nama, password, id)
	return err
}

func (r *userRepository) UpdateLastLogin(ctx context.Context, id int, lastLogin time.Time) error {
	_, err := r.db.ExecContext(ctx,
		"UPDATE user SET last_login = ? WHERE id = ?", lastLogin, id)
	return err
}

func (r *userRepository) DeleteUser(ctx context.Context, id int) (bool, error) {
	result, err := r.db.ExecContext(ctx, "DELETE FROM users WHERE id = ?", id)
	if err != nil {
		return false, err
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return false, err
	}
	return affected > 0, nil
}

func (r *userRepository) TransferSuperadmin(ctx context.Context, fromID, toID int) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	if _, err := tx.ExecContext(ctx, "UPDATE user SET role = 'admin' WHERE id = ?", fromID); err != nil {
		return err
	}
	if _, err := tx.ExecContext(ctx, "UPDATE user SET role = 'superadmin' WHERE id = ?", toID); err != nil {
		return err
	}
	return tx.Commit()
}

func (r *userRepository) ResetPassword(ctx context.Context, email, newPassword string) error {
	_, err := r.db.ExecContext(ctx,
		"UPDATE user SET password = ? WHERE email = ?", newPassword, email)
	return err
}
