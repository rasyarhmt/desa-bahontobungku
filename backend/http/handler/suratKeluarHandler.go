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

type suratKeluarHandler struct {
	suratUsecase domain.SuratKeluarUsecase
}

func NewSuratKeluarHandler(suratUsecase domain.SuratKeluarUsecase) domain.SuratKeluarHandler {
	return &suratKeluarHandler{suratUsecase: suratUsecase}
}

// Create godoc
// @Summary      Tambah surat keluar baru
// @Description  Upload file arsip via form-data multipart: field file, nomorSurat, penerima, perihal, tanggalKirim, id_log_cetak. File dienkripsi menjadi .pdf.enc
// @Tags         surat-keluar
// @Accept       mpfd
// @Produce      json
// @Security     BearerAuth
// @Param        file           formData  file     true   "File arsip surat (PDF)"
// @Param        nomorSurat     formData  string   true   "Nomor surat"        example(005/DIS/IX/2026)
// @Param        penerima       formData  string   true   "Penerima surat"     example("Dinas Pendidikan")
// @Param        perihal        formData  string   false  "Perihal"
// @Param        tanggalKirim   formData  string   true   "Tanggal kirim"      example(2026-09-03)
// @Param        id_log_cetak   formData  integer  false  "ID log cetak"
// @Success      201     {object}  domain.HttpResponse
// @Failure      400     {object}  domain.HttpResponse
// @Failure      401     {object}  domain.HttpResponse
// @Router       /surat-keluar [post]
func (h *suratKeluarHandler) Create(c *gin.Context) {
	fileHeader, err := c.FormFile("file")
	if err != nil {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "File arsip wajib diupload",
		})
		return
	}
	if fileHeader.Size > maxSuratFileSize {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "Ukuran file melebihi batas maksimal 10 MB",
		})
		return
	}

	content, err := readUploadedFile(fileHeader)
	if err != nil {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusInternalServerError,
			Message: "Gagal membaca file arsip",
		})
		return
	}

	relPath, err := utils.EncryptArchiveFile(content, fileHeader.Filename)
	if err != nil {
		logrus.WithError(err).Error("handler.SuratKeluar.Create: encrypt file failed")
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusInternalServerError,
			Message: "Gagal menyimpan file arsip terenkripsi",
		})
		return
	}

	req := dto.SuratKeluarCreateRequestDTO{
		NomorSurat:   strings.TrimSpace(c.PostForm("nomorSurat")),
		Penerima:     strings.TrimSpace(c.PostForm("penerima")),
		Perihal:      strings.TrimSpace(c.PostForm("perihal")),
		TanggalKirim: strings.TrimSpace(c.PostForm("tanggalKirim")),
		File:         relPath,
	}
	if v := strings.TrimSpace(c.PostForm("id_log_cetak")); v != "" {
		if n, errConv := strconv.Atoi(v); errConv == nil {
			req.IDLogCetak = &n
		}
	}

	if err := h.suratUsecase.Create(c.Request.Context(), req); err != nil {
		logrus.WithError(err).Error("handler.SuratKeluar.Create: failed")
		_ = utils.DeleteArchiveFile(relPath)
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: err.Error(),
		})
		return
	}

	helpers.Response(c, domain.HttpResponse{
		Code:    http.StatusCreated,
		Message: "Surat keluar berhasil ditambahkan",
	})
}

// GetAll godoc
// @Summary      Get all surat keluar
// @Tags         surat-keluar
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  domain.HttpResponse{data=[]dto.SuratKeluarResponseDTO}
// @Failure      401  {object}  domain.HttpResponse
// @Failure      500  {object}  domain.HttpResponse
// @Router       /surat-keluar [get]
func (h *suratKeluarHandler) GetAll(c *gin.Context) {
	list, err := h.suratUsecase.GetAll(c.Request.Context())
	if err != nil {
		logrus.WithError(err).Error("handler.SuratKeluar.GetAll: failed")
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusInternalServerError,
			Message: "Gagal mengambil daftar surat keluar",
		})
		return
	}

	helpers.Response(c, domain.HttpResponse{
		Code:    http.StatusOK,
		Message: "Daftar surat keluar berhasil diambil",
		Data:    list,
	})
}

// GetByID godoc
// @Summary      Get surat keluar by id
// @Tags         surat-keluar
// @Produce      json
// @Security     BearerAuth
// @Param        id     path      integer  true  "ID surat keluar"
// @Success      200    {object}  domain.HttpResponse{data=dto.SuratKeluarResponseDTO}
// @Failure      400    {object}  domain.HttpResponse
// @Failure      401    {object}  domain.HttpResponse
// @Failure      404    {object}  domain.HttpResponse
// @Router       /surat-keluar/{id} [get]
func (h *suratKeluarHandler) GetByID(c *gin.Context) {
	id, errParse := strconv.Atoi(strings.TrimSpace(c.Param("id")))
	if errParse != nil || id <= 0 {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "ID surat keluar tidak valid",
		})
		return
	}

	s, err := h.suratUsecase.GetByID(c.Request.Context(), id)
	if err != nil {
		logrus.WithError(err).Error("handler.SuratKeluar.GetByID: failed")
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
		Message: "Surat keluar berhasil diambil",
		Data:    s,
	})
}

