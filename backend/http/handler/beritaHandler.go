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

const maxBeritaFotoSize = 5 << 20 // 5 MB

var beritaImageExt = map[string]bool{
	".jpg":  true,
	".jpeg": true,
	".png":  true,
	".webp": true,
	".gif":  true,
}

func validateBeritaImage(filename string) bool {
	return beritaImageExt[strings.ToLower(filepath.Ext(filename))]
}

type beritaHandler struct {
	beritaUsecase domain.BeritaUsecase
}

func NewBeritaHandler(beritaUsecase domain.BeritaUsecase) domain.BeritaHandler {
	return &beritaHandler{beritaUsecase: beritaUsecase}
}

// Create godoc
// @Summary      Tambah berita baru
// @Description  Upload foto via form-data multipart (opsional): field foto, judul, isi, tanggalTerbit, penulis, status. Foto disimpan polos di uploads/berita (konten publik)
// @Tags         berita
// @Accept       mpfd
// @Produce      json
// @Security     BearerAuth
// @Param        foto            formData  file    false  "Foto berita (jpg/png/webp/gif, maks 5MB)"
// @Param        judul           formData  string  true   "Judul berita"
// @Param        isi             formData  string  true   "Isi berita"
// @Param        tanggalTerbit   formData  string  true   "Tanggal terbit"       example(2026-09-05)
// @Param        penulis         formData  string  true   "Penulis"
// @Param        status          formData  string  false  "status (draft/dipublikasi)" example(dipublikasi)
// @Success      201     {object}  domain.HttpResponse{data=dto.BeritaResponseDTO}
// @Failure      400     {object}  domain.HttpResponse
// @Failure      401     {object}  domain.HttpResponse
// @Router       /berita [post]
func (h *beritaHandler) Create(c *gin.Context) {
	var fotoPath string
	if fileHeader, err := c.FormFile("foto"); err == nil {
		if fileHeader.Size > maxBeritaFotoSize {
			helpers.Response(c, domain.HttpResponse{
				Code:    http.StatusBadRequest,
				Message: "Ukuran foto melebihi batas maksimal 5 MB",
			})
			return
		}
		if !validateBeritaImage(fileHeader.Filename) {
			helpers.Response(c, domain.HttpResponse{
				Code:    http.StatusBadRequest,
				Message: "Format foto tidak didukung (jpg/jpeg/png/webp/gif)",
			})
			return
		}
		content, err := readUploadedFile(fileHeader)
		if err != nil {
			helpers.Response(c, domain.HttpResponse{
				Code:    http.StatusInternalServerError,
				Message: "Gagal membaca foto berita",
			})
			return
		}
		relPath, err := utils.SaveBeritaImage(content, fileHeader.Filename)
		if err != nil {
			logrus.WithError(err).Error("handler.Berita.Create: save foto failed")
			helpers.Response(c, domain.HttpResponse{
				Code:    http.StatusInternalServerError,
				Message: "Gagal menyimpan foto berita",
			})
			return
		}
		fotoPath = relPath
	}

	req := dto.BeritaCreateRequestDTO{
		Judul:         strings.TrimSpace(c.PostForm("judul")),
		Isi:           c.PostForm("isi"),
		TanggalTerbit: strings.TrimSpace(c.PostForm("tanggalTerbit")),
		Penulis:       strings.TrimSpace(c.PostForm("penulis")),
		Foto:          fotoPath,
		Status:        strings.TrimSpace(c.PostForm("status")),
	}

	result, err := h.beritaUsecase.Create(c.Request.Context(), req)
	if err != nil {
		logrus.WithError(err).Error("handler.Berita.Create: failed")
		if fotoPath != "" {
			_ = utils.DeleteBeritaImage(fotoPath)
		}
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: err.Error(),
		})
		return
	}

	helpers.Response(c, domain.HttpResponse{
		Code:    http.StatusCreated,
		Message: "Berita berhasil ditambahkan",
		Data:    result,
	})
}

// GetAll godoc
// @Summary      Get berita terpublikasi
// @Description  Hanya berita dengan status dipublikasi yang dikembalikan (publik)
// @Tags         berita
// @Produce      json
// @Success      200  {object}  domain.HttpResponse{data=[]dto.BeritaResponseDTO}
// @Failure      500  {object}  domain.HttpResponse
// @Router       /berita [get]
func (h *beritaHandler) GetAll(c *gin.Context) {
	list, err := h.beritaUsecase.GetAll(c.Request.Context())
	if err != nil {
		logrus.WithError(err).Error("handler.Berita.GetAll: failed")
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusInternalServerError,
			Message: "Gagal mengambil daftar berita",
		})
		return
	}

	helpers.Response(c, domain.HttpResponse{
		Code:    http.StatusOK,
		Message: "Daftar berita berhasil diambil",
		Data:    list,
	})
}

