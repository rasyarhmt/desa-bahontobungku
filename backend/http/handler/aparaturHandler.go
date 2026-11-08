package handler

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/rasyarhmt/desa-bahontobungku/dto"
	"github.com/rasyarhmt/desa-bahontobungku/helpers"
	"github.com/rasyarhmt/desa-bahontobungku/usecase"
	"github.com/sirupsen/logrus"
)

type aparaturHandler struct {
	aparaturUsecase usecase.AparaturUsecase
}

func NewAparaturHandler(aparaturUsecase usecase.AparaturUsecase) AparaturHandler {
	return &aparaturHandler{aparaturUsecase: aparaturUsecase}
}

// Create godoc
// @Summary      Tambah aparatur desa
// @Description  Upload foto via form-data multipart (opsional): field foto, nama, nip, jabatan, telepon. Foto disimpan polos di uploads/aparatur
// @Tags         aparatur
// @Accept       mpfd
// @Produce      json
// @Security     BearerAuth
// @Param        foto      formData  file    false  "Foto aparatur (jpg/png/webp, maks 5MB)"
// @Param        nama      formData  string  true   "Nama aparatur"
// @Param        nip       formData  string  false  "NIP"
// @Param        jabatan   formData  string  true   "Jabatan"
// @Param        telepon   formData  string  false  "Nomor telepon"
// @Success      201  {object}  helpers.HttpResponse{data=dto.AparaturResponseDTO}
// @Failure      400  {object}  helpers.HttpResponse
// @Failure      401  {object}  helpers.HttpResponse
// @Router       /aparatur [post]
func (h *aparaturHandler) Create(c *gin.Context) {
	fotoHeader, _ := c.FormFile("foto")
	foto, ok := readUploadedFile(c, fotoHeader, "Gagal membaca foto aparatur")
	if !ok {
		return
	}

	req := dto.AparaturCreateRequestDTO{
		Nama:    strings.TrimSpace(c.PostForm("nama")),
		Nip:     strings.TrimSpace(c.PostForm("nip")),
		Jabatan: strings.TrimSpace(c.PostForm("jabatan")),
		Telepon: strings.TrimSpace(c.PostForm("telepon")),
	}

	result, err := h.aparaturUsecase.Create(c.Request.Context(), req, foto)
	if err != nil {
		logrus.WithError(err).Error("handler.Aparatur.Create: failed")
		helpers.RespondError(c, err)
		return
	}

	helpers.Response(c, helpers.HttpResponse{
		Code:    http.StatusCreated,
		Message: "Aparatur berhasil ditambahkan",
		Data:    result,
	})
}

// GetAll godoc
// @Summary      Get semua aparatur (urut struktur jabatan)
// @Tags         aparatur
// @Produce      json
// @Success      200  {object}  helpers.HttpResponse{data=[]dto.AparaturResponseDTO}
// @Failure      500  {object}  helpers.HttpResponse
// @Router       /aparatur [get]
func (h *aparaturHandler) GetAll(c *gin.Context) {
	list, err := h.aparaturUsecase.GetAll(c.Request.Context())
	if err != nil {
		logrus.WithError(err).Error("handler.Aparatur.GetAll: failed")
		helpers.Response(c, helpers.HttpResponse{
			Code:    http.StatusInternalServerError,
			Message: "Gagal mengambil daftar aparatur",
		})
		return
	}

	helpers.Response(c, helpers.HttpResponse{
		Code:    http.StatusOK,
		Message: "Daftar aparatur berhasil diambil",
		Data:    list,
	})
}

// GetByID godoc
// @Summary      Get aparatur by id
// @Tags         aparatur
// @Produce      json
// @Security     BearerAuth
// @Param        id     path      integer  true  "ID aparatur"
// @Success      200    {object}  helpers.HttpResponse{data=dto.AparaturResponseDTO}
// @Failure      400    {object}  helpers.HttpResponse
// @Failure      401    {object}  helpers.HttpResponse
// @Failure      404    {object}  helpers.HttpResponse
// @Router       /aparatur/{id} [get]
func (h *aparaturHandler) GetByID(c *gin.Context) {
	id, ok := parseIDParam(c, "ID aparatur tidak valid")
	if !ok {
		return
	}

	a, err := h.aparaturUsecase.GetByID(c.Request.Context(), id)
	if err != nil {
		logrus.WithError(err).Error("handler.Aparatur.GetByID: failed")
		helpers.RespondError(c, err)
		return
	}

	helpers.Response(c, helpers.HttpResponse{
		Code:    http.StatusOK,
		Message: "Aparatur berhasil diambil",
		Data:    a,
	})
}

