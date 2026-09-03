package repository

import (
	"context"
	"database/sql"
	"errors"

	"github.com/rasyarhmt/desa-bahontobungku/domain"
)

type authRepository struct {
	db *sql.DB
}

func NewAuthRepository(db *sql.DB) domain.AuthRepository {
	return &authRepository{db: db}
}

func (r *authRepository) CreateRefreshToken(ctx context.Context, rt *domain.UserRefreshToken) error {
	_, err := r.db.ExecContext(ctx,
		"INSERT INTO user_refresh_token (user_id, token_hash, user_agent, ip_address, expired_at) VALUES (?, ?, ?, ?, ?)",
		rt.UserID, rt.TokenHash, rt.UserAgent, rt.IPAddress, rt.ExpiredAt)
	return err
}

func (r *authRepository) GetRefreshTokenByHash(ctx context.Context, tokenHash string) (*domain.UserRefreshToken, error) {
	var rt domain.UserRefreshToken
	err := r.db.QueryRowContext(ctx,
		"SELECT id, user_id, token_hash, user_agent, ip_address, is_revoked, expired_at, created_at, updated_at FROM user_refresh_token WHERE token_hash = ?",
		tokenHash).Scan(
		&rt.ID, &rt.UserID, &rt.TokenHash, &rt.UserAgent, &rt.IPAddress,
		&rt.IsRevoked, &rt.ExpiredAt, &rt.CreatedAt, &rt.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &rt, nil
}

func (r *authRepository) RevokeRefreshToken(ctx context.Context, tokenHash string) error {
	_, err := r.db.ExecContext(ctx,
		"UPDATE user_refresh_token SET is_revoked = TRUE, updated_at = CURRENT_TIMESTAMP WHERE token_hash = ?", tokenHash)
	return err
}

func (r *authRepository) RevokeAllUserTokens(ctx context.Context, userID int) error {
	_, err := r.db.ExecContext(ctx,
		"UPDATE user_refresh_token SET is_revoked = TRUE, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?", userID)
	return err
}
