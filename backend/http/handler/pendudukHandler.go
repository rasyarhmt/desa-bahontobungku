package handler

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/rasyarhmt/desa-bahontobungku/domain"
	"github.com/rasyarhmt/desa-bahontobungku/dto"
	"github.com/rasyarhmt/desa-bahontobungku/helpers"
	"github.com/sirupsen/logrus"
)

type pendudukHandler struct {
	pendudukUsecase domain.PendudukUsecase
}

func NewPendudukHandler(pendudukUsecase domain.PendudukUsecase) domain.PendudukHandler {
	return &pendudukHandler{pendudukUsecase: pendudukUsecase}
}

// Create godoc
// @Summary      Tambah penduduk baru
// @Tags         penduduk
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request  body      dto.PendudukRequestDTO  true  "Data penduduk"
// @Success      201      {object}  domain.HttpResponse
// @Failure      400      {object}  domain.HttpResponse
// @Failure      401      {object}  domain.HttpResponse
// @Router       /penduduk [post]
func (h *pendudukHandler) Create(c *gin.Context) {
	var req dto.PendudukRequestDTO
	if err := helpers.DecodeJSON(c, &req); err != nil {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "Format data penduduk tidak valid: " + err.Error(),
		})
		return
	}

	if err := h.pendudukUsecase.Create(c.Request.Context(), req); err != nil {
		logrus.WithError(err).Error("handler.Penduduk.Create: failed")
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: err.Error(),
		})
		return
	}

	helpers.Response(c, domain.HttpResponse{
		Code:    http.StatusCreated,
		Message: "Penduduk berhasil ditambahkan",
	})
}

// GetByNIK godoc
// @Summary      Cari penduduk by NIK
// @Tags         penduduk
// @Produce      json
// @Security     BearerAuth
// @Param        nik   path      string  true  "NIK penduduk"
// @Success      200   {object}  domain.HttpResponse{data=dto.PendudukResponseDTO}
// @Failure      400   {object}  domain.HttpResponse
// @Failure      401   {object}  domain.HttpResponse
// @Failure      404   {object}  domain.HttpResponse
// @Router       /penduduk/nik/{nik} [get]
func (h *pendudukHandler) GetByNIK(c *gin.Context) {
	nik := strings.TrimSpace(c.Param("nik"))
	if nik == "" {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "NIK wajib diisi",
		})
		return
	}

	p, err := h.pendudukUsecase.GetByNIK(c.Request.Context(), nik)
	if err != nil {
		logrus.WithError(err).Error("handler.Penduduk.GetByNIK: failed")
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
		Message: "Data penduduk berhasil diambil",
		Data:    p,
	})
}

// GetAll godoc
// @Summary      Get all penduduk
// @Tags         penduduk
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  domain.HttpResponse{data=[]dto.PendudukResponseDTO}
// @Failure      401  {object}  domain.HttpResponse
// @Failure      500  {object}  domain.HttpResponse
// @Router       /penduduk [get]
func (h *pendudukHandler) GetAll(c *gin.Context) {
	list, err := h.pendudukUsecase.GetAll(c.Request.Context())
	if err != nil {
		logrus.WithError(err).Error("handler.Penduduk.GetAll: failed")
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusInternalServerError,
			Message: "Gagal mengambil data penduduk",
		})
		return
	}

	helpers.Response(c, domain.HttpResponse{
		Code:    http.StatusOK,
		Message: "Daftar penduduk berhasil diambil",
		Data:    list,
	})
}

