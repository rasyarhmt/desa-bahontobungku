package handler

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/rasyarhmt/desa-bahontobungku/domain"
	"github.com/rasyarhmt/desa-bahontobungku/dto"
	"github.com/rasyarhmt/desa-bahontobungku/helpers"
	"github.com/sirupsen/logrus"
)

type pengumumanHandler struct {
	pengumumanUsecase domain.PengumumanUsecase
}

func NewPengumumanHandler(pengumumanUsecase domain.PengumumanUsecase) domain.PengumumanHandler {
	return &pengumumanHandler{pengumumanUsecase: pengumumanUsecase}
}

// Create godoc
// @Summary      Tambah pengumuman baru
// @Tags         pengumuman
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        body  body      dto.PengumumanCreateRequestDTO  true  "Data pengumuman"
// @Success      201   {object}  domain.HttpResponse{data=dto.PengumumanResponseDTO}
// @Failure      400   {object}  domain.HttpResponse
// @Failure      401   {object}  domain.HttpResponse
// @Router       /pengumuman [post]
func (h *pengumumanHandler) Create(c *gin.Context) {
	var req dto.PengumumanCreateRequestDTO
	if err := helpers.DecodeJSON(c, &req); err != nil {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "Format JSON tidak valid",
		})
		return
	}

	result, err := h.pengumumanUsecase.Create(c.Request.Context(), req)
	if err != nil {
		logrus.WithError(err).Error("handler.Pengumuman.Create: failed")
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: err.Error(),
		})
		return
	}

	helpers.Response(c, domain.HttpResponse{
		Code:    http.StatusCreated,
		Message: "Pengumuman berhasil ditambahkan",
		Data:    result,
	})
}

// GetAll godoc
// @Summary      Get semua pengumuman
// @Description  Daftar pengumuman untuk publik, diurutkan tanggalMulai terbaru
// @Tags         pengumuman
// @Produce      json
// @Success      200  {object}  domain.HttpResponse{data=[]dto.PengumumanResponseDTO}
// @Failure      500  {object}  domain.HttpResponse
// @Router       /pengumuman [get]
func (h *pengumumanHandler) GetAll(c *gin.Context) {
	list, err := h.pengumumanUsecase.GetAll(c.Request.Context())
	if err != nil {
		logrus.WithError(err).Error("handler.Pengumuman.GetAll: failed")
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusInternalServerError,
			Message: "Gagal mengambil daftar pengumuman",
		})
		return
	}

	helpers.Response(c, domain.HttpResponse{
		Code:    http.StatusOK,
		Message: "Daftar pengumuman berhasil diambil",
		Data:    list,
	})
}

// GetByID godoc
// @Summary      Get pengumuman by id
// @Tags         pengumuman
// @Produce      json
// @Param        id     path      integer  true  "ID pengumuman"
// @Success      200    {object}  domain.HttpResponse{data=dto.PengumumanResponseDTO}
// @Failure      400    {object}  domain.HttpResponse
// @Failure      404    {object}  domain.HttpResponse
// @Router       /pengumuman/{id} [get]
func (h *pengumumanHandler) GetByID(c *gin.Context) {
	id, errParse := strconv.Atoi(strings.TrimSpace(c.Param("id")))
	if errParse != nil || id <= 0 {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "ID pengumuman tidak valid",
		})
		return
	}

	p, err := h.pengumumanUsecase.GetByID(c.Request.Context(), id)
	if err != nil {
		logrus.WithError(err).Error("handler.Pengumuman.GetByID: failed")
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
		Message: "Pengumuman berhasil diambil",
		Data:    p,
	})
}

// Update godoc
// @Summary      Update pengumuman
// @Tags         pengumuman
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id    path      integer  true  "ID pengumuman"
// @Param        body  body      dto.PengumumanUpdateRequestDTO  true  "Data pengumuman (isi sesuai yang ingin diubah)"
// @Success      200   {object}  domain.HttpResponse
// @Failure      400   {object}  domain.HttpResponse
// @Failure      401   {object}  domain.HttpResponse
// @Failure      404   {object}  domain.HttpResponse
// @Router       /pengumuman/{id} [put]
func (h *pengumumanHandler) Update(c *gin.Context) {
	id, errParse := strconv.Atoi(strings.TrimSpace(c.Param("id")))
	if errParse != nil || id <= 0 {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "ID pengumuman tidak valid",
		})
		return
	}

	var req dto.PengumumanUpdateRequestDTO
	if err := helpers.DecodeJSON(c, &req); err != nil {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "Format JSON tidak valid",
		})
		return
	}

	if err := h.pengumumanUsecase.Update(c.Request.Context(), id, req); err != nil {
		logrus.WithError(err).Error("handler.Pengumuman.Update: failed")
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
		Message: "Pengumuman berhasil diperbarui",
	})
}

// Delete godoc
// @Summary      Hapus pengumuman
// @Tags         pengumuman
// @Produce      json
// @Security     BearerAuth
// @Param        id     path      integer  true  "ID pengumuman"
// @Success      200    {object}  domain.HttpResponse
// @Failure      400    {object}  domain.HttpResponse
// @Failure      401    {object}  domain.HttpResponse
// @Failure      404    {object}  domain.HttpResponse
// @Router       /pengumuman/{id} [delete]
func (h *pengumumanHandler) Delete(c *gin.Context) {
	id, errParse := strconv.Atoi(strings.TrimSpace(c.Param("id")))
	if errParse != nil || id <= 0 {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "ID pengumuman tidak valid",
		})
		return
	}

	if err := h.pengumumanUsecase.Delete(c.Request.Context(), id); err != nil {
		logrus.WithError(err).Error("handler.Pengumuman.Delete: failed")
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
		Message: "Pengumuman berhasil dihapus",
	})
}
