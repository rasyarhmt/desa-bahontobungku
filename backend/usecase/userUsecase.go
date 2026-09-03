package usecase

import (
	"context"
	"errors"

	"github.com/rasyarhmt/desa-bahontobungku/domain"
	"github.com/rasyarhmt/desa-bahontobungku/dto"
	"github.com/rasyarhmt/desa-bahontobungku/utils"
)

type userUsecase struct {
	userRepo domain.UserRepository
	authRepo domain.AuthRepository
}

func NewUserUsecase(userRepo domain.UserRepository, authRepo domain.AuthRepository) domain.UserUsecase {
	return &userUsecase{userRepo: userRepo, authRepo: authRepo}
}

func (u *userUsecase) GetCurrentUser(ctx context.Context, userID int) (*dto.UserResponseDTO, error) {
	user, err := u.userRepo.GetUserByID(ctx, userID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.New("user tidak ditemukan")
	}
	return userToDTO(user), nil
}

func (u *userUsecase) UpdateProfile(ctx context.Context, userID int, req dto.UpdateProfileRequestDTO) error {
	user, err := u.userRepo.GetUserByID(ctx, userID)
	if err != nil {
		return err
	}
	if user == nil {
		return errors.New("user tidak ditemukan")
	}

	if req.Nama != nil && *req.Nama != "" {
		user.Nama = *req.Nama
	}
	if req.Password != nil && *req.Password != "" {
		hashed, err := utils.HashPassword(*req.Password)
		if err != nil {
			return err
		}
		user.Password = hashed
	}

	return u.userRepo.UpdateUserProfile(ctx, userID, user.Nama, user.Password)
}

func (u *userUsecase) AddUser(ctx context.Context, req dto.AddUserRequestDTO) error {
	existing, err := u.userRepo.GetUserByEmail(ctx, req.Email)
	if err != nil {
		return err
	}
	if existing != nil {
		return errors.New("email sudah terdaftar")
	}

	hashed, err := utils.HashPassword(req.Password)
	if err != nil {
		return err
	}
	_, err = u.userRepo.CreateUser(ctx, req.Nama, req.Email, hashed, domain.RoleAdmin)
	return err
}

func (u *userUsecase) GetAllUsers(ctx context.Context) ([]dto.UserResponseDTO, error) {
	users, err := u.userRepo.GetAllUsers(ctx)
	if err != nil {
		return nil, err
	}

	result := make([]dto.UserResponseDTO, 0, len(users))
	for i := range users {
		result = append(result, *userToDTO(&users[i]))
	}
	return result, nil
}

func (u *userUsecase) DeleteUser(ctx context.Context, callerID, id int) error {
	if id <= 0 {
		return errors.New("ID user harus diisi")
	}
	if callerID == id {
		return errors.New("tidak dapat menghapus akun sendiri")
	}

	target, err := u.userRepo.GetUserByID(ctx, id)
	if err != nil {
		return err
	}
	if target == nil {
		return errors.New("user tidak ditemukan")
	}
	if target.Role == domain.RoleSuperadmin {
		return errors.New("superadmin tidak dapat dihapus, pindahkan terlebih dahulu")
	}

	if err := u.authRepo.RevokeAllUserTokens(ctx, id); err != nil {
		return err
	}
	_, err = u.userRepo.DeleteUser(ctx, id)
	return err
}

func (u *userUsecase) TransferSuperadmin(ctx context.Context, fromID, toID int) error {
	if fromID == toID {
		return errors.New("tidak dapat memindahkan superadmin ke diri sendiri")
	}

	target, err := u.userRepo.GetUserByID(ctx, toID)
	if err != nil {
		return err
	}
	if target == nil {
		return errors.New("user tujuan tidak ditemukan")
	}
	return u.userRepo.TransferSuperadmin(ctx, fromID, toID)
}

func (u *userUsecase) ResetPassword(ctx context.Context, email string) error {
	user, err := u.userRepo.GetUserByEmail(ctx, email)
	if err != nil {
		return err
	}
	if user == nil {
		return errors.New("user dengan email tersebut tidak ditemukan")
	}

	hashed, err := utils.HashPassword(defaultResetPassword)
	if err != nil {
		return err
	}
	return u.userRepo.ResetPassword(ctx, email, hashed)
}

func userToDTO(u *domain.User) *dto.UserResponseDTO {
	return &dto.UserResponseDTO{
		ID:        u.ID,
		Nama:      u.Nama,
		Email:     u.Email,
		Role:      u.Role,
		LastLogin: u.LastLogin,
	}
}
