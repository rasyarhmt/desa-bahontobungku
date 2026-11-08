package handler

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/rasyarhmt/desa-bahontobungku/config"
	"github.com/rasyarhmt/desa-bahontobungku/dto"
	"github.com/rasyarhmt/desa-bahontobungku/helpers"
	"github.com/rasyarhmt/desa-bahontobungku/usecase"
	"github.com/rasyarhmt/desa-bahontobungku/utils"
	"github.com/sirupsen/logrus"
)

type logCetakSuratHandler struct {
	logUsecase usecase.LogCetakSuratUsecase
}

func NewLogCetakSuratHandler(logUsecase usecase.LogCetakSuratUsecase) LogCetakSuratHandler {
	return &logCetakSuratHandler{logUsecase: logUsecase}
}

// Ajukan godoc
// @Summary      Ajukan surat dari pelayanan (warga)
// @Description  Warga mengisi data sesuai template pelayanan. Backend mem-binding data ke template DOCX, mengonversi ke PDF via LibreOffice, menyimpan terenkripsi, lalu membuat log cetak surat (status dicetak) dgn kode_unik + QR utk verifikasi publik
// @Tags         log-cetak-surat
// @Accept       json
// @Produce      json
// @Param        id    path      integer  true  "ID pelayanan"
// @Param        body  body      dto.AjukanSuratRequestDTO  true  "Data surat"
// @Success      201   {object}  helpers.HttpResponse{data=dto.AjukanSuratResponseDTO}
// @Failure      400   {object}  helpers.HttpResponse
// @Failure      404   {object}  helpers.HttpResponse
// @Failure      500   {object}  helpers.HttpResponse
// @Router       /pelayanan/{id}/surat [post]
func (h *logCetakSuratHandler) Ajukan(c *gin.Context) {
	idPelayanan, ok := parseIDParam(c, "ID pelayanan tidak valid")
	if !ok {
		return
	}

	var req dto.AjukanSuratRequestDTO
	if err := helpers.DecodeJSON(c, &req); err != nil {
		helpers.Response(c, helpers.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "Format data surat tidak valid: " + err.Error(),
		})
		return
	}

	result, err := h.logUsecase.Ajukan(c.Request.Context(), idPelayanan, req, c.Request.Host, c.Request.TLS != nil)
	if err != nil {
		logrus.WithError(err).Error("handler.LogCetakSurat.Ajukan: failed")
		helpers.RespondError(c, err)
		return
	}

	helpers.Response(c, helpers.HttpResponse{
		Code:    http.StatusCreated,
		Message: "Surat berhasil dibuat",
		Data:    result,
	})
}

// GetAll godoc
// @Summary      Get all log cetak surat
// @Tags         log-cetak-surat
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  helpers.HttpResponse{data=[]dto.LogCetakSuratResponseDTO}
// @Failure      401  {object}  helpers.HttpResponse
// @Failure      500  {object}  helpers.HttpResponse
// @Router       /log-cetak-surat [get]
func (h *logCetakSuratHandler) GetAll(c *gin.Context) {
	list, err := h.logUsecase.GetAll(c.Request.Context())
	if err != nil {
		logrus.WithError(err).Error("handler.LogCetakSurat.GetAll: failed")
		helpers.Response(c, helpers.HttpResponse{
			Code:    http.StatusInternalServerError,
			Message: "Gagal mengambil daftar log cetak surat",
		})
		return
	}

	helpers.Response(c, helpers.HttpResponse{
		Code:    http.StatusOK,
		Message: "Daftar log cetak surat berhasil diambil",
		Data:    list,
	})
}

// GetByID godoc
// @Summary      Get log cetak surat by id
// @Tags         log-cetak-surat
// @Produce      json
// @Security     BearerAuth
// @Param        id     path      integer  true  "ID log cetak surat"
// @Success      200    {object}  helpers.HttpResponse{data=dto.LogCetakSuratResponseDTO}
// @Failure      400    {object}  helpers.HttpResponse
// @Failure      401    {object}  helpers.HttpResponse
// @Failure      404    {object}  helpers.HttpResponse
// @Router       /log-cetak-surat/{id} [get]
func (h *logCetakSuratHandler) GetByID(c *gin.Context) {
	id, ok := parseIDParam(c, "ID log cetak surat tidak valid")
	if !ok {
		return
	}

	l, err := h.logUsecase.GetByID(c.Request.Context(), id)
	if err != nil {
		logrus.WithError(err).Error("handler.LogCetakSurat.GetByID: failed")
		helpers.RespondError(c, err)
		return
	}

	helpers.Response(c, helpers.HttpResponse{
		Code:    http.StatusOK,
		Message: "Log cetak surat berhasil diambil",
		Data:    l,
	})
}

// DownloadByKode godoc
// @Summary      Download surat (PDF) via kode unik (warga)
// @Tags         log-cetak-surat
// @Produce      application/pdf
// @Param        kode_unik  path  string  true  "Kode unik surat"
// @Success      200        {string}  string
// @Failure      400        {object}  helpers.HttpResponse
// @Failure      404        {object}  helpers.HttpResponse
// @Router       /log-cetak-surat/surat/{kode_unik}/file [get]
func (h *logCetakSuratHandler) DownloadByKode(c *gin.Context) {
	kode := strings.TrimSpace(c.Param("kode_unik"))
	if kode == "" {
		helpers.Response(c, helpers.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "kode_unik wajib diisi",
		})
		return
	}

	pdfBytes, filename, err := h.logUsecase.DownloadByKode(c.Request.Context(), kode)
	if err != nil {
		logrus.WithError(err).Error("handler.LogCetakSurat.DownloadByKode: failed")
		helpers.RespondError(c, err)
		return
	}

	servePDF(c, pdfBytes, filename)
}