// GetByStatus godoc
// @Summary      Get berita by status
// @Description  Status publik hanya dipublikasi; status lain mengembalikan daftar kosong
// @Tags         berita
// @Produce      json
// @Param        status  path  string  true  "Status berita (dipublikasi)"
// @Success      200  {object}  domain.HttpResponse{data=[]dto.BeritaResponseDTO}
// @Failure      500  {object}  domain.HttpResponse
// @Router       /berita/status/{status} [get]
func (h *beritaHandler) GetByStatus(c *gin.Context) {
	status := strings.TrimSpace(c.Param("status"))
	list, err := h.beritaUsecase.GetByStatus(c.Request.Context(), status)
	if err != nil {
		logrus.WithError(err).Error("handler.Berita.GetByStatus: failed")
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusInternalServerError,
			Message: "Gagal mengambil daftar berita",
		})
		return
	}

	helpers.Response(c, domain.HttpResponse{
		Code:    http.StatusOK,
		Message: "Daftar berita berhasil diambil",
		Data:    list,
	})
}

// GetByID godoc
// @Summary      Get berita by id (hanya terpublikasi)
// @Tags         berita
// @Produce      json
// @Param        id     path      integer  true  "ID berita"
// @Success      200    {object}  domain.HttpResponse{data=dto.BeritaResponseDTO}
// @Failure      400    {object}  domain.HttpResponse
// @Failure      404    {object}  domain.HttpResponse
// @Router       /berita/{id} [get]
func (h *beritaHandler) GetByID(c *gin.Context) {
	id, errParse := strconv.Atoi(strings.TrimSpace(c.Param("id")))
	if errParse != nil || id <= 0 {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "ID berita tidak valid",
		})
		return
	}

	b, err := h.beritaUsecase.GetByID(c.Request.Context(), id)
	if err != nil {
		logrus.WithError(err).Error("handler.Berita.GetByID: failed")
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
		Message: "Berita berhasil diambil",
		Data:    b,
	})
}

// GetAllAdmin godoc
// @Summary      Get semua berita (termasuk draft)
// @Tags         berita
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  domain.HttpResponse{data=[]dto.BeritaResponseDTO}
// @Failure      401  {object}  domain.HttpResponse
// @Failure      500  {object}  domain.HttpResponse
// @Router       /berita/admin [get]
func (h *beritaHandler) GetAllAdmin(c *gin.Context) {
	list, err := h.beritaUsecase.GetAllAdmin(c.Request.Context())
	if err != nil {
		logrus.WithError(err).Error("handler.Berita.GetAllAdmin: failed")
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusInternalServerError,
			Message: "Gagal mengambil daftar berita",
		})
		return
	}

	helpers.Response(c, domain.HttpResponse{
		Code:    http.StatusOK,
		Message: "Daftar berita berhasil diambil",
		Data:    list,
	})
}

// GetByIDAdmin godoc
// @Summary      Get berita by id (termasuk draft)
// @Tags         berita
// @Produce      json
// @Security     BearerAuth
// @Param        id     path      integer  true  "ID berita"
// @Success      200    {object}  domain.HttpResponse{data=dto.BeritaResponseDTO}
// @Failure      400    {object}  domain.HttpResponse
// @Failure      401    {object}  domain.HttpResponse
// @Failure      404    {object}  domain.HttpResponse
// @Router       /berita/admin/{id} [get]
func (h *beritaHandler) GetByIDAdmin(c *gin.Context) {
	id, errParse := strconv.Atoi(strings.TrimSpace(c.Param("id")))
	if errParse != nil || id <= 0 {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "ID berita tidak valid",
		})
		return
	}

	b, err := h.beritaUsecase.GetByIDAdmin(c.Request.Context(), id)
	if err != nil {
		logrus.WithError(err).Error("handler.Berita.GetByIDAdmin: failed")
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
		Message: "Berita berhasil diambil",
		Data:    b,
	})
}

