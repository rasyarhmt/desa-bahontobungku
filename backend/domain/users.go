package domain

import (
	"context"
	"time"
)

const (
	RoleSuperadmin = "superadmin"
	RoleAdmin      = "admin"
)

type User struct {
	ID        int
	Nama      string
	Email     string
	Password  string
	Role      string
	LastLogin *time.Time
	CreatedAt time.Time
	UpdatedAt time.Time
}

type UserRepository interface {
	GetUserByEmail(ctx context.Context, email string) (*User, error)
	GetUserByID(ctx context.Context, id int) (*User, error)
	GetAllUsers(ctx context.Context) ([]User, error)
	CreateUser(ctx context.Context, nama, email, password, role string) (int, error)
	UpdateUserProfile(ctx context.Context, id int, nama, password string) error
	UpdateLastLogin(ctx context.Context, id int, lastLogin time.Time) error
	DeleteUser(ctx context.Context, id int) (bool, error)
	TransferSuperadmin(ctx context.Context, fromID, toID int) error
	ResetPassword(ctx context.Context, email, newPassword string) error
}