// GetKepalaKeluarga godoc
// @Summary      Get all kepala keluarga
// @Tags         penduduk
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  domain.HttpResponse{data=[]dto.PendudukResponseDTO}
// @Failure      401  {object}  domain.HttpResponse
// @Failure      500  {object}  domain.HttpResponse
// @Router       /penduduk/kepala-keluarga [get]
func (h *pendudukHandler) GetKepalaKeluarga(c *gin.Context) {
	list, err := h.pendudukUsecase.GetKepalaKeluarga(c.Request.Context())
	if err != nil {
		logrus.WithError(err).Error("handler.Penduduk.GetKepalaKeluarga: failed")
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusInternalServerError,
			Message: "Gagal mengambil data kepala keluarga",
		})
		return
	}

	helpers.Response(c, domain.HttpResponse{
		Code:    http.StatusOK,
		Message: "Daftar kepala keluarga berhasil diambil",
		Data:    list,
	})
}

// Update godoc
// @Summary      Update data penduduk
// @Tags         penduduk
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        nik      path      string                    true  "NIK penduduk yang akan di-update"
// @Param        request  body      dto.PendudukUpdateRequestDTO  true  "Data update"
// @Success      200      {object}  domain.HttpResponse
// @Failure      400      {object}  domain.HttpResponse
// @Failure      401      {object}  domain.HttpResponse
// @Failure      404      {object}  domain.HttpResponse
// @Router       /penduduk/update/{nik} [put]
func (h *pendudukHandler) Update(c *gin.Context) {
	var req dto.PendudukUpdateRequestDTO
	if err := helpers.DecodeJSON(c, &req); err != nil {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "Format data update tidak valid: " + err.Error(),
		})
		return
	}

	req.NIK = strings.TrimSpace(c.Param("nik"))

	if err := h.pendudukUsecase.Update(c.Request.Context(), req); err != nil {
		logrus.WithError(err).Error("handler.Penduduk.Update: failed")
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
		Message: "Data penduduk berhasil diperbarui",
	})
}

// Delete godoc
// @Summary      Hapus penduduk
// @Tags         penduduk
// @Produce      json
// @Security     BearerAuth
// @Param        nik   path      string  true  "NIK penduduk"
// @Success      200   {object}  domain.HttpResponse
// @Failure      400   {object}  domain.HttpResponse
// @Failure      401   {object}  domain.HttpResponse
// @Failure      404   {object}  domain.HttpResponse
// @Router       /penduduk/delete/{nik} [delete]
func (h *pendudukHandler) Delete(c *gin.Context) {
	nik := strings.TrimSpace(c.Param("nik"))
	if nik == "" {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "NIK wajib diisi",
		})
		return
	}

	if err := h.pendudukUsecase.Delete(c.Request.Context(), nik); err != nil {
		logrus.WithError(err).Error("handler.Penduduk.Delete: failed")
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
		Message: "Penduduk berhasil dihapus",
	})
}

// GetTotalStats godoc
// @Summary      Total penduduk
// @Tags         stats
// @Produce      json
// @Success      200  {object}  domain.HttpResponse{data=dto.StatCountDTO}
// @Failure      500  {object}  domain.HttpResponse
// @Router       /penduduk/stats/total [get]
func (h *pendudukHandler) GetTotalStats(c *gin.Context) {
	total, err := h.pendudukUsecase.CountTotal(c.Request.Context())
	if err != nil {
		logrus.WithError(err).Error("handler.Penduduk.GetTotalStats: failed")
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusInternalServerError,
			Message: "Gagal menghitung total penduduk",
		})
		return
	}

	helpers.Response(c, domain.HttpResponse{
		Code:    http.StatusOK,
		Message: "Total penduduk berhasil dihitung",
		Data:    dto.StatCountDTO{Total: total},
	})
}

// GetKepalaKeluargaStats godoc
// @Summary      Total kepala keluarga
// @Tags         stats
// @Produce      json
// @Success      200  {object}  domain.HttpResponse{data=dto.StatCountDTO}
// @Failure      500  {object}  domain.HttpResponse
// @Router       /penduduk/stats/kepala-keluarga [get]
func (h *pendudukHandler) GetKepalaKeluargaStats(c *gin.Context) {
	total, err := h.pendudukUsecase.CountKepalaKeluarga(c.Request.Context())
	if err != nil {
		logrus.WithError(err).Error("handler.Penduduk.GetKepalaKeluargaStats: failed")
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusInternalServerError,
			Message: "Gagal menghitung kepala keluarga",
		})
		return
	}

	helpers.Response(c, domain.HttpResponse{
		Code:    http.StatusOK,
		Message: "Total kepala keluarga berhasil dihitung",
		Data:    dto.StatCountDTO{Total: total},
	})
}

