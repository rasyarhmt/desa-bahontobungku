package handler

import (
	"net/http"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/rasyarhmt/desa-bahontobungku/domain"
	"github.com/rasyarhmt/desa-bahontobungku/dto"
	"github.com/rasyarhmt/desa-bahontobungku/helpers"
	"github.com/rasyarhmt/desa-bahontobungku/utils"
	"github.com/sirupsen/logrus"
)

const maxAparaturFotoSize = 5 << 20 // 5 MB

var aparaturImageExt = map[string]bool{
	".jpg":  true,
	".jpeg": true,
	".png":  true,
	".webp": true,
}

func validateAparaturImage(filename string) bool {
	return aparaturImageExt[strings.ToLower(filepath.Ext(filename))]
}

type aparaturHandler struct {
	aparaturUsecase domain.AparaturUsecase
}

func NewAparaturHandler(aparaturUsecase domain.AparaturUsecase) domain.AparaturHandler {
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
// @Success      201  {object}  domain.HttpResponse{data=dto.AparaturResponseDTO}
// @Failure      400  {object}  domain.HttpResponse
// @Failure      401  {object}  domain.HttpResponse
// @Router       /aparatur [post]
func (h *aparaturHandler) Create(c *gin.Context) {
	var fotoPath string
	if fileHeader, err := c.FormFile("foto"); err == nil {
		if fileHeader.Size > maxAparaturFotoSize {
			helpers.Response(c, domain.HttpResponse{
				Code:    http.StatusBadRequest,
				Message: "Ukuran foto melebihi batas maksimal 5 MB",
			})
			return
		}
		if !validateAparaturImage(fileHeader.Filename) {
			helpers.Response(c, domain.HttpResponse{
				Code:    http.StatusBadRequest,
				Message: "Format foto tidak didukung (jpg/jpeg/png/webp)",
			})
			return
		}
		content, errRead := readUploadedFile(fileHeader)
		if errRead != nil {
			helpers.Response(c, domain.HttpResponse{
				Code:    http.StatusInternalServerError,
				Message: "Gagal membaca foto aparatur",
			})
			return
		}
		relPath, errSave := utils.SaveAparaturPhoto(content, fileHeader.Filename)
		if errSave != nil {
			logrus.WithError(errSave).Error("handler.Aparatur.Create: save foto failed")
			helpers.Response(c, domain.HttpResponse{
				Code:    http.StatusInternalServerError,
				Message: "Gagal menyimpan foto aparatur",
			})
			return
		}
		fotoPath = relPath
	}

	req := dto.AparaturCreateRequestDTO{
		Nama:    strings.TrimSpace(c.PostForm("nama")),
		Nip:     strings.TrimSpace(c.PostForm("nip")),
		Jabatan: strings.TrimSpace(c.PostForm("jabatan")),
		Telepon: strings.TrimSpace(c.PostForm("telepon")),
		Foto:    fotoPath,
	}

	result, err := h.aparaturUsecase.Create(c.Request.Context(), req)
	if err != nil {
		logrus.WithError(err).Error("handler.Aparatur.Create: failed")
		if fotoPath != "" {
			_ = utils.DeleteAparaturPhoto(fotoPath)
		}
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: err.Error(),
		})
		return
	}

	helpers.Response(c, domain.HttpResponse{
		Code:    http.StatusCreated,
		Message: "Aparatur berhasil ditambahkan",
		Data:    result,
	})
}

