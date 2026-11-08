package domain

import (
	"context"
	"time"
)

type UserRefreshToken struct {
	ID        int
	UserID    int
	TokenHash string
	UserAgent string
	IPAddress string
	IsRevoked bool
	ExpiredAt time.Time
	CreatedAt time.Time
	UpdatedAt time.Time
}

type AuthRepository interface {
	CreateRefreshToken(ctx context.Context, rt *UserRefreshToken) error
	GetRefreshTokenByHash(ctx context.Context, tokenHash string) (*UserRefreshToken, error)
	RevokeRefreshToken(ctx context.Context, tokenHash string) error
	RevokeAllUserTokens(ctx context.Context, userID int) error
}