// Update godoc
// @Summary      Update berita
// @Description  Upload multipart, foto opsional. Jika deleteFoto=true, foto lama dihapus. Jika diupload foto baru, foto lama diganti
// @Tags         berita
// @Accept       mpfd
// @Produce      json
// @Security     BearerAuth
// @Param        id            path      integer  true   "ID berita"
// @Param        foto          formData  file     false  "Foto berita (opsional)"
// @Param        judul         formData  string   false  "Judul berita"
// @Param        isi           formData  string   false  "Isi berita"
// @Param        tanggalTerbit formData  string   false  "Tanggal terbit"       example(2026-09-05)
// @Param        penulis       formData  string   false  "Penulis"
// @Param        status        formData  string   false  "status (draft/dipublikasi)"
// @Param        deleteFoto    formData  boolean  false  "Hapus foto yang ada"  example(false)
// @Success      200    {object}  domain.HttpResponse
// @Failure      400    {object}  domain.HttpResponse
// @Failure      401    {object}  domain.HttpResponse
// @Failure      404    {object}  domain.HttpResponse
// @Router       /berita/{id} [put]
func (h *beritaHandler) Update(c *gin.Context) {
	id, errParse := strconv.Atoi(strings.TrimSpace(c.Param("id")))
	if errParse != nil || id <= 0 {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "ID berita tidak valid",
		})
		return
	}

	req := dto.BeritaUpdateRequestDTO{}
	if v := strings.TrimSpace(c.PostForm("judul")); v != "" {
		req.Judul = &v
	}
	if v := c.PostForm("isi"); strings.TrimSpace(v) != "" {
		req.Isi = &v
	}
	if v := strings.TrimSpace(c.PostForm("tanggalTerbit")); v != "" {
		req.TanggalTerbit = &v
	}
	if v := strings.TrimSpace(c.PostForm("penulis")); v != "" {
		req.Penulis = &v
	}
	if v := strings.TrimSpace(c.PostForm("status")); v != "" {
		req.Status = &v
	}
	req.DeleteFoto = strings.TrimSpace(c.PostForm("deleteFoto")) == "true"

	if fileHeader, ferr := c.FormFile("foto"); ferr == nil {
		if fileHeader.Size > maxBeritaFotoSize {
			helpers.Response(c, domain.HttpResponse{
				Code:    http.StatusBadRequest,
				Message: "Ukuran foto melebihi batas maksimal 5 MB",
			})
			return
		}
		if !validateBeritaImage(fileHeader.Filename) {
			helpers.Response(c, domain.HttpResponse{
				Code:    http.StatusBadRequest,
				Message: "Format foto tidak didukung (jpg/jpeg/png/webp/gif)",
			})
			return
		}
		content, errRead := readUploadedFile(fileHeader)
		if errRead != nil {
			helpers.Response(c, domain.HttpResponse{
				Code:    http.StatusInternalServerError,
				Message: "Gagal membaca foto berita",
			})
			return
		}
		relPath, errEnc := utils.SaveBeritaImage(content, fileHeader.Filename)
		if errEnc != nil {
			logrus.WithError(errEnc).Error("handler.Berita.Update: save foto failed")
			helpers.Response(c, domain.HttpResponse{
				Code:    http.StatusInternalServerError,
				Message: "Gagal menyimpan foto berita",
			})
			return
		}
		req.Foto = &relPath
	}

	if err := h.beritaUsecase.Update(c.Request.Context(), id, req); err != nil {
		logrus.WithError(err).Error("handler.Berita.Update: failed")
		if req.Foto != nil {
			_ = utils.DeleteBeritaImage(*req.Foto)
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
		Message: "Berita berhasil diperbarui",
	})
}

// ToggleStatus godoc
// @Summary      Toggle status berita (draft <-> dipublikasi)
// @Tags         berita
// @Produce      json
// @Security     BearerAuth
// @Param        id     path      integer  true  "ID berita"
// @Success      200    {object}  domain.HttpResponse{data=dto.BeritaResponseDTO}
// @Failure      400    {object}  domain.HttpResponse
// @Failure      401    {object}  domain.HttpResponse
// @Failure      404    {object}  domain.HttpResponse
// @Router       /berita/{id}/toggle-status [put]
func (h *beritaHandler) ToggleStatus(c *gin.Context) {
	id, errParse := strconv.Atoi(strings.TrimSpace(c.Param("id")))
	if errParse != nil || id <= 0 {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "ID berita tidak valid",
		})
		return
	}

	b, err := h.beritaUsecase.ToggleStatus(c.Request.Context(), id)
	if err != nil {
		logrus.WithError(err).Error("handler.Berita.ToggleStatus: failed")
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
		Message: "Status berita berhasil diubah",
		Data:    b,
	})
}

// Delete godoc
// @Summary      Hapus berita
// @Tags         berita
// @Produce      json
// @Security     BearerAuth
// @Param        id     path      integer  true  "ID berita"
// @Success      200    {object}  domain.HttpResponse
// @Failure      400    {object}  domain.HttpResponse
// @Failure      401    {object}  domain.HttpResponse
// @Failure      404    {object}  domain.HttpResponse
// @Router       /berita/{id} [delete]
func (h *beritaHandler) Delete(c *gin.Context) {
	id, errParse := strconv.Atoi(strings.TrimSpace(c.Param("id")))
	if errParse != nil || id <= 0 {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "ID berita tidak valid",
		})
		return
	}

	if err := h.beritaUsecase.Delete(c.Request.Context(), id); err != nil {
		logrus.WithError(err).Error("handler.Berita.Delete: failed")
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
		Message: "Berita berhasil dihapus",
	})
}
