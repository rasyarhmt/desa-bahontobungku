package handler

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/rasyarhmt/desa-bahontobungku/domain"
	"github.com/rasyarhmt/desa-bahontobungku/dto"
	"github.com/rasyarhmt/desa-bahontobungku/helpers"
	"github.com/rasyarhmt/desa-bahontobungku/http/middlewares"
	"github.com/sirupsen/logrus"
)

type userHandler struct {
	userUsecase domain.UserUsecase
}

func NewUserHandler(userUsecase domain.UserUsecase) domain.UserHandler {
	return &userHandler{
		userUsecase: userUsecase,
	}
}

// GetCurrentUser godoc
// @Summary      Get current user
// @Tags         user
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  domain.HttpResponse{data=dto.UserResponseDTO}
// @Failure      401  {object}  domain.HttpResponse
// @Failure      404  {object}  domain.HttpResponse
// @Router       /user/current-user [get]
func (h *userHandler) GetCurrentUser(c *gin.Context) {
	claims, ok := middlewares.GetAuthClaims(c)
	if !ok {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusUnauthorized,
			Message: "Akses Ditolak!",
		})
		return
	}

	user, err := h.userUsecase.GetCurrentUser(c.Request.Context(), claims.UserID)
	if err != nil {
		logrus.WithError(err).Error("handler.User.GetCurrentUser: failed")
		code := http.StatusInternalServerError
		if strings.Contains(err.Error(), "tidak ditemukan") {
			code = http.StatusNotFound
		}
		helpers.Response(c, domain.HttpResponse{
			Code:    code,
			Message: err.Error(),
		})
		return
	}

	helpers.Response(c, domain.HttpResponse{
		Code:    http.StatusOK,
		Message: "Data profil berhasil diambil",
		Data:    user,
	})
}

// UpdateProfile godoc
// @Summary      Update profile
// @Tags         user
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request  body      dto.UpdateProfileRequestDTO  true  "Data update"
// @Success      200      {object}  domain.HttpResponse
// @Failure      400      {object}  domain.HttpResponse
// @Failure      401      {object}  domain.HttpResponse
// @Router       /user/update [put]
func (h *userHandler) UpdateProfile(c *gin.Context) {
	claims, ok := middlewares.GetAuthClaims(c)
	if !ok {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusUnauthorized,
			Message: "Akses Ditolak!",
		})
		return
	}

	var req dto.UpdateProfileRequestDTO
	if err := helpers.DecodeJSON(c, &req); err != nil {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "Input tidak valid: " + err.Error(),
		})
		return
	}

	if err := h.userUsecase.UpdateProfile(c.Request.Context(), claims.UserID, req); err != nil {
		logrus.WithError(err).Error("handler.User.UpdateProfile: failed")
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusInternalServerError,
			Message: err.Error(),
		})
		return
	}

	helpers.Response(c, domain.HttpResponse{
		Code:    http.StatusOK,
		Message: "Profil berhasil diperbarui",
	})
}

// AddUser godoc
// @Summary      Tambah admin baru
// @Tags         user
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request  body      dto.AddUserRequestDTO  true  "Data admin baru"
// @Success      201      {object}  domain.HttpResponse
// @Failure      400      {object}  domain.HttpResponse
// @Failure      403      {object}  domain.HttpResponse
// @Router       /user/add [post]
func (h *userHandler) AddUser(c *gin.Context) {
	var req dto.AddUserRequestDTO
	if err := helpers.DecodeJSON(c, &req); err != nil {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "Nama, email, dan password (min 8 karakter) wajib diisi",
		})
		return
	}

	if err := h.userUsecase.AddUser(c.Request.Context(), req); err != nil {
		logrus.WithError(err).Error("handler.User.AddUser: failed")
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: err.Error(),
		})
		return
	}

	helpers.Response(c, domain.HttpResponse{
		Code:    http.StatusCreated,
		Message: "User berhasil ditambahkan",
	})
}