// GetLakiLakiStats godoc
// @Summary      Total laki-laki
// @Tags         stats
// @Produce      json
// @Success      200  {object}  domain.HttpResponse{data=dto.StatCountDTO}
// @Failure      500  {object}  domain.HttpResponse
// @Router       /penduduk/stats/laki-laki [get]
func (h *pendudukHandler) GetLakiLakiStats(c *gin.Context) {
	total, err := h.pendudukUsecase.CountLakiLaki(c.Request.Context())
	if err != nil {
		logrus.WithError(err).Error("handler.Penduduk.GetLakiLakiStats: failed")
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusInternalServerError,
			Message: "Gagal menghitung jumlah laki-laki",
		})
		return
	}

	helpers.Response(c, domain.HttpResponse{
		Code:    http.StatusOK,
		Message: "Total penduduk laki-laki berhasil dihitung",
		Data:    dto.StatCountDTO{Total: total},
	})
}

// GetPerempuanStats godoc
// @Summary      Total perempuan
// @Tags         stats
// @Produce      json
// @Success      200  {object}  domain.HttpResponse{data=dto.StatCountDTO}
// @Failure      500  {object}  domain.HttpResponse
// @Router       /penduduk/stats/perempuan [get]
func (h *pendudukHandler) GetPerempuanStats(c *gin.Context) {
	total, err := h.pendudukUsecase.CountPerempuan(c.Request.Context())
	if err != nil {
		logrus.WithError(err).Error("handler.Penduduk.GetPerempuanStats: failed")
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusInternalServerError,
			Message: "Gagal menghitung jumlah perempuan",
		})
		return
	}

	helpers.Response(c, domain.HttpResponse{
		Code:    http.StatusOK,
		Message: "Total penduduk perempuan berhasil dihitung",
		Data:    dto.StatCountDTO{Total: total},
	})
}

// GetReligiStats godoc
// @Summary      Statistik agama
// @Tags         stats
// @Produce      json
// @Success      200  {object}  domain.HttpResponse{data=[]dto.ReligiStatsDTO}
// @Failure      500  {object}  domain.HttpResponse
// @Router       /penduduk/stats/agama [get]
func (h *pendudukHandler) GetReligiStats(c *gin.Context) {
	stats, err := h.pendudukUsecase.GetReligiStats(c.Request.Context())
	if err != nil {
		logrus.WithError(err).Error("handler.Penduduk.GetReligiStats: failed")
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusInternalServerError,
			Message: "Gagal mengambil statistik agama",
		})
		return
	}

	helpers.Response(c, domain.HttpResponse{
		Code:    http.StatusOK,
		Message: "Statistik agama berhasil diambil",
		Data:    stats,
	})
}

// GetUmurStats godoc
// @Summary      Statistik umur
// @Tags         stats
// @Produce      json
// @Success      200  {object}  domain.HttpResponse{data=[]dto.UmurStatsDTO}
// @Failure      500  {object}  domain.HttpResponse
// @Router       /penduduk/stats/umur [get]
func (h *pendudukHandler) GetUmurStats(c *gin.Context) {
	stats, err := h.pendudukUsecase.GetUmurStats(c.Request.Context())
	if err != nil {
		logrus.WithError(err).Error("handler.Penduduk.GetUmurStats: failed")
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusInternalServerError,
			Message: "Gagal mengambil statistik umur",
		})
		return
	}

	helpers.Response(c, domain.HttpResponse{
		Code:    http.StatusOK,
		Message: "Statistik umur berhasil diambil",
		Data:    stats,
	})
}
