package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rasyarhmt/desa-bahontobungku/domain"
	"github.com/rasyarhmt/desa-bahontobungku/dto"
	"github.com/rasyarhmt/desa-bahontobungku/helpers"
	"github.com/sirupsen/logrus"
)

type authHandler struct {
	authUsecase domain.AuthUsecase
}

func NewAuthHandler(authUsecase domain.AuthUsecase) domain.AuthHandler {
	return &authHandler{authUsecase: authUsecase}
}

// Login godoc
// @Summary      Login admin
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        request  body      dto.LoginRequestDTO  true  "Login credentials"
// @Success      200      {object}  domain.HttpResponse{data=dto.LoginResponseDTO}
// @Failure      400      {object}  domain.HttpResponse
// @Failure      401      {object}  domain.HttpResponse
// @Router       /auth/login [post]
func (h *authHandler) Login(c *gin.Context) {
	var req dto.LoginRequestDTO
	if err := helpers.DecodeJSON(c, &req); err != nil {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "Email dan password wajib diisi",
		})
		return
	}

	res, err := h.authUsecase.Login(c.Request.Context(), req, c.Request.UserAgent(), c.ClientIP())
	if err != nil {
		logrus.WithError(err).Warn("handler.Auth.Login: unauthorized")
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusUnauthorized,
			Message: err.Error(),
		})
		return
	}

	helpers.Response(c, domain.HttpResponse{
		Code:    http.StatusOK,
		Message: "Login berhasil",
		Data:    res,
	})
}

// RefreshToken godoc
// @Summary      Refresh access token
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        request  body      dto.RefreshTokenRequestDTO  true  "Refresh token"
// @Success      200      {object}  domain.HttpResponse{data=dto.RefreshTokenResponseDTO}
// @Failure      400      {object}  domain.HttpResponse
// @Failure      401      {object}  domain.HttpResponse
// @Router       /auth/refresh [post]
func (h *authHandler) RefreshToken(c *gin.Context) {
	var req dto.RefreshTokenRequestDTO
	if err := helpers.DecodeJSON(c, &req); err != nil {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "Refresh token wajib diisi",
		})
		return
	}

	res, err := h.authUsecase.RefreshToken(c.Request.Context(), req, c.Request.UserAgent(), c.ClientIP())
	if err != nil {
		logrus.WithError(err).Warn("handler.Auth.RefreshToken: unauthorized")
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusUnauthorized,
			Message: err.Error(),
		})
		return
	}

	helpers.Response(c, domain.HttpResponse{
		Code:    http.StatusOK,
		Message: "Token berhasil diperbarui",
		Data:    res,
	})
}

// Logout godoc
// @Summary      Logout admin
// @Tags         auth
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request  body      dto.RefreshTokenRequestDTO  true  "Refresh token"
// @Success      200      {object}  domain.HttpResponse
// @Failure      400      {object}  domain.HttpResponse
// @Failure      401      {object}  domain.HttpResponse
// @Router       /auth/logout [post]
func (h *authHandler) Logout(c *gin.Context) {
	var req dto.RefreshTokenRequestDTO
	if err := helpers.DecodeJSON(c, &req); err != nil {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "Refresh token wajib diisi",
		})
		return
	}

	if err := h.authUsecase.Logout(c.Request.Context(), req.RefreshToken); err != nil {
		logrus.WithError(err).Error("handler.Auth.Logout: failed")
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: err.Error(),
		})
		return
	}

	helpers.Response(c, domain.HttpResponse{
		Code:    http.StatusOK,
		Message: "Berhasil logout",
	})
}
