package handler

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/rasyarhmt/desa-bahontobungku/domain"
	"github.com/rasyarhmt/desa-bahontobungku/dto"
	"github.com/rasyarhmt/desa-bahontobungku/helpers"
	"github.com/rasyarhmt/desa-bahontobungku/utils"
	"github.com/sirupsen/logrus"
)

const maxMediaFileSize = 50 << 20 // 50 MB

var mediaAllowedTypes = map[string][]string{
	domain.MediaTipeFoto:    {"image/jpeg", "image/png"},
	domain.MediaTipeVideo:   {"video/mp4", "video/mkv", "video/webm"},
	domain.MediaTipeDokumen: {"application/pdf"},
}

func validateMediaMimeType(tipe, mimetype string) bool {
	allowed, ok := mediaAllowedTypes[tipe]
	if !ok {
		return false
	}
	for _, a := range allowed {
		if strings.EqualFold(a, mimetype) {
			return true
		}
	}
	return false
}

type mediaHandler struct {
	mediaUsecase domain.MediaUsecase
}

func NewMediaHandler(mediaUsecase domain.MediaUsecase) domain.MediaHandler {
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
// @Success      201  {object}  domain.HttpResponse{data=dto.MediaResponseDTO}
// @Failure      400  {object}  domain.HttpResponse
// @Failure      401  {object}  domain.HttpResponse
// @Router       /media [post]
func (h *mediaHandler) Create(c *gin.Context) {
	req := dto.MediaCreateRequestDTO{
		Nama:      strings.TrimSpace(c.PostForm("nama")),
		Tipe:      strings.ToLower(strings.TrimSpace(c.PostForm("tipe"))),
		Deskripsi: strings.TrimSpace(c.PostForm("deskripsi")),
	}

	if _, ok := mediaAllowedTypes[req.Tipe]; !ok {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "Tipe media tidak valid (foto/video/dokumen)",
		})
		return
	}

	fileHeader, err := c.FormFile("file")
	if err != nil {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "File media wajib diunggah",
		})
		return
	}
	if fileHeader.Size > maxMediaFileSize {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "Ukuran file melebihi batas maksimal 50 MB",
		})
		return
	}
	if !validateMediaMimeType(req.Tipe, fileHeader.Header.Get("Content-Type")) {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "Format file tidak didukung untuk tipe " + req.Tipe,
		})
		return
	}
	content, err := readUploadedFile(fileHeader)
	if err != nil {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusInternalServerError,
			Message: "Gagal membaca file media",
		})
		return
	}
	relPath, err := utils.SaveMediaFile(content, fileHeader.Filename)
	if err != nil {
		logrus.WithError(err).Error("handler.Media.Create: save file failed")
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusInternalServerError,
			Message: "Gagal menyimpan file media",
		})
		return
	}
	req.File = relPath

	var thumbPath string
	if thumbHeader, tErr := c.FormFile("thumbnail"); tErr == nil {
		if thumbHeader.Size > maxMediaFileSize {
			helpers.Response(c, domain.HttpResponse{
				Code:    http.StatusBadRequest,
				Message: "Ukuran thumbnail melebihi batas maksimal 50 MB",
			})
			return
		}
		thumbContent, tReadErr := readUploadedFile(thumbHeader)
		if tReadErr != nil {
			helpers.Response(c, domain.HttpResponse{
				Code:    http.StatusInternalServerError,
				Message: "Gagal membaca thumbnail",
			})
			return
		}
		thumbPath, err = utils.SaveMediaFile(thumbContent, thumbHeader.Filename)
		if err != nil {
			logrus.WithError(err).Error("handler.Media.Create: save thumbnail failed")
			helpers.Response(c, domain.HttpResponse{
				Code:    http.StatusInternalServerError,
				Message: "Gagal menyimpan thumbnail",
			})
			return
		}
		req.Thumbnail = thumbPath
	}

	result, err := h.mediaUsecase.Create(c.Request.Context(), req)
	if err != nil {
		logrus.WithError(err).Error("handler.Media.Create: failed")
		_ = utils.DeleteMediaFile(req.File)
		if thumbPath != "" {
			_ = utils.DeleteMediaFile(thumbPath)
		}
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: err.Error(),
		})
		return
	}

	helpers.Response(c, domain.HttpResponse{
		Code:    http.StatusCreated,
		Message: "Media berhasil ditambahkan",
		Data:    result,
	})
}

