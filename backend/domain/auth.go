package domain

import (
	"context"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/rasyarhmt/desa-bahontobungku/dto"
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

type (
	AuthRepository interface {
		CreateRefreshToken(ctx context.Context, rt *UserRefreshToken) error
		GetRefreshTokenByHash(ctx context.Context, tokenHash string) (*UserRefreshToken, error)
		RevokeRefreshToken(ctx context.Context, tokenHash string) error
		RevokeAllUserTokens(ctx context.Context, userID int) error
	}

	AuthUsecase interface {
		Login(ctx context.Context, req dto.LoginRequestDTO, userAgent, ipAddress string) (*dto.LoginResponseDTO, error)
		RefreshToken(ctx context.Context, req dto.RefreshTokenRequestDTO, userAgent, ipAddress string) (*dto.RefreshTokenResponseDTO, error)
		Logout(ctx context.Context, refreshToken string) error
	}

	AuthHandler interface {
		Login(c *gin.Context)
		RefreshToken(c *gin.Context)
		Logout(c *gin.Context)
	}
)
