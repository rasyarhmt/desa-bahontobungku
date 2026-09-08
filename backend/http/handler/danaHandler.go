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

type danaHandler struct {
	danaUsecase domain.DanaUsecase
}

func NewDanaHandler(danaUsecase domain.DanaUsecase) domain.DanaHandler {
	return &danaHandler{danaUsecase: danaUsecase}
}

// CreateMasuk godoc
// @Summary      Tambah data dana masuk (pemasukan APBDes)
// @Tags         dana
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        body  body      dto.DanaMasukCreateRequestDTO  true  "Data dana masuk"
// @Success      201   {object}  domain.HttpResponse{data=dto.DanaMasukResponseDTO}
// @Failure      400   {object}  domain.HttpResponse
// @Failure      401   {object}  domain.HttpResponse
// @Router       /dana/apbdes/dana-masuk [post]
func (h *danaHandler) CreateMasuk(c *gin.Context) {
	var req dto.DanaMasukCreateRequestDTO
	if err := helpers.DecodeJSON(c, &req); err != nil {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "Format JSON tidak valid",
		})
		return
	}

	result, err := h.danaUsecase.CreateMasuk(c.Request.Context(), req)
	if err != nil {
		logrus.WithError(err).Error("handler.Dana.CreateMasuk: failed")
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: err.Error(),
		})
		return
	}

	helpers.Response(c, domain.HttpResponse{
		Code:    http.StatusCreated,
		Message: "Dana masuk berhasil ditambahkan",
		Data:    result,
	})
}

// CreateKeluar godoc
// @Summary      Tambah data dana keluar (pengeluaran APBDes)
// @Tags         dana
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        body  body      dto.DanaKeluarCreateRequestDTO  true  "Data dana keluar"
// @Success      201   {object}  domain.HttpResponse{data=dto.DanaKeluarResponseDTO}
// @Failure      400   {object}  domain.HttpResponse
// @Failure      401   {object}  domain.HttpResponse
// @Router       /dana/apbdes/dana-keluar [post]
func (h *danaHandler) CreateKeluar(c *gin.Context) {
	var req dto.DanaKeluarCreateRequestDTO
	if err := helpers.DecodeJSON(c, &req); err != nil {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "Format JSON tidak valid",
		})
		return
	}

	result, err := h.danaUsecase.CreateKeluar(c.Request.Context(), req)
	if err != nil {
		logrus.WithError(err).Error("handler.Dana.CreateKeluar: failed")
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: err.Error(),
		})
		return
	}

	helpers.Response(c, domain.HttpResponse{
		Code:    http.StatusCreated,
		Message: "Dana keluar berhasil ditambahkan",
		Data:    result,
	})
}

// GetAllMasuk godoc
// @Summary      Get semua dana masuk
// @Tags         dana
// @Produce      json
// @Success      200  {object}  domain.HttpResponse{data=[]dto.DanaMasukResponseDTO}
// @Failure      500  {object}  domain.HttpResponse
// @Router       /dana/apbdes/dana-masuk [get]
func (h *danaHandler) GetAllMasuk(c *gin.Context) {
	list, err := h.danaUsecase.GetAllMasuk(c.Request.Context())
	if err != nil {
		logrus.WithError(err).Error("handler.Dana.GetAllMasuk: failed")
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusInternalServerError,
			Message: "Gagal mengambil data dana masuk",
		})
		return
	}

	helpers.Response(c, domain.HttpResponse{
		Code:    http.StatusOK,
		Message: "Daftar dana masuk berhasil diambil",
		Data:    list,
	})
}

// GetAllKeluar godoc
// @Summary      Get semua dana keluar
// @Tags         dana
// @Produce      json
// @Success      200  {object}  domain.HttpResponse{data=[]dto.DanaKeluarResponseDTO}
// @Failure      500  {object}  domain.HttpResponse
// @Router       /dana/apbdes/dana-keluar [get]
func (h *danaHandler) GetAllKeluar(c *gin.Context) {
	list, err := h.danaUsecase.GetAllKeluar(c.Request.Context())
	if err != nil {
		logrus.WithError(err).Error("handler.Dana.GetAllKeluar: failed")
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusInternalServerError,
			Message: "Gagal mengambil data dana keluar",
		})
		return
	}

	helpers.Response(c, domain.HttpResponse{
		Code:    http.StatusOK,
		Message: "Daftar dana keluar berhasil diambil",
		Data:    list,
	})
}