// GetAll godoc
// @Summary      Get semua media
// @Tags         media
// @Produce      json
// @Success      200  {object}  domain.HttpResponse{data=[]dto.MediaResponseDTO}
// @Failure      500  {object}  domain.HttpResponse
// @Router       /media [get]
func (h *mediaHandler) GetAll(c *gin.Context) {
	list, err := h.mediaUsecase.GetAll(c.Request.Context())
	if err != nil {
		logrus.WithError(err).Error("handler.Media.GetAll: failed")
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusInternalServerError,
			Message: "Gagal mengambil daftar media",
		})
		return
	}

	helpers.Response(c, domain.HttpResponse{
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
// @Success      200    {object}  domain.HttpResponse{data=dto.MediaResponseDTO}
// @Failure      400    {object}  domain.HttpResponse
// @Failure      404    {object}  domain.HttpResponse
// @Router       /media/{id} [get]
func (h *mediaHandler) GetByID(c *gin.Context) {
	id, errParse := strconv.Atoi(strings.TrimSpace(c.Param("id")))
	if errParse != nil || id <= 0 {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "ID media tidak valid",
		})
		return
	}

	m, err := h.mediaUsecase.GetByID(c.Request.Context(), id)
	if err != nil {
		logrus.WithError(err).Error("handler.Media.GetByID: failed")
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
// @Success      200    {object}  domain.HttpResponse
// @Failure      400    {object}  domain.HttpResponse
// @Failure      401    {object}  domain.HttpResponse
// @Failure      404    {object}  domain.HttpResponse
// @Router       /media/{id} [put]
func (h *mediaHandler) Update(c *gin.Context) {
	id, errParse := strconv.Atoi(strings.TrimSpace(c.Param("id")))
	if errParse != nil || id <= 0 {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "ID media tidak valid",
		})
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

	if fileHeader, fErr := c.FormFile("file"); fErr == nil {
		if fileHeader.Size > maxMediaFileSize {
			helpers.Response(c, domain.HttpResponse{
				Code:    http.StatusBadRequest,
				Message: "Ukuran file melebihi batas maksimal 50 MB",
			})
			return
		}
		content, rErr := readUploadedFile(fileHeader)
		if rErr != nil {
			helpers.Response(c, domain.HttpResponse{
				Code:    http.StatusInternalServerError,
				Message: "Gagal membaca file media",
			})
			return
		}
		relPath, sErr := utils.SaveMediaFile(content, fileHeader.Filename)
		if sErr != nil {
			logrus.WithError(sErr).Error("handler.Media.Update: save file failed")
			helpers.Response(c, domain.HttpResponse{
				Code:    http.StatusInternalServerError,
				Message: "Gagal menyimpan file media",
			})
			return
		}
		req.File = &relPath
	}

	if err := h.mediaUsecase.Update(c.Request.Context(), id, req); err != nil {
		logrus.WithError(err).Error("handler.Media.Update: failed")
		if req.File != nil {
			_ = utils.DeleteMediaFile(*req.File)
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
		Message: "Media berhasil diperbarui",
	})
}

// Delete godoc
// @Summary      Hapus media
// @Tags         media
// @Produce      json
// @Security     BearerAuth
// @Param        id     path      integer  true  "ID media"
// @Success      200    {object}  domain.HttpResponse
// @Failure      400    {object}  domain.HttpResponse
// @Failure      401    {object}  domain.HttpResponse
// @Failure      404    {object}  domain.HttpResponse
// @Router       /media/{id} [delete]
func (h *mediaHandler) Delete(c *gin.Context) {
	id, errParse := strconv.Atoi(strings.TrimSpace(c.Param("id")))
	if errParse != nil || id <= 0 {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "ID media tidak valid",
		})
		return
	}

	if err := h.mediaUsecase.Delete(c.Request.Context(), id); err != nil {
		logrus.WithError(err).Error("handler.Media.Delete: failed")
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
		Message: "Media berhasil dihapus",
	})
}
