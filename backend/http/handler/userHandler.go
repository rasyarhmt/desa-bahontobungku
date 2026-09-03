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