// GetMasukByID godoc
// @Summary      Get dana masuk by id
// @Tags         dana
// @Produce      json
// @Param        id     path      integer  true  "ID dana masuk"
// @Success      200    {object}  domain.HttpResponse{data=dto.DanaMasukResponseDTO}
// @Failure      400    {object}  domain.HttpResponse
// @Failure      404    {object}  domain.HttpResponse
// @Router       /dana/apbdes/dana-masuk/{id} [get]
func (h *danaHandler) GetMasukByID(c *gin.Context) {
	id, errParse := strconv.Atoi(strings.TrimSpace(c.Param("id")))
	if errParse != nil || id <= 0 {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "ID dana masuk tidak valid",
		})
		return
	}

	d, err := h.danaUsecase.GetMasukByID(c.Request.Context(), id)
	if err != nil {
		logrus.WithError(err).Error("handler.Dana.GetMasukByID: failed")
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
		Message: "Dana masuk berhasil diambil",
		Data:    d,
	})
}

// GetKeluarByID godoc
// @Summary      Get dana keluar by id
// @Tags         dana
// @Produce      json
// @Param        id     path      integer  true  "ID dana keluar"
// @Success      200    {object}  domain.HttpResponse{data=dto.DanaKeluarResponseDTO}
// @Failure      400    {object}  domain.HttpResponse
// @Failure      404    {object}  domain.HttpResponse
// @Router       /dana/apbdes/dana-keluar/{id} [get]
func (h *danaHandler) GetKeluarByID(c *gin.Context) {
	id, errParse := strconv.Atoi(strings.TrimSpace(c.Param("id")))
	if errParse != nil || id <= 0 {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "ID dana keluar tidak valid",
		})
		return
	}

	d, err := h.danaUsecase.GetKeluarByID(c.Request.Context(), id)
	if err != nil {
		logrus.WithError(err).Error("handler.Dana.GetKeluarByID: failed")
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
		Message: "Dana keluar berhasil diambil",
		Data:    d,
	})
}

// GetSummary godoc
// @Summary      Get ringkasan APBDes per tahun
// @Description  Mengembalikan [{tipe: Pemasukan, tahun, total}, {tipe: Pengeluaran, tahun, total}]
// @Tags         dana
// @Produce      json
// @Param        tahun  path      integer  true  "Tahun"
// @Success      200    {object}  domain.HttpResponse{data=[]dto.DanaSummaryItemDTO}
// @Failure      400    {object}  domain.HttpResponse
// @Failure      500    {object}  domain.HttpResponse
// @Router       /dana/apbdes/summary/{tahun} [get]
func (h *danaHandler) GetSummary(c *gin.Context) {
	tahun, errParse := strconv.Atoi(strings.TrimSpace(c.Param("tahun")))
	if errParse != nil || tahun <= 0 {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "Tahun tidak valid",
		})
		return
	}

	list, err := h.danaUsecase.GetSummary(c.Request.Context(), tahun)
	if err != nil {
		logrus.WithError(err).Error("handler.Dana.GetSummary: failed")
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusInternalServerError,
			Message: "Gagal mengambil ringkasan APBDes",
		})
		return
	}

	helpers.Response(c, domain.HttpResponse{
		Code:    http.StatusOK,
		Message: "Ringkasan APBDes berhasil diambil",
		Data:    list,
	})
}

// GetDetail godoc
// @Summary      Get detail APBDes per tahun (per bulan)
// @Tags         dana
// @Produce      json
// @Param        tahun  path      integer  true  "Tahun"
// @Success      200    {object}  domain.HttpResponse{data=dto.DanaDetailDTO}
// @Failure      400    {object}  domain.HttpResponse
// @Failure      500    {object}  domain.HttpResponse
// @Router       /dana/apbdes/detail/{tahun} [get]
func (h *danaHandler) GetDetail(c *gin.Context) {
	tahun, errParse := strconv.Atoi(strings.TrimSpace(c.Param("tahun")))
	if errParse != nil || tahun <= 0 {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "Tahun tidak valid",
		})
		return
	}

	detail, err := h.danaUsecase.GetDetail(c.Request.Context(), tahun)
	if err != nil {
		logrus.WithError(err).Error("handler.Dana.GetDetail: failed")
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusInternalServerError,
			Message: "Gagal mengambil detail APBDes",
		})
		return
	}

	helpers.Response(c, domain.HttpResponse{
		Code:    http.StatusOK,
		Message: "Detail APBDes berhasil diambil",
		Data:    detail,
	})
}

