package usecase

import (
	"context"
	"errors"
	"time"

	"github.com/rasyarhmt/desa-bahontobungku/config"
	"github.com/rasyarhmt/desa-bahontobungku/domain"
	"github.com/rasyarhmt/desa-bahontobungku/dto"
	"github.com/rasyarhmt/desa-bahontobungku/utils"
)

const defaultResetPassword = "@Bahontobungku123"

type authUsecase struct {
	authRepo domain.AuthRepository
	userRepo domain.UserRepository
}

func NewAuthUsecase(authRepo domain.AuthRepository, userRepo domain.UserRepository) domain.AuthUsecase {
	return &authUsecase{authRepo: authRepo, userRepo: userRepo}
}

func (u *authUsecase) Login(ctx context.Context, req dto.LoginRequestDTO, userAgent, ipAddress string) (*dto.LoginResponseDTO, error) {
	user, err := u.userRepo.GetUserByEmail(ctx, req.Email)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.New("email tidak ditemukan")
	}
	if !utils.ComparePassword(user.Password, req.Password) {
		return nil, errors.New("password salah")
	}

	now := time.Now()
	_ = u.userRepo.UpdateLastLogin(ctx, user.ID, now)

	accessToken, err := utils.GenerateAccessToken(user.ID, user.Email, user.Role)
	if err != nil {
		return nil, err
	}
	refreshToken, err := u.createRefreshToken(ctx, user.ID, userAgent, ipAddress)
	if err != nil {
		return nil, err
	}

	return &dto.LoginResponseDTO{
		User: dto.UserResponseDTO{
			ID:        user.ID,
			Nama:      user.Nama,
			Email:     user.Email,
			Role:      user.Role,
			LastLogin: &now,
		},
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

func (u *authUsecase) RefreshToken(ctx context.Context, req dto.RefreshTokenRequestDTO, userAgent, ipAddress string) (*dto.RefreshTokenResponseDTO, error) {
	tokenHash := utils.HashToken(req.RefreshToken)

	rt, err := u.authRepo.GetRefreshTokenByHash(ctx, tokenHash)
	if err != nil {
		return nil, err
	}
	if rt == nil || rt.IsRevoked {
		return nil, errors.New("refresh token tidak valid")
	}
	if time.Now().After(rt.ExpiredAt) {
		return nil, errors.New("refresh token telah kedaluwarsa")
	}

	user, err := u.userRepo.GetUserByID(ctx, rt.UserID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.New("user tidak ditemukan")
	}

	if err := u.authRepo.RevokeRefreshToken(ctx, tokenHash); err != nil {
		return nil, err
	}

	accessToken, err := utils.GenerateAccessToken(user.ID, user.Email, user.Role)
	if err != nil {
		return nil, err
	}
	newRefreshToken, err := u.createRefreshToken(ctx, user.ID, userAgent, ipAddress)
	if err != nil {
		return nil, err
	}

	return &dto.RefreshTokenResponseDTO{
		AccessToken:  accessToken,
		RefreshToken: newRefreshToken,
	}, nil
}

func (u *authUsecase) Logout(ctx context.Context, refreshToken string) error {
	if refreshToken == "" {
		return errors.New("refresh token wajib diisi")
	}
	return u.authRepo.RevokeRefreshToken(ctx, utils.HashToken(refreshToken))
}

func (u *authUsecase) createRefreshToken(ctx context.Context, userID int, userAgent, ipAddress string) (string, error) {
	token, err := utils.GenerateRefreshToken()
	if err != nil {
		return "", err
	}

	rt := &domain.UserRefreshToken{
		UserID:    userID,
		TokenHash: utils.HashToken(token),
		UserAgent: userAgent,
		IPAddress: ipAddress,
		ExpiredAt: time.Now().Add(config.AppConfig.RefreshTokenExpiry),
	}
	if err := u.authRepo.CreateRefreshToken(ctx, rt); err != nil {
		return "", err
	}
	return token, nil
}