// GetAllUsers godoc
// @Summary      Get all admin
// @Tags         user
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  domain.HttpResponse{data=[]dto.UserResponseDTO}
// @Failure      401  {object}  domain.HttpResponse
// @Failure      403  {object}  domain.HttpResponse
// @Router       /user/all [get]
func (h *userHandler) GetAllUsers(c *gin.Context) {
	users, err := h.userUsecase.GetAllUsers(c.Request.Context())
	if err != nil {
		logrus.WithError(err).Error("handler.User.GetAllUsers: failed")
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusInternalServerError,
			Message: "Gagal mengambil daftar user",
		})
		return
	}

	helpers.Response(c, domain.HttpResponse{
		Code:    http.StatusOK,
		Message: "Daftar user berhasil diambil",
		Data:    users,
	})
}

// DeleteUser godoc
// @Summary      Hapus admin
// @Tags         user
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      int  true  "User ID"
// @Success      200  {object}  domain.HttpResponse
// @Failure      400  {object}  domain.HttpResponse
// @Failure      401  {object}  domain.HttpResponse
// @Failure      403  {object}  domain.HttpResponse
// @Failure      404  {object}  domain.HttpResponse
// @Router       /user/{id} [delete]
func (h *userHandler) DeleteUser(c *gin.Context) {
	claims, ok := middlewares.GetAuthClaims(c)
	if !ok {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusUnauthorized,
			Message: "Akses Ditolak!",
		})
		return
	}

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "ID user harus berupa angka",
		})
		return
	}

	if err := h.userUsecase.DeleteUser(c.Request.Context(), claims.UserID, id); err != nil {
		logrus.WithError(err).Error("handler.User.DeleteUser: failed")
		code := http.StatusBadRequest
		if strings.Contains(err.Error(), "tidak ditemukan") {
			code = http.StatusNotFound
		}
		helpers.Response(c, domain.HttpResponse{
			Code:    code,
			Message: err.Error(),
		})
		return
	}

	helpers.Response(c, domain.HttpResponse{
		Code:    http.StatusOK,
		Message: "User berhasil dihapus",
	})
}

// TransferSuperadmin godoc
// @Summary      Transfer superadmin
// @Tags         user
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request  body      dto.TransferSuperadminRequestDTO  true  "Target user ID"
// @Success      200      {object}  domain.HttpResponse
// @Failure      400      {object}  domain.HttpResponse
// @Failure      401      {object}  domain.HttpResponse
// @Failure      403      {object}  domain.HttpResponse
// @Router       /user/transfer-superadmin [post]
func (h *userHandler) TransferSuperadmin(c *gin.Context) {
	claims, ok := middlewares.GetAuthClaims(c)
	if !ok {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusUnauthorized,
			Message: "Akses Ditolak!",
		})
		return
	}

	var req dto.TransferSuperadminRequestDTO
	if err := helpers.DecodeJSON(c, &req); err != nil {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "ID user baru wajib diisi",
		})
		return
	}

	if err := h.userUsecase.TransferSuperadmin(c.Request.Context(), claims.UserID, req.ToID); err != nil {
		logrus.WithError(err).Error("handler.User.TransferSuperadmin: failed")
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: err.Error(),
		})
		return
	}

	helpers.Response(c, domain.HttpResponse{
		Code:    http.StatusOK,
		Message: "Superadmin berhasil dipindahkan",
	})
}

// ResetPassword godoc
// @Summary      Reset password ke default
// @Tags         user
// @Accept       json
// @Produce      json
// @Param        request  body      dto.ResetPasswordRequestDTO  true  "Email user"
// @Success      200      {object}  domain.HttpResponse
// @Failure      400      {object}  domain.HttpResponse
// @Failure      404      {object}  domain.HttpResponse
// @Router       /user/reset-password [post]
func (h *userHandler) ResetPassword(c *gin.Context) {
	var req dto.ResetPasswordRequestDTO
	if err := helpers.DecodeJSON(c, &req); err != nil {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "Email wajib diisi",
		})
		return
	}

	if err := h.userUsecase.ResetPassword(c.Request.Context(), req.Email); err != nil {
		logrus.WithError(err).Error("handler.User.ResetPassword: failed")
		code := http.StatusBadRequest
		if strings.Contains(err.Error(), "tidak ditemukan") {
			code = http.StatusNotFound
		}
		helpers.Response(c, domain.HttpResponse{
			Code:    code,
			Message: err.Error(),
		})
		return
	}

	helpers.Response(c, domain.HttpResponse{
		Code:    http.StatusOK,
		Message: "Password berhasil direset ke default",
	})
}