// UpdateMasuk godoc
// @Summary      Update dana masuk
// @Tags         dana
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id    path      integer  true  "ID dana masuk"
// @Param        body  body      dto.DanaMasukUpdateRequestDTO  true  "Data dana masuk (partial)"
// @Success      200   {object}  domain.HttpResponse
// @Failure      400   {object}  domain.HttpResponse
// @Failure      401   {object}  domain.HttpResponse
// @Failure      404   {object}  domain.HttpResponse
// @Router       /dana/apbdes/dana-masuk/{id} [put]
func (h *danaHandler) UpdateMasuk(c *gin.Context) {
	id, errParse := strconv.Atoi(strings.TrimSpace(c.Param("id")))
	if errParse != nil || id <= 0 {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "ID dana masuk tidak valid",
		})
		return
	}

	var req dto.DanaMasukUpdateRequestDTO
	if err := helpers.DecodeJSON(c, &req); err != nil {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "Format JSON tidak valid",
		})
		return
	}

	if err := h.danaUsecase.UpdateMasuk(c.Request.Context(), id, req); err != nil {
		logrus.WithError(err).Error("handler.Dana.UpdateMasuk: failed")
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
		Message: "Dana masuk berhasil diperbarui",
	})
}

// UpdateKeluar godoc
// @Summary      Update dana keluar
// @Tags         dana
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id    path      integer  true  "ID dana keluar"
// @Param        body  body      dto.DanaKeluarUpdateRequestDTO  true  "Data dana keluar (partial)"
// @Success      200   {object}  domain.HttpResponse
// @Failure      400   {object}  domain.HttpResponse
// @Failure      401   {object}  domain.HttpResponse
// @Failure      404   {object}  domain.HttpResponse
// @Router       /dana/apbdes/dana-keluar/{id} [put]
func (h *danaHandler) UpdateKeluar(c *gin.Context) {
	id, errParse := strconv.Atoi(strings.TrimSpace(c.Param("id")))
	if errParse != nil || id <= 0 {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "ID dana keluar tidak valid",
		})
		return
	}

	var req dto.DanaKeluarUpdateRequestDTO
	if err := helpers.DecodeJSON(c, &req); err != nil {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "Format JSON tidak valid",
		})
		return
	}

	if err := h.danaUsecase.UpdateKeluar(c.Request.Context(), id, req); err != nil {
		logrus.WithError(err).Error("handler.Dana.UpdateKeluar: failed")
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
		Message: "Dana keluar berhasil diperbarui",
	})
}

// DeleteMasuk godoc
// @Summary      Hapus dana masuk
// @Tags         dana
// @Produce      json
// @Security     BearerAuth
// @Param        id     path      integer  true  "ID dana masuk"
// @Success      200    {object}  domain.HttpResponse
// @Failure      400    {object}  domain.HttpResponse
// @Failure      401    {object}  domain.HttpResponse
// @Failure      404    {object}  domain.HttpResponse
// @Router       /dana/apbdes/dana-masuk/{id} [delete]
func (h *danaHandler) DeleteMasuk(c *gin.Context) {
	id, errParse := strconv.Atoi(strings.TrimSpace(c.Param("id")))
	if errParse != nil || id <= 0 {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "ID dana masuk tidak valid",
		})
		return
	}

	if err := h.danaUsecase.DeleteMasuk(c.Request.Context(), id); err != nil {
		logrus.WithError(err).Error("handler.Dana.DeleteMasuk: failed")
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
		Message: "Dana masuk berhasil dihapus",
	})
}

// DeleteKeluar godoc
// @Summary      Hapus dana keluar
// @Tags         dana
// @Produce      json
// @Security     BearerAuth
// @Param        id     path      integer  true  "ID dana keluar"
// @Success      200    {object}  domain.HttpResponse
// @Failure      400    {object}  domain.HttpResponse
// @Failure      401    {object}  domain.HttpResponse
// @Failure      404    {object}  domain.HttpResponse
// @Router       /dana/apbdes/dana-keluar/{id} [delete]
func (h *danaHandler) DeleteKeluar(c *gin.Context) {
	id, errParse := strconv.Atoi(strings.TrimSpace(c.Param("id")))
	if errParse != nil || id <= 0 {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "ID dana keluar tidak valid",
		})
		return
	}

	if err := h.danaUsecase.DeleteKeluar(c.Request.Context(), id); err != nil {
		logrus.WithError(err).Error("handler.Dana.DeleteKeluar: failed")
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
		Message: "Dana keluar berhasil dihapus",
	})
}
