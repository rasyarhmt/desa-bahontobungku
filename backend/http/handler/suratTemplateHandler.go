package handler

import (
	"fmt"
	"io"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/rasyarhmt/desa-bahontobungku/domain"
	"github.com/rasyarhmt/desa-bahontobungku/dto"
	"github.com/rasyarhmt/desa-bahontobungku/helpers"
	"github.com/rasyarhmt/desa-bahontobungku/utils"
	"github.com/sirupsen/logrus"
)

const maxTemplateFileSize = 5 << 20 // 5 MB

type suratTemplateHandler struct {
	templateUsecase domain.SuratTemplateUsecase
}

func NewSuratTemplateHandler(templateUsecase domain.SuratTemplateUsecase) domain.SuratTemplateHandler {
	return &suratTemplateHandler{templateUsecase: templateUsecase}
}

// Create godoc
// @Summary      Tambah template surat baru
// @Description  Upload file template HTML (.html) form-data multipart: field file_template, kode, nama_template, deskripsi, status. File dienkripsi menjadi .html.enc
// @Tags         surat-template
// @Accept       mpfd
// @Produce      json
// @Security     BearerAuth
// @Param        file_template        formData  file     true   "File template HTML"
// @Param        kode                 formData  string   true   "Kode unik template"        example(SK_DOMISILI)
// @Param        nama_template        formData  string   true   "Nama template"             example("Surat Keterangan Domisili")
// @Param        deskripsi            formData  string   false  "Deskripsi template"
// @Param        status               formData  string   false  "aktif / nonaktif"          example(aktif)
// @Success      201      {object}  domain.HttpResponse
// @Failure      400      {object}  domain.HttpResponse
// @Failure      401      {object}  domain.HttpResponse
// @Router       /surat-template [post]
func (h *suratTemplateHandler) Create(c *gin.Context) {
	fileHeader, err := c.FormFile("file_template")
	if err != nil {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "File template wajib diupload",
		})
		return
	}
	if fileHeader.Size > maxTemplateFileSize {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "Ukuran file template melebihi batas maksimal 5 MB",
		})
		return
	}

	file, err := fileHeader.Open()
	if err != nil {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusInternalServerError,
			Message: "Gagal membaca file template",
		})
		return
	}
	defer file.Close()

	content, err := io.ReadAll(file)
	if err != nil {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusInternalServerError,
			Message: "Gagal membaca isi file template",
		})
		return
	}

	fileTemplate := buildTemplateFileName(fileHeader.Filename)
	relPath, err := utils.EncryptFileContent(content, fileTemplate)
	if err != nil {
		logrus.WithError(err).Error("handler.SuratTemplate.Create: encrypt file failed")
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusInternalServerError,
			Message: "Gagal menyimpan file template terenkripsi",
		})
		return
	}

	req := dto.SuratTemplateCreateRequestDTO{
		Kode:         strings.TrimSpace(c.PostForm("kode")),
		NamaTemplate: strings.TrimSpace(c.PostForm("nama_template")),
		FileTemplate: relPath,
		Deskripsi:    strings.TrimSpace(c.PostForm("deskripsi")),
		Status:       strings.TrimSpace(c.PostForm("status")),
	}

	if err := h.templateUsecase.Create(c.Request.Context(), req); err != nil {
		logrus.WithError(err).Error("handler.SuratTemplate.Create: failed")
		_ = utils.DeleteEncryptedFile(relPath)
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: err.Error(),
		})
		return
	}

	helpers.Response(c, domain.HttpResponse{
		Code:    http.StatusCreated,
		Message: "Template surat berhasil ditambahkan",
	})
}

// GetAll godoc
// @Summary      Get all template surat
// @Tags         surat-template
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  domain.HttpResponse{data=[]dto.SuratTemplateResponseDTO}
// @Failure      401  {object}  domain.HttpResponse
// @Failure      500  {object}  domain.HttpResponse
// @Router       /surat-template [get]
func (h *suratTemplateHandler) GetAll(c *gin.Context) {
	list, err := h.templateUsecase.GetAll(c.Request.Context())
	if err != nil {
		logrus.WithError(err).Error("handler.SuratTemplate.GetAll: failed")
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusInternalServerError,
			Message: "Gagal mengambil daftar template surat",
		})
		return
	}

	helpers.Response(c, domain.HttpResponse{
		Code:    http.StatusOK,
		Message: "Daftar template surat berhasil diambil",
		Data:    list,
	})
}

// GetByID godoc
// @Summary      Get template surat by id
// @Tags         surat-template
// @Produce      json
// @Security     BearerAuth
// @Param        id     path      integer  true  "ID template"
// @Success      200    {object}  domain.HttpResponse{data=dto.SuratTemplateResponseDTO}
// @Failure      400    {object}  domain.HttpResponse
// @Failure      401    {object}  domain.HttpResponse
// @Failure      404    {object}  domain.HttpResponse
// @Router       /surat-template/{id} [get]
func (h *suratTemplateHandler) GetByID(c *gin.Context) {
	id, errParse := strconv.Atoi(strings.TrimSpace(c.Param("id")))
	if errParse != nil || id <= 0 {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "ID template tidak valid",
		})
		return
	}

	t, err := h.templateUsecase.GetByID(c.Request.Context(), id)
	if err != nil {
		logrus.WithError(err).Error("handler.SuratTemplate.GetByID: failed")
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
		Message: "Template surat berhasil diambil",
		Data:    t,
	})
}