// GetByNIP godoc
// @Summary      Get aparatur by NIP
// @Tags         aparatur
// @Produce      json
// @Security     BearerAuth
// @Param        nip     path      string  true  "NIP aparatur"
// @Success      200     {object}  helpers.HttpResponse{data=dto.AparaturResponseDTO}
// @Failure      400     {object}  helpers.HttpResponse
// @Failure      401     {object}  helpers.HttpResponse
// @Failure      404     {object}  helpers.HttpResponse
// @Router       /aparatur/nip/{nip} [get]
func (h *aparaturHandler) GetByNIP(c *gin.Context) {
	nip := strings.TrimSpace(c.Param("nip"))
	if nip == "" {
		helpers.Response(c, helpers.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "NIP tidak valid",
		})
		return
	}

	a, err := h.aparaturUsecase.GetByNIP(c.Request.Context(), nip)
	if err != nil {
		logrus.WithError(err).Error("handler.Aparatur.GetByNIP: failed")
		helpers.RespondError(c, err)
		return
	}

	helpers.Response(c, helpers.HttpResponse{
		Code:    http.StatusOK,
		Message: "Aparatur berhasil diambil",
		Data:    a,
	})
}

// Update godoc
// @Summary      Update aparatur
// @Description  Upload multipart; foto opsional (jika diupload, foto lama diganti)
// @Tags         aparatur
// @Accept       mpfd
// @Produce      json
// @Security     BearerAuth
// @Param        id        path      integer  true   "ID aparatur"
// @Param        foto      formData  file     false  "Foto aparatur (opsional)"
// @Param        nama      formData  string   false  "Nama aparatur"
// @Param        nip       formData  string   false  "NIP"
// @Param        jabatan   formData  string   false  "Jabatan"
// @Param        telepon   formData  string   false  "Nomor telepon"
// @Success      200    {object}  helpers.HttpResponse
// @Failure      400    {object}  helpers.HttpResponse
// @Failure      401    {object}  helpers.HttpResponse
// @Failure      404    {object}  helpers.HttpResponse
// @Router       /aparatur/{id} [put]
func (h *aparaturHandler) Update(c *gin.Context) {
	id, ok := parseIDParam(c, "ID aparatur tidak valid")
	if !ok {
		return
	}

	fotoHeader, _ := c.FormFile("foto")
	foto, ok := readUploadedFile(c, fotoHeader, "Gagal membaca foto aparatur")
	if !ok {
		return
	}

	req := dto.AparaturUpdateRequestDTO{}
	if v := strings.TrimSpace(c.PostForm("nama")); v != "" {
		req.Nama = &v
	}
	if v := strings.TrimSpace(c.PostForm("nip")); v != "" {
		req.Nip = &v
	}
	if v := strings.TrimSpace(c.PostForm("jabatan")); v != "" {
		req.Jabatan = &v
	}
	if v := strings.TrimSpace(c.PostForm("telepon")); v != "" {
		req.Telepon = &v
	}

	if err := h.aparaturUsecase.Update(c.Request.Context(), id, req, foto); err != nil {
		logrus.WithError(err).Error("handler.Aparatur.Update: failed")
		helpers.RespondError(c, err)
		return
	}

	helpers.Response(c, helpers.HttpResponse{
		Code:    http.StatusOK,
		Message: "Aparatur berhasil diperbarui",
	})
}

// Delete godoc
// @Summary      Hapus aparatur
// @Tags         aparatur
// @Produce      json
// @Security     BearerAuth
// @Param        id     path      integer  true  "ID aparatur"
// @Success      200    {object}  helpers.HttpResponse
// @Failure      400    {object}  helpers.HttpResponse
// @Failure      401    {object}  helpers.HttpResponse
// @Failure      404    {object}  helpers.HttpResponse
// @Router       /aparatur/{id} [delete]
func (h *aparaturHandler) Delete(c *gin.Context) {
	id, ok := parseIDParam(c, "ID aparatur tidak valid")
	if !ok {
		return
	}

	if err := h.aparaturUsecase.Delete(c.Request.Context(), id); err != nil {
		logrus.WithError(err).Error("handler.Aparatur.Delete: failed")
		helpers.RespondError(c, err)
		return
	}

	helpers.Response(c, helpers.HttpResponse{
		Code:    http.StatusOK,
		Message: "Aparatur berhasil dihapus",
	})
}