// DownloadByID godoc
// @Summary      Download surat (PDF) by id (admin)
// @Tags         log-cetak-surat
// @Produce      application/pdf
// @Security     BearerAuth
// @Param        id  path  integer  true  "ID log cetak surat"
// @Success      200     {string}  string
// @Failure      400     {object}  helpers.HttpResponse
// @Failure      401     {object}  helpers.HttpResponse
// @Failure      404     {object}  helpers.HttpResponse
// @Router       /log-cetak-surat/{id}/file [get]
func (h *logCetakSuratHandler) DownloadByID(c *gin.Context) {
	id, ok := parseIDParam(c, "ID log cetak surat tidak valid")
	if !ok {
		return
	}

	pdfBytes, filename, err := h.logUsecase.DownloadByID(c.Request.Context(), id)
	if err != nil {
		logrus.WithError(err).Error("handler.LogCetakSurat.DownloadByID: failed")
		helpers.RespondError(c, err)
		return
	}

	servePDF(c, pdfBytes, filename)
}

// Resmikan godoc
// @Summary      Resmikan surat (isi nomor surat, status dicetak -> diresmikan)
// @Tags         log-cetak-surat
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id    path      integer              true  "ID log cetak surat"
// @Param        body  body      dto.ResmikanSuratRequestDTO  true  "Nomor surat"
// @Success      200   {object}  helpers.HttpResponse
// @Failure      400   {object}  helpers.HttpResponse
// @Failure      401   {object}  helpers.HttpResponse
// @Failure      404   {object}  helpers.HttpResponse
// @Router       /log-cetak-surat/{id}/resmikan [put]
func (h *logCetakSuratHandler) Resmikan(c *gin.Context) {
	id, ok := parseIDParam(c, "ID log cetak surat tidak valid")
	if !ok {
		return
	}

	var req dto.ResmikanSuratRequestDTO
	if err := helpers.DecodeJSON(c, &req); err != nil {
		helpers.Response(c, helpers.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "Format data tidak valid: " + err.Error(),
		})
		return
	}

	if err := h.logUsecase.Resmikan(c.Request.Context(), id, req.NomorSurat); err != nil {
		logrus.WithError(err).Error("handler.LogCetakSurat.Resmikan: failed")
		helpers.RespondError(c, err)
		return
	}

	helpers.Response(c, helpers.HttpResponse{
		Code:    http.StatusOK,
		Message: "Surat berhasil diresmikan",
	})
}

// Verifikasi godoc
// @Summary      Verifikasi surat via kode unik (publik)
// @Tags         log-cetak-surat
// @Produce      json
// @Param        kode_unik   path      string  true  "Kode unik registrasi surat"
// @Success      200         {object}  helpers.HttpResponse{data=dto.LogCetakSuratVerifikasiDTO}
// @Failure      400         {object}  helpers.HttpResponse
// @Failure      404         {object}  helpers.HttpResponse
// @Router       /log-cetak-surat/verifikasi/{kode_unik} [get]
func (h *logCetakSuratHandler) Verifikasi(c *gin.Context) {
	kode := strings.TrimSpace(c.Param("kode_unik"))
	if kode == "" {
		helpers.Response(c, helpers.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "kode_unik wajib diisi",
		})
		return
	}

	v, err := h.logUsecase.Verifikasi(c.Request.Context(), kode)
	if err != nil {
		logrus.WithError(err).Error("handler.LogCetakSurat.Verifikasi: failed")
		helpers.RespondError(c, err)
		return
	}

	helpers.Response(c, helpers.HttpResponse{
		Code:    http.StatusOK,
		Message: "Data surat berhasil diverifikasi",
		Data:    v,
	})
}

// QR godoc
// @Summary      QR verifikasi surat (publik)
// @Description  Menghasilkan QR PNG berisi URL verifikasi utk kode_unik. Disisipkan saat mencetak surat
// @Tags         log-cetak-surat
// @Produce      image/png
// @Param        kode_unik   path  string  true  "Kode unik registrasi surat"
// @Success      200         {string}  string
// @Failure      400         {object}  helpers.HttpResponse
// @Failure      404         {object}  helpers.HttpResponse
// @Router       /log-cetak-surat/verifikasi/{kode_unik}/qr [get]
func (h *logCetakSuratHandler) QR(c *gin.Context) {
	kode := strings.TrimSpace(c.Param("kode_unik"))
	if kode == "" {
		helpers.Response(c, helpers.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "kode_unik wajib diisi",
		})
		return
	}

	if _, err := h.logUsecase.Verifikasi(c.Request.Context(), kode); err != nil {
		logrus.WithError(err).Error("handler.LogCetakSurat.QR: verifikasi failed")
		helpers.RespondError(c, err)
		return
	}

	var allowedOrigins []string
	if config.AppConfig != nil {
		allowedOrigins = config.AppConfig.AllowedOrigins
	}

	verifyURL := utils.BuildVerificationURL(
		kode,
		c.Request.Host,
		c.Request.TLS != nil,
		allowedOrigins,
	)

	png, err := utils.GenerateQRPNG(verifyURL, 0)
	if err != nil {
		logrus.WithError(err).Error("handler.LogCetakSurat.QR: generate failed")
		helpers.Response(c, helpers.HttpResponse{
			Code:    http.StatusInternalServerError,
			Message: "Gagal membuat QR code",
		})
		return
	}

	c.Data(http.StatusOK, "image/png", png)
}

func servePDF(c *gin.Context, data []byte, filename string) {
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%q", filename))
	c.Data(http.StatusOK, "application/pdf", data)
}
