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

type mediaHandler struct {
	mediaUsecase usecase.MediaUsecase
}

func NewMediaHandler(mediaUsecase usecase.MediaUsecase) MediaHandler {
	return &mediaHandler{mediaUsecase: mediaUsecase}
}

// Create godoc
// @Summary      Tambah media (foto/video/dokumen)
// @Description  Upload via form-data multipart: file (wajib), thumbnail (wajib untuk video), nama, tipe (foto/video/dokumen), deskripsi. File disimpan polos di uploads/media (galeri publik)
// @Tags         media
// @Accept       mpfd
// @Produce      json
// @Security     BearerAuth
// @Param        file       formData  file    true   "File media"
// @Param        thumbnail  formData  file    false  "Thumbnail (wajib untuk tipe video)"
// @Param        nama       formData  string  true   "Nama media"
// @Param        tipe       formData  string  true   "Tipe (foto/video/dokumen)" example(foto)
// @Param        deskripsi  formData  string  true   "Deskripsi"
// @Success      201  {object}  helpers.HttpResponse{data=dto.MediaResponseDTO}
// @Failure      400  {object}  helpers.HttpResponse
// @Failure      401  {object}  helpers.HttpResponse
// @Router       /media [post]
func (h *mediaHandler) Create(c *gin.Context) {
	req := dto.MediaCreateRequestDTO{
		Nama:      strings.TrimSpace(c.PostForm("nama")),
		Tipe:      strings.ToLower(strings.TrimSpace(c.PostForm("tipe"))),
		Deskripsi: strings.TrimSpace(c.PostForm("deskripsi")),
	}

	fileHeader, _ := c.FormFile("file")
	file, ok := readUploadedFile(c, fileHeader, "Gagal membaca file media")
	if !ok {
		return
	}
	var thumbnail *usecase.UploadedFile
	if file != nil {
		thumbnailHeader, _ := c.FormFile("thumbnail")
		thumbnail, ok = readUploadedFile(c, thumbnailHeader, "Gagal membaca thumbnail")
		if !ok {
			return
		}
	}

	result, err := h.mediaUsecase.Create(c.Request.Context(), req, file, thumbnail)
	if err != nil {
		logrus.WithError(err).Error("handler.Media.Create: failed")
		helpers.RespondError(c, err)
		return
	}

	helpers.Response(c, helpers.HttpResponse{
		Code:    http.StatusCreated,
		Message: "Media berhasil ditambahkan",
		Data:    result,
	})
}

// GetAll godoc
// @Summary      Get semua media
// @Tags         media
// @Produce      json
// @Success      200  {object}  helpers.HttpResponse{data=[]dto.MediaResponseDTO}
// @Failure      500  {object}  helpers.HttpResponse
// @Router       /media [get]
func (h *mediaHandler) GetAll(c *gin.Context) {
	list, err := h.mediaUsecase.GetAll(c.Request.Context())
	if err != nil {
		logrus.WithError(err).Error("handler.Media.GetAll: failed")
		helpers.Response(c, helpers.HttpResponse{
			Code:    http.StatusInternalServerError,
			Message: "Gagal mengambil daftar media",
		})
		return
	}

	helpers.Response(c, helpers.HttpResponse{
		Code:    http.StatusOK,
		Message: "Daftar media berhasil diambil",
		Data:    list,
	})
}

// GetByID godoc
// @Summary      Get media by id
// @Tags         media
// @Produce      json
// @Param        id     path      integer  true  "ID media"
// @Success      200    {object}  helpers.HttpResponse{data=dto.MediaResponseDTO}
// @Failure      400    {object}  helpers.HttpResponse
// @Failure      404    {object}  helpers.HttpResponse
// @Router       /media/{id} [get]
func (h *mediaHandler) GetByID(c *gin.Context) {
	id, ok := parseIDParam(c, "ID media tidak valid")
	if !ok {
		return
	}

	m, err := h.mediaUsecase.GetByID(c.Request.Context(), id)
	if err != nil {
		logrus.WithError(err).Error("handler.Media.GetByID: failed")
		helpers.RespondError(c, err)
		return
	}

	helpers.Response(c, helpers.HttpResponse{
		Code:    http.StatusOK,
		Message: "Media berhasil diambil",
		Data:    m,
	})
}

// Update godoc
// @Summary      Update media
// @Description  Upload multipart; file opsional (jika diupload, file lama diganti). Field nama/tipe/deskripsi jan opsional
// @Tags         media
// @Accept       mpfd
// @Produce      json
// @Security     BearerAuth
// @Param        id         path      integer  true  "ID media"
// @Param        file       formData  file     false "File media baru (opsional)"
// @Param        nama       formData  string   false "Nama media"
// @Param        tipe       formData  string   false "Tipe (foto/video/dokumen)"
// @Param        deskripsi  formData  string   false "Deskripsi"
// @Success      200    {object}  helpers.HttpResponse
// @Failure      400    {object}  helpers.HttpResponse
// @Failure      401    {object}  helpers.HttpResponse
// @Failure      404    {object}  helpers.HttpResponse
// @Router       /media/{id} [put]
func (h *mediaHandler) Update(c *gin.Context) {
	id, ok := parseIDParam(c, "ID media tidak valid")
	if !ok {
		return
	}

	req := dto.MediaUpdateRequestDTO{}
	if v := strings.TrimSpace(c.PostForm("nama")); v != "" {
		req.Nama = &v
	}
	if v := strings.ToLower(strings.TrimSpace(c.PostForm("tipe"))); v != "" {
		req.Tipe = &v
	}
	if v := strings.TrimSpace(c.PostForm("deskripsi")); v != "" {
		req.Deskripsi = &v
	}

	fileHeader, _ := c.FormFile("file")
	file, ok := readUploadedFile(c, fileHeader, "Gagal membaca file media")
	if !ok {
		return
	}

	if err := h.mediaUsecase.Update(c.Request.Context(), id, req, file); err != nil {
		logrus.WithError(err).Error("handler.Media.Update: failed")
		helpers.RespondError(c, err)
		return
	}

	helpers.Response(c, helpers.HttpResponse{
		Code:    http.StatusOK,
		Message: "Media berhasil diperbarui",
	})
}

// Delete godoc
// @Summary      Hapus media
// @Tags         media
// @Produce      json
// @Security     BearerAuth
// @Param        id     path      integer  true  "ID media"
// @Success      200    {object}  helpers.HttpResponse
// @Failure      400    {object}  helpers.HttpResponse
// @Failure      401    {object}  helpers.HttpResponse
// @Failure      404    {object}  helpers.HttpResponse
// @Router       /media/{id} [delete]
func (h *mediaHandler) Delete(c *gin.Context) {
	id, ok := parseIDParam(c, "ID media tidak valid")
	if !ok {
		return
	}

	if err := h.mediaUsecase.Delete(c.Request.Context(), id); err != nil {
		logrus.WithError(err).Error("handler.Media.Delete: failed")
		helpers.RespondError(c, err)
		return
	}

	helpers.Response(c, helpers.HttpResponse{
		Code:    http.StatusOK,
		Message: "Media berhasil dihapus",
	})
}
