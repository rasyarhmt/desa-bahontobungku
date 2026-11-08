package usecase

import (
	"context"
	"fmt"
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

func NewAuthUsecase(authRepo domain.AuthRepository, userRepo domain.UserRepository) AuthUsecase {
	return &authUsecase{authRepo: authRepo, userRepo: userRepo}
}

func (u *authUsecase) Login(ctx context.Context, req dto.LoginRequestDTO, userAgent, ipAddress string) (*dto.LoginResponseDTO, error) {
	user, err := u.userRepo.GetUserByEmail(ctx, req.Email)
	if err != nil {
		return nil, domain.NewUnauthorized(err.Error())
	}
	if user == nil {
		return nil, domain.NewUnauthorized("email atau password salah")
	}
	if !utils.ComparePassword(user.Password, req.Password) {
		return nil, domain.NewUnauthorized("password salah")
	}

	now := time.Now()
	_ = u.userRepo.UpdateLastLogin(ctx, user.ID, now)

	accessToken, err := utils.GenerateAccessToken(user.ID, user.Email, user.Role)
	if err != nil {
		return nil, domain.NewUnauthorized(err.Error())
	}
	refreshToken, err := u.createRefreshToken(ctx, user.ID, userAgent, ipAddress)
	if err != nil {
		return nil, domain.NewUnauthorized(err.Error())
	}

	fmt.Println("ini di hit fungsi login")

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
		return nil, domain.NewUnauthorized(err.Error())
	}
	if rt == nil || rt.IsRevoked {
		return nil, domain.NewUnauthorized("refresh token tidak valid")
	}
	if time.Now().After(rt.ExpiredAt) {
		return nil, domain.NewUnauthorized("refresh token telah kedaluwarsa")
	}

	user, err := u.userRepo.GetUserByID(ctx, rt.UserID)
	if err != nil {
		return nil, domain.NewUnauthorized(err.Error())
	}
	if user == nil {
		return nil, domain.NewUnauthorized("user tidak ditemukan")
	}

	if err := u.authRepo.RevokeRefreshToken(ctx, tokenHash); err != nil {
		return nil, domain.NewUnauthorized(err.Error())
	}

	accessToken, err := utils.GenerateAccessToken(user.ID, user.Email, user.Role)
	if err != nil {
		return nil, domain.NewUnauthorized(err.Error())
	}
	newRefreshToken, err := u.createRefreshToken(ctx, user.ID, userAgent, ipAddress)
	if err != nil {
		return nil, domain.NewUnauthorized(err.Error())
	}

	return &dto.RefreshTokenResponseDTO{
		AccessToken:  accessToken,
		RefreshToken: newRefreshToken,
	}, nil
}

func (u *authUsecase) Logout(ctx context.Context, refreshToken string) error {
	if refreshToken == "" {
		return domain.NewValidation("refresh token wajib diisi")
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