// GetAll godoc
// @Summary      Get semua aparatur (urut struktur jabatan)
// @Tags         aparatur
// @Produce      json
// @Success      200  {object}  domain.HttpResponse{data=[]dto.AparaturResponseDTO}
// @Failure      500  {object}  domain.HttpResponse
// @Router       /aparatur [get]
func (h *aparaturHandler) GetAll(c *gin.Context) {
	list, err := h.aparaturUsecase.GetAll(c.Request.Context())
	if err != nil {
		logrus.WithError(err).Error("handler.Aparatur.GetAll: failed")
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusInternalServerError,
			Message: "Gagal mengambil daftar aparatur",
		})
		return
	}

	helpers.Response(c, domain.HttpResponse{
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
// @Success      200    {object}  domain.HttpResponse{data=dto.AparaturResponseDTO}
// @Failure      400    {object}  domain.HttpResponse
// @Failure      401    {object}  domain.HttpResponse
// @Failure      404    {object}  domain.HttpResponse
// @Router       /aparatur/{id} [get]
func (h *aparaturHandler) GetByID(c *gin.Context) {
	id, errParse := strconv.Atoi(strings.TrimSpace(c.Param("id")))
	if errParse != nil || id <= 0 {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "ID aparatur tidak valid",
		})
		return
	}

	a, err := h.aparaturUsecase.GetByID(c.Request.Context(), id)
	if err != nil {
		logrus.WithError(err).Error("handler.Aparatur.GetByID: failed")
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
// @Success      200     {object}  domain.HttpResponse{data=dto.AparaturResponseDTO}
// @Failure      400     {object}  domain.HttpResponse
// @Failure      401     {object}  domain.HttpResponse
// @Failure      404     {object}  domain.HttpResponse
// @Router       /aparatur/nip/{nip} [get]
func (h *aparaturHandler) GetByNIP(c *gin.Context) {
	nip := strings.TrimSpace(c.Param("nip"))
	if nip == "" {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "NIP tidak valid",
		})
		return
	}

	a, err := h.aparaturUsecase.GetByNIP(c.Request.Context(), nip)
	if err != nil {
		logrus.WithError(err).Error("handler.Aparatur.GetByNIP: failed")
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
// @Success      200    {object}  domain.HttpResponse
// @Failure      400    {object}  domain.HttpResponse
// @Failure      401    {object}  domain.HttpResponse
// @Failure      404    {object}  domain.HttpResponse
// @Router       /aparatur/{id} [put]
func (h *aparaturHandler) Update(c *gin.Context) {
	id, errParse := strconv.Atoi(strings.TrimSpace(c.Param("id")))
	if errParse != nil || id <= 0 {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "ID aparatur tidak valid",
		})
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

	if fileHeader, fErr := c.FormFile("foto"); fErr == nil {
		if fileHeader.Size > maxAparaturFotoSize {
			helpers.Response(c, domain.HttpResponse{
				Code:    http.StatusBadRequest,
				Message: "Ukuran foto melebihi batas maksimal 5 MB",
			})
			return
		}
		if !validateAparaturImage(fileHeader.Filename) {
			helpers.Response(c, domain.HttpResponse{
				Code:    http.StatusBadRequest,
				Message: "Format foto tidak didukung (jpg/jpeg/png/webp)",
			})
			return
		}
		content, errRead := readUploadedFile(fileHeader)
		if errRead != nil {
			helpers.Response(c, domain.HttpResponse{
				Code:    http.StatusInternalServerError,
				Message: "Gagal membaca foto aparatur",
			})
			return
		}
		relPath, errSave := utils.SaveAparaturPhoto(content, fileHeader.Filename)
		if errSave != nil {
			logrus.WithError(errSave).Error("handler.Aparatur.Update: save foto failed")
			helpers.Response(c, domain.HttpResponse{
				Code:    http.StatusInternalServerError,
				Message: "Gagal menyimpan foto aparatur",
			})
			return
		}
		req.Foto = &relPath
	}

	if err := h.aparaturUsecase.Update(c.Request.Context(), id, req); err != nil {
		logrus.WithError(err).Error("handler.Aparatur.Update: failed")
		if req.Foto != nil {
			_ = utils.DeleteAparaturPhoto(*req.Foto)
		}
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
		Message: "Aparatur berhasil diperbarui",
	})
}

// Delete godoc
// @Summary      Hapus aparatur
// @Tags         aparatur
// @Produce      json
// @Security     BearerAuth
// @Param        id     path      integer  true  "ID aparatur"
// @Success      200    {object}  domain.HttpResponse
// @Failure      400    {object}  domain.HttpResponse
// @Failure      401    {object}  domain.HttpResponse
// @Failure      404    {object}  domain.HttpResponse
// @Router       /aparatur/{id} [delete]
func (h *aparaturHandler) Delete(c *gin.Context) {
	id, errParse := strconv.Atoi(strings.TrimSpace(c.Param("id")))
	if errParse != nil || id <= 0 {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "ID aparatur tidak valid",
		})
		return
	}

	if err := h.aparaturUsecase.Delete(c.Request.Context(), id); err != nil {
		logrus.WithError(err).Error("handler.Aparatur.Delete: failed")
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
		Message: "Aparatur berhasil dihapus",
	})
}
