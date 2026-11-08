package handler

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/rasyarhmt/desa-bahontobungku/dto"
	"github.com/rasyarhmt/desa-bahontobungku/helpers"
	"github.com/rasyarhmt/desa-bahontobungku/usecase"
	"github.com/sirupsen/logrus"
)

type statusKeluargaHandler struct {
	statusKeluargaUsecase usecase.StatusKeluargaUsecase
}

func NewStatusKeluargaHandler(statusKeluargaUsecase usecase.StatusKeluargaUsecase) StatusKeluargaHandler {
	return &statusKeluargaHandler{statusKeluargaUsecase: statusKeluargaUsecase}
}

func parseStatusKeluargaID(c *gin.Context) (int, bool) {
	return parseIDParam(c, "id tidak valid")
}

// Create godoc
// @Summary      Tambah status dalam keluarga
// @Tags         status-keluarga
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request  body      dto.StatusKeluargaCreateRequestDTO  true  "Data status keluarga"
// @Success      201      {object}  helpers.HttpResponse{data=dto.StatusKeluargaResponseDTO}
// @Failure      400      {object}  helpers.HttpResponse
// @Failure      401      {object}  helpers.HttpResponse
// @Router       /status-keluarga [post]
func (h *statusKeluargaHandler) Create(c *gin.Context) {
	var req dto.StatusKeluargaCreateRequestDTO
	if err := helpers.DecodeJSON(c, &req); err != nil {
		helpers.Response(c, helpers.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "Format data status keluarga tidak valid: " + err.Error(),
		})
		return
	}

	data, err := h.statusKeluargaUsecase.Create(c.Request.Context(), req)
	if err != nil {
		logrus.WithError(err).Error("handler.StatusKeluarga.Create: failed")
		helpers.RespondError(c, err)
		return
	}

	helpers.Response(c, helpers.HttpResponse{
		Code:    http.StatusCreated,
		Message: "Status keluarga berhasil ditambahkan",
		Data:    data,
	})
}

// GetAll godoc
// @Summary      Daftar status dalam keluarga
// @Tags         status-keluarga
// @Produce      json
// @Security     BearerAuth
// @Param        include_inactive  query     bool  false  "Sertakan status nonaktif"
// @Success      200               {object}  helpers.HttpResponse{data=[]dto.StatusKeluargaResponseDTO}
// @Failure      401               {object}  helpers.HttpResponse
// @Failure      500               {object}  helpers.HttpResponse
// @Router       /status-keluarga [get]
func (h *statusKeluargaHandler) GetAll(c *gin.Context) {
	includeInactive := false
	if raw := strings.TrimSpace(c.Query("include_inactive")); raw != "" {
		if parsed, err := strconv.ParseBool(raw); err == nil {
			includeInactive = parsed
		}
	}

	list, err := h.statusKeluargaUsecase.GetAll(c.Request.Context(), includeInactive)
	if err != nil {
		logrus.WithError(err).Error("handler.StatusKeluarga.GetAll: failed")
		helpers.Response(c, helpers.HttpResponse{
			Code:    http.StatusInternalServerError,
			Message: "Gagal mengambil daftar status keluarga",
		})
		return
	}

	helpers.Response(c, helpers.HttpResponse{
		Code:    http.StatusOK,
		Message: "Daftar status keluarga berhasil diambil",
		Data:    list,
	})
}

// GetByID godoc
// @Summary      Detail status dalam keluarga
// @Tags         status-keluarga
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      int  true  "ID status keluarga"
// @Success      200  {object}  helpers.HttpResponse{data=dto.StatusKeluargaResponseDTO}
// @Failure      400  {object}  helpers.HttpResponse
// @Failure      404  {object}  helpers.HttpResponse
// @Router       /status-keluarga/{id} [get]
func (h *statusKeluargaHandler) GetByID(c *gin.Context) {
	id, ok := parseStatusKeluargaID(c)
	if !ok {
		return
	}

	data, err := h.statusKeluargaUsecase.GetByID(c.Request.Context(), id)
	if err != nil {
		logrus.WithError(err).Error("handler.StatusKeluarga.GetByID: failed")
		helpers.RespondError(c, err)
		return
	}

	helpers.Response(c, helpers.HttpResponse{
		Code:    http.StatusOK,
		Message: "Status keluarga berhasil diambil",
		Data:    data,
	})
}

// Update godoc
// @Summary      Update status dalam keluarga
// @Tags         status-keluarga
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id       path      int                              true  "ID status keluarga"
// @Param        request  body      dto.StatusKeluargaUpdateRequestDTO  true  "Data update"
// @Success      200      {object}  helpers.HttpResponse
// @Failure      400      {object}  helpers.HttpResponse
// @Failure      404      {object}  helpers.HttpResponse
// @Router       /status-keluarga/{id} [put]
func (h *statusKeluargaHandler) Update(c *gin.Context) {
	id, ok := parseStatusKeluargaID(c)
	if !ok {
		return
	}

	var req dto.StatusKeluargaUpdateRequestDTO
	if err := helpers.DecodeJSON(c, &req); err != nil {
		helpers.Response(c, helpers.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "Format data update tidak valid: " + err.Error(),
		})
		return
	}

	if err := h.statusKeluargaUsecase.Update(c.Request.Context(), id, req); err != nil {
		logrus.WithError(err).Error("handler.StatusKeluarga.Update: failed")
		helpers.RespondError(c, err)
		return
	}

	helpers.Response(c, helpers.HttpResponse{
		Code:    http.StatusOK,
		Message: "Status keluarga berhasil diperbarui",
	})
}

// Delete godoc
// @Summary      Hapus status dalam keluarga
// @Tags         status-keluarga
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      int  true  "ID status keluarga"
// @Success      200  {object}  helpers.HttpResponse
// @Failure      400  {object}  helpers.HttpResponse
// @Failure      404  {object}  helpers.HttpResponse
// @Router       /status-keluarga/{id} [delete]
func (h *statusKeluargaHandler) Delete(c *gin.Context) {
	id, ok := parseStatusKeluargaID(c)
	if !ok {
		return
	}

	if err := h.statusKeluargaUsecase.Delete(c.Request.Context(), id); err != nil {
		logrus.WithError(err).Error("handler.StatusKeluarga.Delete: failed")
		helpers.RespondError(c, err)
		return
	}

	helpers.Response(c, helpers.HttpResponse{
		Code:    http.StatusOK,
		Message: "Status keluarga berhasil dihapus",
	})
}

// ToggleActive godoc
// @Summary      Aktifkan/nonaktifkan status dalam keluarga
// @Tags         status-keluarga
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      int  true  "ID status keluarga"
// @Success      200  {object}  helpers.HttpResponse
// @Failure      400  {object}  helpers.HttpResponse
// @Failure      404  {object}  helpers.HttpResponse
// @Router       /status-keluarga/{id}/toggle-active [put]
func (h *statusKeluargaHandler) ToggleActive(c *gin.Context) {
	id, ok := parseStatusKeluargaID(c)
	if !ok {
		return
	}

	if err := h.statusKeluargaUsecase.ToggleActive(c.Request.Context(), id); err != nil {
		logrus.WithError(err).Error("handler.StatusKeluarga.ToggleActive: failed")
		helpers.RespondError(c, err)
		return
	}

	helpers.Response(c, helpers.HttpResponse{
		Code:    http.StatusOK,
		Message: "Status keluarga berhasil diperbarui",
	})
}