// DownloadFile godoc
// @Summary      Download file arsip surat keluar
// @Tags         surat-keluar
// @Produce      application/octet-stream
// @Security     BearerAuth
// @Param        id     path      integer  true  "ID surat keluar"
// @Success      200    {file}    binary
// @Failure      400    {object}  domain.HttpResponse
// @Failure      401    {object}  domain.HttpResponse
// @Failure      404    {object}  domain.HttpResponse
// @Router       /surat-keluar/{id}/file [get]
func (h *suratKeluarHandler) DownloadFile(c *gin.Context) {
	id, errParse := strconv.Atoi(strings.TrimSpace(c.Param("id")))
	if errParse != nil || id <= 0 {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "ID surat keluar tidak valid",
		})
		return
	}

	data, name, err := h.suratUsecase.DownloadFile(c.Request.Context(), id)
	if err != nil {
		logrus.WithError(err).Error("handler.SuratKeluar.DownloadFile: failed")
		code := http.StatusBadRequest
		if strings.Contains(err.Error(), "tidak ditemukan") || strings.Contains(err.Error(), "tidak memiliki") {
			code = http.StatusNotFound
		}
		helpers.Response(c, domain.HttpResponse{
			Code:    code,
			Message: err.Error(),
		})
		return
	}

	c.Header("Content-Disposition", "attachment; filename=\""+name+"\"")
	c.Data(http.StatusOK, "application/octet-stream", data)
}

// Update godoc
// @Summary      Update surat keluar
// @Description  Upload multipart, file opsional. Jika deleteFile=true, file lama dihapus. Jika diupload file baru, file lama diganti
// @Tags         surat-keluar
// @Accept       mpfd
// @Produce      json
// @Security     BearerAuth
// @Param        id           path      integer  true   "ID surat keluar"
// @Param        file         formData  file     false  "File arsip surat (opsional)"
// @Param        nomorSurat   formData  string   false  "Nomor surat"        example(005/DIS/IX/2026)
// @Param        penerima     formData  string   false  "Penerima surat"     example("Dinas Pendidikan")
// @Param        perihal      formData  string   false  "Perihal"
// @Param        tanggalKirim formData  string   false  "Tanggal kirim"      example(2026-09-03)
// @Param        id_log_cetak formData  integer  false  "ID log cetak"
// @Param        deleteFile   formData  boolean  false  "Hapus file yang ada"  example(false)
// @Success      200    {object}  domain.HttpResponse
// @Failure      400    {object}  domain.HttpResponse
// @Failure      401    {object}  domain.HttpResponse
// @Failure      404    {object}  domain.HttpResponse
// @Router       /surat-keluar/{id} [put]
func (h *suratKeluarHandler) Update(c *gin.Context) {
	id, errParse := strconv.Atoi(strings.TrimSpace(c.Param("id")))
	if errParse != nil || id <= 0 {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "ID surat keluar tidak valid",
		})
		return
	}

	req := dto.SuratKeluarUpdateRequestDTO{}
	if v := strings.TrimSpace(c.PostForm("nomorSurat")); v != "" {
		req.NomorSurat = &v
	}
	if v := strings.TrimSpace(c.PostForm("penerima")); v != "" {
		req.Penerima = &v
	}
	if v := strings.TrimSpace(c.PostForm("perihal")); v != "" {
		req.Perihal = &v
	}
	if v := strings.TrimSpace(c.PostForm("tanggalKirim")); v != "" {
		req.TanggalKirim = &v
	}
	if v := strings.TrimSpace(c.PostForm("id_log_cetak")); v != "" {
		if n, errConv := strconv.Atoi(v); errConv == nil {
			req.IDLogCetak = &n
		}
	}
	req.DeleteFile = strings.TrimSpace(c.PostForm("deleteFile")) == "true"

	if fileHeader, ferr := c.FormFile("file"); ferr == nil {
		if fileHeader.Size > maxSuratFileSize {
			helpers.Response(c, domain.HttpResponse{
				Code:    http.StatusBadRequest,
				Message: "Ukuran file melebihi batas maksimal 10 MB",
			})
			return
		}
		content, errRead := readUploadedFile(fileHeader)
		if errRead != nil {
			helpers.Response(c, domain.HttpResponse{
				Code:    http.StatusInternalServerError,
				Message: "Gagal membaca file arsip",
			})
			return
		}
		relPath, errEnc := utils.EncryptArchiveFile(content, fileHeader.Filename)
		if errEnc != nil {
			logrus.WithError(errEnc).Error("handler.SuratKeluar.Update: encrypt file failed")
			helpers.Response(c, domain.HttpResponse{
				Code:    http.StatusInternalServerError,
				Message: "Gagal menyimpan file arsip terenkripsi",
			})
			return
		}
		req.File = &relPath
	}

	if err := h.suratUsecase.Update(c.Request.Context(), id, req); err != nil {
		logrus.WithError(err).Error("handler.SuratKeluar.Update: failed")
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
		Message: "Surat keluar berhasil diperbarui",
	})
}

// Delete godoc
// @Summary      Hapus surat keluar
// @Tags         surat-keluar
// @Produce      json
// @Security     BearerAuth
// @Param        id     path      integer  true  "ID surat keluar"
// @Success      200    {object}  domain.HttpResponse
// @Failure      400    {object}  domain.HttpResponse
// @Failure      401    {object}  domain.HttpResponse
// @Failure      404    {object}  domain.HttpResponse
// @Router       /surat-keluar/{id} [delete]
func (h *suratKeluarHandler) Delete(c *gin.Context) {
	id, errParse := strconv.Atoi(strings.TrimSpace(c.Param("id")))
	if errParse != nil || id <= 0 {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "ID surat keluar tidak valid",
		})
		return
	}

	if err := h.suratUsecase.Delete(c.Request.Context(), id); err != nil {
		logrus.WithError(err).Error("handler.SuratKeluar.Delete: failed")
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
		Message: "Surat keluar berhasil dihapus",
	})
}