// Update godoc
// @Summary      Update template surat
// @Description  Upload multipart, file_template opsional. Jika tidak diupload, file lama dipertahankan
// @Tags         surat-template
// @Accept       mpfd
// @Produce      json
// @Security     BearerAuth
// @Param        id                 path      integer  true   "ID template"
// @Param        kode               formData  string   true   "Kode unik template"        example(SK_DOMISILI)
// @Param        file_template      formData  file     false  "File template HTML (opsional)"
// @Param        nama_template      formData  string   false  "Nama template"             example("Surat Keterangan Domisili")
// @Param        deskripsi          formData  string   false  "Deskripsi template"
// @Success      200      {object}  domain.HttpResponse
// @Failure      400      {object}  domain.HttpResponse
// @Failure      401      {object}  domain.HttpResponse
// @Failure      404      {object}  domain.HttpResponse
// @Router       /surat-template/{id} [put]
func (h *suratTemplateHandler) Update(c *gin.Context) {
	id, errParse := strconv.Atoi(strings.TrimSpace(c.Param("id")))
	if errParse != nil || id <= 0 {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "ID template tidak valid",
		})
		return
	}

	req := dto.SuratTemplateUpdateRequestDTO{}
	if v := strings.TrimSpace(c.PostForm("nama_template")); v != "" {
		req.NamaTemplate = &v
	}
	if v := strings.TrimSpace(c.PostForm("deskripsi")); v != "" {
		req.Deskripsi = &v
	}

	if fileHeader, ferr := c.FormFile("file_template"); ferr == nil {
		if fileHeader.Size > maxTemplateFileSize {
			helpers.Response(c, domain.HttpResponse{
				Code:    http.StatusBadRequest,
				Message: "Ukuran file template melebihi batas maksimal 5 MB",
			})
			return
		}

		file, errOpen := fileHeader.Open()
		if errOpen != nil {
			helpers.Response(c, domain.HttpResponse{
				Code:    http.StatusInternalServerError,
				Message: "Gagal membaca file template",
			})
			return
		}

		content, errRead := io.ReadAll(file)
		file.Close()
		if errRead != nil {
			helpers.Response(c, domain.HttpResponse{
				Code:    http.StatusInternalServerError,
				Message: "Gagal membaca isi file template",
			})
			return
		}

		fileName := buildTemplateFileName(fileHeader.Filename)
		relPath, errEnc := utils.EncryptFileContent(content, fileName)
		if errEnc != nil {
			logrus.WithError(errEnc).Error("handler.SuratTemplate.Update: encrypt file failed")
			helpers.Response(c, domain.HttpResponse{
				Code:    http.StatusInternalServerError,
				Message: "Gagal menyimpan file template terenkripsi",
			})
			return
		}

		req.FileTemplate = &relPath
	}

	if err := h.templateUsecase.Update(c.Request.Context(), id, req); err != nil {
		logrus.WithError(err).Error("handler.SuratTemplate.Update: failed")
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
		Message: "Template surat berhasil diperbarui",
	})
}

// Delete godoc
// @Summary      Hapus template surat
// @Tags         surat-template
// @Produce      json
// @Security     BearerAuth
// @Param        id     path      integer  true  "ID template"
// @Success      200    {object}  domain.HttpResponse
// @Failure      400    {object}  domain.HttpResponse
// @Failure      401    {object}  domain.HttpResponse
// @Failure      404    {object}  domain.HttpResponse
// @Router       /surat-template/{id} [delete]
func (h *suratTemplateHandler) Delete(c *gin.Context) {
	id, errParse := strconv.Atoi(strings.TrimSpace(c.Param("id")))
	if errParse != nil || id <= 0 {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "ID template tidak valid",
		})
		return
	}

	if err := h.templateUsecase.Delete(c.Request.Context(), id); err != nil {
		logrus.WithError(err).Error("handler.SuratTemplate.Delete: failed")
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
		Message: "Template surat berhasil dihapus",
	})
}

// ToggleStatus godoc
// @Summary      Toggle status template (aktif/nonaktif)
// @Tags         surat-template
// @Produce      json
// @Security     BearerAuth
// @Param        id     path      integer  true  "ID template"
// @Success      200    {object}  domain.HttpResponse
// @Failure      400    {object}  domain.HttpResponse
// @Failure      401    {object}  domain.HttpResponse
// @Failure      404    {object}  domain.HttpResponse
// @Router       /surat-template/{id}/toggle-status [put]
func (h *suratTemplateHandler) ToggleStatus(c *gin.Context) {
	id, errParse := strconv.Atoi(strings.TrimSpace(c.Param("id")))
	if errParse != nil || id <= 0 {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "ID template tidak valid",
		})
		return
	}

	if err := h.templateUsecase.ToggleStatus(c.Request.Context(), id); err != nil {
		logrus.WithError(err).Error("handler.SuratTemplate.ToggleStatus: failed")
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
		Message: "Status template surat berhasil diubah",
	})
}

// buildTemplateFileName menghasilkan nama unik dengan mempertahankan nama asli
// file yang diupload, diprefix timestamp Unix: <unix>_<originalName>.<html.enc>
func buildTemplateFileName(originalFilename string) string {
	base := filepath.Base(originalFilename)
	noExt := strings.TrimSuffix(base, filepath.Ext(base))
	noExt = strings.ReplaceAll(noExt, " ", "_")
	noExt = strings.ReplaceAll(noExt, "-", "_")
	timestamp := strconv.FormatInt(time.Now().Unix(), 10)
	return fmt.Sprintf("%s_%s", timestamp, noExt)
}
