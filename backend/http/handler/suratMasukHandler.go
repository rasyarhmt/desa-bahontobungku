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

type suratMasukHandler struct {
	suratUsecase usecase.SuratMasukUsecase
}

func NewSuratMasukHandler(suratUsecase usecase.SuratMasukUsecase) SuratMasukHandler {
	return &suratMasukHandler{suratUsecase: suratUsecase}
}

// Create godoc
// @Summary      Tambah surat masuk baru
// @Description  Upload file arsip via form-data multipart: field file, nomorSurat, pengirim, perihal, tanggalTerima. File dienkripsi menjadi .pdf.enc
// @Tags         surat-masuk
// @Accept       mpfd
// @Produce      json
// @Security     BearerAuth
// @Param        file            formData  file     true   "File arsip surat (PDF)"
// @Param        nomorSurat      formData  string   true   "Nomor surat"        example(005/DIS/IX/2026)
// @Param        pengirim        formData  string   true   "Pengirim surat"     example("Dinas Pendidikan")
// @Param        perihal         formData  string   false  "Perihal"
// @Param        tanggalTerima   formData  string   true   "Tanggal terima"     example(2026-09-03)
// @Success      201     {object}  helpers.HttpResponse
// @Failure      400     {object}  helpers.HttpResponse
// @Failure      401     {object}  helpers.HttpResponse
// @Router       /surat-masuk [post]
func (h *suratMasukHandler) Create(c *gin.Context) {
	fileHeader, _ := c.FormFile("file")
	file, ok := readUploadedFile(c, fileHeader, "Gagal membaca file arsip")
	if !ok {
		return
	}

	req := dto.SuratMasukCreateRequestDTO{
		NomorSurat:    strings.TrimSpace(c.PostForm("nomorSurat")),
		Pengirim:      strings.TrimSpace(c.PostForm("pengirim")),
		Perihal:       strings.TrimSpace(c.PostForm("perihal")),
		TanggalTerima: strings.TrimSpace(c.PostForm("tanggalTerima")),
	}

	if err := h.suratUsecase.Create(c.Request.Context(), req, file); err != nil {
		logrus.WithError(err).Error("handler.SuratMasuk.Create: failed")
		helpers.RespondError(c, err)
		return
	}

	helpers.Response(c, helpers.HttpResponse{
		Code:    http.StatusCreated,
		Message: "Surat masuk berhasil ditambahkan",
	})
}

// GetAll godoc
// @Summary      Get all surat masuk
// @Tags         surat-masuk
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  helpers.HttpResponse{data=[]dto.SuratMasukResponseDTO}
// @Failure      401  {object}  helpers.HttpResponse
// @Failure      500  {object}  helpers.HttpResponse
// @Router       /surat-masuk [get]
func (h *suratMasukHandler) GetAll(c *gin.Context) {
	list, err := h.suratUsecase.GetAll(c.Request.Context())
	if err != nil {
		logrus.WithError(err).Error("handler.SuratMasuk.GetAll: failed")
		helpers.Response(c, helpers.HttpResponse{
			Code:    http.StatusInternalServerError,
			Message: "Gagal mengambil daftar surat masuk",
		})
		return
	}

	helpers.Response(c, helpers.HttpResponse{
		Code:    http.StatusOK,
		Message: "Daftar surat masuk berhasil diambil",
		Data:    list,
	})
}

// GetByID godoc
// @Summary      Get surat masuk by id
// @Tags         surat-masuk
// @Produce      json
// @Security     BearerAuth
// @Param        id     path      integer  true  "ID surat masuk"
// @Success      200    {object}  helpers.HttpResponse{data=dto.SuratMasukResponseDTO}
// @Failure      400    {object}  helpers.HttpResponse
// @Failure      401    {object}  helpers.HttpResponse
// @Failure      404    {object}  helpers.HttpResponse
// @Router       /surat-masuk/{id} [get]
func (h *suratMasukHandler) GetByID(c *gin.Context) {
	id, ok := parseIDParam(c, "ID surat masuk tidak valid")
	if !ok {
		return
	}

	s, err := h.suratUsecase.GetByID(c.Request.Context(), id)
	if err != nil {
		logrus.WithError(err).Error("handler.SuratMasuk.GetByID: failed")
		helpers.RespondError(c, err)
		return
	}

	helpers.Response(c, helpers.HttpResponse{
		Code:    http.StatusOK,
		Message: "Surat masuk berhasil diambil",
		Data:    s,
	})
}

