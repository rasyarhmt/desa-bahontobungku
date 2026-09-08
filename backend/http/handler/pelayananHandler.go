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

type pelayananHandler struct {
	pelayananUsecase domain.PelayananUsecase
}

func NewPelayananHandler(pelayananUsecase domain.PelayananUsecase) domain.PelayananHandler {
	return &pelayananHandler{pelayananUsecase: pelayananUsecase}
}

// Create godoc
// @Summary      Tambah pelayanan baru
// @Tags         pelayanan
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        body   body      dto.PelayananCreateRequestDTO  true  "Data pelayanan"
// @Success      201    {object}  domain.HttpResponse
// @Failure      400    {object}  domain.HttpResponse
// @Failure      401    {object}  domain.HttpResponse
// @Router       /pelayanan [post]
func (h *pelayananHandler) Create(c *gin.Context) {
	var req dto.PelayananCreateRequestDTO
	if err := helpers.DecodeJSON(c, &req); err != nil {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "Format data pelayanan tidak valid: " + err.Error(),
		})
		return
	}

	if err := h.pelayananUsecase.Create(c.Request.Context(), req); err != nil {
		logrus.WithError(err).Error("handler.Pelayanan.Create: failed")
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: err.Error(),
		})
		return
	}

	helpers.Response(c, domain.HttpResponse{
		Code:    http.StatusCreated,
		Message: "Pelayanan berhasil ditambahkan",
	})
}

// GetAll godoc
// @Summary      Get all pelayanan
// @Tags         pelayanan
// @Produce      json
// @Success      200  {object}  domain.HttpResponse{data=[]dto.PelayananResponseDTO}
// @Failure      500  {object}  domain.HttpResponse
// @Router       /pelayanan [get]
func (h *pelayananHandler) GetAll(c *gin.Context) {
	list, err := h.pelayananUsecase.GetAll(c.Request.Context())
	if err != nil {
		logrus.WithError(err).Error("handler.Pelayanan.GetAll: failed")
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusInternalServerError,
			Message: "Gagal mengambil daftar pelayanan",
		})
		return
	}

	helpers.Response(c, domain.HttpResponse{
		Code:    http.StatusOK,
		Message: "Daftar pelayanan berhasil diambil",
		Data:    list,
	})
}

// GetByID godoc
// @Summary      Get pelayanan by id
// @Tags         pelayanan
// @Produce      json
// @Param        id     path      integer  true  "ID pelayanan"
// @Success      200    {object}  domain.HttpResponse{data=dto.PelayananResponseDTO}
// @Failure      400    {object}  domain.HttpResponse
// @Failure      404    {object}  domain.HttpResponse
// @Router       /pelayanan/{id} [get]
func (h *pelayananHandler) GetByID(c *gin.Context) {
	id, errParse := strconv.Atoi(strings.TrimSpace(c.Param("id")))
	if errParse != nil || id <= 0 {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "ID pelayanan tidak valid",
		})
		return
	}

	p, err := h.pelayananUsecase.GetByID(c.Request.Context(), id)
	if err != nil {
		logrus.WithError(err).Error("handler.Pelayanan.GetByID: failed")
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
		Message: "Pelayanan berhasil diambil",
		Data:    p,
	})
}

// GetTemplateFields godoc
// @Summary      Daftar field template surat pelayanan (publik)
// @Description  Mengembalikan key placeholder {{ key }} pada template milik pelayanan untuk pembuatan form warga. Key nama_pemohon & nik_pemohon dikecualikan (selalu wajib).
// @Tags         pelayanan
// @Produce      json
// @Param        id   path  int  true  "ID pelayanan"
// @Success      200  {object}  domain.HttpResponse
// @Failure      400  {object}  domain.HttpResponse
// @Failure      404  {object}  domain.HttpResponse
// @Router       /pelayanan/{id}/surat/fields [get]
func (h *pelayananHandler) GetTemplateFields(c *gin.Context) {
	id, errParse := strconv.Atoi(strings.TrimSpace(c.Param("id")))
	if errParse != nil || id <= 0 {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "ID pelayanan tidak valid",
		})
		return
	}

	fields, err := h.pelayananUsecase.GetTemplateFields(c.Request.Context(), id)
	if err != nil {
		logrus.WithError(err).Error("handler.Pelayanan.GetTemplateFields: failed")
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
		Message: "Field template berhasil diambil",
		Data:    fields,
	})
}

// Update godoc
// @Summary      Update pelayanan
// @Tags         pelayanan
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id     path      integer  true  "ID pelayanan"
// @Param        body   body      dto.PelayananUpdateRequestDTO  true  "Data pelayanan"
// @Success      200    {object}  domain.HttpResponse
// @Failure      400    {object}  domain.HttpResponse
// @Failure      401    {object}  domain.HttpResponse
// @Failure      404    {object}  domain.HttpResponse
// @Router       /pelayanan/{id} [put]
func (h *pelayananHandler) Update(c *gin.Context) {
	id, errParse := strconv.Atoi(strings.TrimSpace(c.Param("id")))
	if errParse != nil || id <= 0 {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "ID pelayanan tidak valid",
		})
		return
	}

	var req dto.PelayananUpdateRequestDTO
	if err := helpers.DecodeJSON(c, &req); err != nil {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "Format data pelayanan tidak valid: " + err.Error(),
		})
		return
	}

	if err := h.pelayananUsecase.Update(c.Request.Context(), id, req); err != nil {
		logrus.WithError(err).Error("handler.Pelayanan.Update: failed")
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
		Message: "Pelayanan berhasil diperbarui",
	})
}

// Delete godoc
// @Summary      Hapus pelayanan
// @Tags         pelayanan
// @Produce      json
// @Security     BearerAuth
// @Param        id     path      integer  true  "ID pelayanan"
// @Success      200    {object}  domain.HttpResponse
// @Failure      400    {object}  domain.HttpResponse
// @Failure      401    {object}  domain.HttpResponse
// @Failure      404    {object}  domain.HttpResponse
// @Router       /pelayanan/{id} [delete]
func (h *pelayananHandler) Delete(c *gin.Context) {
	id, errParse := strconv.Atoi(strings.TrimSpace(c.Param("id")))
	if errParse != nil || id <= 0 {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "ID pelayanan tidak valid",
		})
		return
	}

	if err := h.pelayananUsecase.Delete(c.Request.Context(), id); err != nil {
		logrus.WithError(err).Error("handler.Pelayanan.Delete: failed")
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
		Message: "Pelayanan berhasil dihapus",
	})
}

// ToggleStatus godoc
// @Summary      Toggle status pelayanan (aktif/nonaktif)
// @Tags         pelayanan
// @Produce      json
// @Security     BearerAuth
// @Param        id     path      integer  true  "ID pelayanan"
// @Success      200    {object}  domain.HttpResponse
// @Failure      400    {object}  domain.HttpResponse
// @Failure      401    {object}  domain.HttpResponse
// @Failure      404    {object}  domain.HttpResponse
// @Router       /pelayanan/{id}/toggle-status [put]
func (h *pelayananHandler) ToggleStatus(c *gin.Context) {
	id, errParse := strconv.Atoi(strings.TrimSpace(c.Param("id")))
	if errParse != nil || id <= 0 {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "ID pelayanan tidak valid",
		})
		return
	}

	if err := h.pelayananUsecase.ToggleStatus(c.Request.Context(), id); err != nil {
		logrus.WithError(err).Error("handler.Pelayanan.ToggleStatus: failed")
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
		Message: "Status pelayanan berhasil diubah",
	})
}