// DownloadFile godoc
// @Summary      Download file arsip surat masuk
// @Tags         surat-masuk
// @Produce      application/octet-stream
// @Security     BearerAuth
// @Param        id     path      integer  true  "ID surat masuk"
// @Success      200    {file}    binary
// @Failure      400    {object}  helpers.HttpResponse
// @Failure      401    {object}  helpers.HttpResponse
// @Failure      404    {object}  helpers.HttpResponse
// @Router       /surat-masuk/{id}/file [get]
func (h *suratMasukHandler) DownloadFile(c *gin.Context) {
	id, ok := parseIDParam(c, "ID surat masuk tidak valid")
	if !ok {
		return
	}

	data, name, err := h.suratUsecase.DownloadFile(c.Request.Context(), id)
	if err != nil {
		logrus.WithError(err).Error("handler.SuratMasuk.DownloadFile: failed")
		helpers.RespondError(c, err)
		return
	}

	c.Header("Content-Disposition", "attachment; filename=\""+name+"\"")
	c.Data(http.StatusOK, "application/octet-stream", data)
}

// Update godoc
// @Summary      Update surat masuk
// @Description  Upload multipart, file opsional. Jika deleteFile=true, file lama dihapus. Jika diupload file baru, file lama diganti
// @Tags         surat-masuk
// @Accept       mpfd
// @Produce      json
// @Security     BearerAuth
// @Param        id            path      integer  true   "ID surat masuk"
// @Param        file          formData  file     false  "File arsip surat (opsional)"
// @Param        nomorSurat    formData  string   false  "Nomor surat"        example(005/DIS/IX/2026)
// @Param        pengirim      formData  string   false  "Pengirim surat"     example("Dinas Pendidikan")
// @Param        perihal       formData  string   false  "Perihal"
// @Param        tanggalTerima formData  string   false  "Tanggal terima"     example(2026-09-03)
// @Param        deleteFile    formData  boolean  false  "Hapus file yang ada"  example(false)
// @Success      200    {object}  helpers.HttpResponse
// @Failure      400    {object}  helpers.HttpResponse
// @Failure      401    {object}  helpers.HttpResponse
// @Failure      404    {object}  helpers.HttpResponse
// @Router       /surat-masuk/{id} [put]
func (h *suratMasukHandler) Update(c *gin.Context) {
	id, ok := parseIDParam(c, "ID surat masuk tidak valid")
	if !ok {
		return
	}

	req := dto.SuratMasukUpdateRequestDTO{}
	if v := strings.TrimSpace(c.PostForm("nomorSurat")); v != "" {
		req.NomorSurat = &v
	}
	if v := strings.TrimSpace(c.PostForm("pengirim")); v != "" {
		req.Pengirim = &v
	}
	if v := strings.TrimSpace(c.PostForm("perihal")); v != "" {
		req.Perihal = &v
	}
	if v := strings.TrimSpace(c.PostForm("tanggalTerima")); v != "" {
		req.TanggalTerima = &v
	}
	req.DeleteFile = strings.TrimSpace(c.PostForm("deleteFile")) == "true"

	fileHeader, _ := c.FormFile("file")
	file, ok := readUploadedFile(c, fileHeader, "Gagal membaca file arsip")
	if !ok {
		return
	}

	if err := h.suratUsecase.Update(c.Request.Context(), id, req, file); err != nil {
		logrus.WithError(err).Error("handler.SuratMasuk.Update: failed")
		helpers.RespondError(c, err)
		return
	}

	helpers.Response(c, helpers.HttpResponse{
		Code:    http.StatusOK,
		Message: "Surat masuk berhasil diperbarui",
	})
}

// Delete godoc
// @Summary      Hapus surat masuk
// @Tags         surat-masuk
// @Produce      json
// @Security     BearerAuth
// @Param        id     path      integer  true  "ID surat masuk"
// @Success      200    {object}  helpers.HttpResponse
// @Failure      400    {object}  helpers.HttpResponse
// @Failure      401    {object}  helpers.HttpResponse
// @Failure      404    {object}  helpers.HttpResponse
// @Router       /surat-masuk/{id} [delete]
func (h *suratMasukHandler) Delete(c *gin.Context) {
	id, ok := parseIDParam(c, "ID surat masuk tidak valid")
	if !ok {
		return
	}

	if err := h.suratUsecase.Delete(c.Request.Context(), id); err != nil {
		logrus.WithError(err).Error("handler.SuratMasuk.Delete: failed")
		helpers.RespondError(c, err)
		return
	}

	helpers.Response(c, helpers.HttpResponse{
		Code:    http.StatusOK,
		Message: "Surat masuk berhasil dihapus",
	})
}
