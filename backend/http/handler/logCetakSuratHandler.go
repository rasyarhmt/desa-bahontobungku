package handler

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/rasyarhmt/desa-bahontobungku/config"
	"github.com/rasyarhmt/desa-bahontobungku/domain"
	"github.com/rasyarhmt/desa-bahontobungku/dto"
	"github.com/rasyarhmt/desa-bahontobungku/helpers"
	"github.com/rasyarhmt/desa-bahontobungku/utils"
	"github.com/sirupsen/logrus"
)

type logCetakSuratHandler struct {
	logUsecase domain.LogCetakSuratUsecase
}

func NewLogCetakSuratHandler(logUsecase domain.LogCetakSuratUsecase) domain.LogCetakSuratHandler {
	return &logCetakSuratHandler{logUsecase: logUsecase}
}

// Ajukan godoc
// @Summary      Ajukan surat dari pelayanan (warga)
// @Description  Warga mengisi data sesuai template pelayanan. Backend me-render template HTML, konversi ke PDF, simpan terenkripsi, lalu membuat log cetak surat (status dicetak) dgn kode_unik + QR utk verifikasi publik
// @Tags         log-cetak-surat
// @Accept       json
// @Produce      json
// @Param        id    path      integer  true  "ID pelayanan"
// @Param        body  body      dto.AjukanSuratRequestDTO  true  "Data surat"
// @Success      201   {object}  domain.HttpResponse{data=dto.AjukanSuratResponseDTO}
// @Failure      400   {object}  domain.HttpResponse
// @Failure      404   {object}  domain.HttpResponse
// @Failure      500   {object}  domain.HttpResponse
// @Router       /pelayanan/{id}/surat [post]
func (h *logCetakSuratHandler) Ajukan(c *gin.Context) {
	idPelayanan, errParse := strconv.Atoi(strings.TrimSpace(c.Param("id")))
	if errParse != nil || idPelayanan <= 0 {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "ID pelayanan tidak valid",
		})
		return
	}

	var req dto.AjukanSuratRequestDTO
	if err := helpers.DecodeJSON(c, &req); err != nil {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "Format data surat tidak valid: " + err.Error(),
		})
		return
	}

	result, err := h.logUsecase.Ajukan(c.Request.Context(), idPelayanan, req)
	if err != nil {
		logrus.WithError(err).Error("handler.LogCetakSurat.Ajukan: failed")
		code := http.StatusBadRequest
		if strings.Contains(err.Error(), "tidak ditemukan") {
			code = http.StatusNotFound
		}
		if strings.Contains(err.Error(), "konversi PDF gagal") {
			code = http.StatusInternalServerError
		}
		helpers.Response(c, domain.HttpResponse{
			Code:    code,
			Message: err.Error(),
		})
		return
	}

	helpers.Response(c, domain.HttpResponse{
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
// @Success      200  {object}  domain.HttpResponse{data=[]dto.LogCetakSuratResponseDTO}
// @Failure      401  {object}  domain.HttpResponse
// @Failure      500  {object}  domain.HttpResponse
// @Router       /log-cetak-surat [get]
func (h *logCetakSuratHandler) GetAll(c *gin.Context) {
	list, err := h.logUsecase.GetAll(c.Request.Context())
	if err != nil {
		logrus.WithError(err).Error("handler.LogCetakSurat.GetAll: failed")
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusInternalServerError,
			Message: "Gagal mengambil daftar log cetak surat",
		})
		return
	}

	helpers.Response(c, domain.HttpResponse{
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
// @Success      200    {object}  domain.HttpResponse{data=dto.LogCetakSuratResponseDTO}
// @Failure      400    {object}  domain.HttpResponse
// @Failure      401    {object}  domain.HttpResponse
// @Failure      404    {object}  domain.HttpResponse
// @Router       /log-cetak-surat/{id} [get]
func (h *logCetakSuratHandler) GetByID(c *gin.Context) {
	id, errParse := strconv.Atoi(strings.TrimSpace(c.Param("id")))
	if errParse != nil || id <= 0 {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "ID log cetak surat tidak valid",
		})
		return
	}

	l, err := h.logUsecase.GetByID(c.Request.Context(), id)
	if err != nil {
		logrus.WithError(err).Error("handler.LogCetakSurat.GetByID: failed")
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
// @Failure      400        {object}  domain.HttpResponse
// @Failure      404        {object}  domain.HttpResponse
// @Router       /log-cetak-surat/surat/{kode_unik}/file [get]
func (h *logCetakSuratHandler) DownloadByKode(c *gin.Context) {
	kode := strings.TrimSpace(c.Param("kode_unik"))
	if kode == "" {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "kode_unik wajib diisi",
		})
		return
	}

	pdfBytes, filename, err := h.logUsecase.DownloadByKode(c.Request.Context(), kode)
	if err != nil {
		logrus.WithError(err).Error("handler.LogCetakSurat.DownloadByKode: failed")
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

	servePDF(c, pdfBytes, filename)
}

// DownloadByID godoc
// @Summary      Download surat (PDF) by id (admin)
// @Tags         log-cetak-surat
// @Produce      application/pdf
// @Security     BearerAuth
// @Param        id  path  integer  true  "ID log cetak surat"
// @Success      200     {string}  string
// @Failure      400     {object}  domain.HttpResponse
// @Failure      401     {object}  domain.HttpResponse
// @Failure      404     {object}  domain.HttpResponse
// @Router       /log-cetak-surat/{id}/file [get]
func (h *logCetakSuratHandler) DownloadByID(c *gin.Context) {
	id, errParse := strconv.Atoi(strings.TrimSpace(c.Param("id")))
	if errParse != nil || id <= 0 {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "ID log cetak surat tidak valid",
		})
		return
	}

	pdfBytes, filename, err := h.logUsecase.DownloadByID(c.Request.Context(), id)
	if err != nil {
		logrus.WithError(err).Error("handler.LogCetakSurat.DownloadByID: failed")
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
// @Success      200   {object}  domain.HttpResponse
// @Failure      400   {object}  domain.HttpResponse
// @Failure      401   {object}  domain.HttpResponse
// @Failure      404   {object}  domain.HttpResponse
// @Router       /log-cetak-surat/{id}/resmikan [put]
func (h *logCetakSuratHandler) Resmikan(c *gin.Context) {
	id, errParse := strconv.Atoi(strings.TrimSpace(c.Param("id")))
	if errParse != nil || id <= 0 {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "ID log cetak surat tidak valid",
		})
		return
	}

	var req dto.ResmikanSuratRequestDTO
	if err := helpers.DecodeJSON(c, &req); err != nil {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "Format data tidak valid: " + err.Error(),
		})
		return
	}

	if err := h.logUsecase.Resmikan(c.Request.Context(), id, req.NomorSurat); err != nil {
		logrus.WithError(err).Error("handler.LogCetakSurat.Resmikan: failed")
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
		Message: "Surat berhasil diresmikan",
	})
}

// Verifikasi godoc
// @Summary      Verifikasi surat via kode unik (publik)
// @Tags         log-cetak-surat
// @Produce      json
// @Param        kode_unik   path      string  true  "Kode unik registrasi surat"
// @Success      200         {object}  domain.HttpResponse{data=dto.LogCetakSuratVerifikasiDTO}
// @Failure      400         {object}  domain.HttpResponse
// @Failure      404         {object}  domain.HttpResponse
// @Router       /log-cetak-surat/verifikasi/{kode_unik} [get]
func (h *logCetakSuratHandler) Verifikasi(c *gin.Context) {
	kode := strings.TrimSpace(c.Param("kode_unik"))
	if kode == "" {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "kode_unik wajib diisi",
		})
		return
	}

	v, err := h.logUsecase.Verifikasi(c.Request.Context(), kode)
	if err != nil {
		logrus.WithError(err).Error("handler.LogCetakSurat.Verifikasi: failed")
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
// @Failure      400         {object}  domain.HttpResponse
// @Failure      404         {object}  domain.HttpResponse
// @Router       /log-cetak-surat/verifikasi/{kode_unik}/qr [get]
func (h *logCetakSuratHandler) QR(c *gin.Context) {
	kode := strings.TrimSpace(c.Param("kode_unik"))
	if kode == "" {
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "kode_unik wajib diisi",
		})
		return
	}

	if _, err := h.logUsecase.Verifikasi(c.Request.Context(), kode); err != nil {
		logrus.WithError(err).Error("handler.LogCetakSurat.QR: verifikasi failed")
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

	var verifyURL string
	origin := pickFrontendOrigin(c.Request.Host, c.Request.TLS != nil)
	if origin != "" {
		verifyURL = origin + "/verifikasi?kode=" + kode
	} else {
		proto := "http"
		if c.Request.TLS != nil {
			proto = "https"
		}
		verifyURL = fmt.Sprintf("%s://%s/api/v1/log-cetak-surat/verifikasi/%s", proto, c.Request.Host, kode)
	}

	png, err := utils.GenerateQRPNG(verifyURL, 0)
	if err != nil {
		logrus.WithError(err).Error("handler.LogCetakSurat.QR: generate failed")
		helpers.Response(c, domain.HttpResponse{
			Code:    http.StatusInternalServerError,
			Message: "Gagal membuat QR code",
		})
		return
	}

	c.Data(http.StatusOK, "image/png", png)
}

// pickFrontendOrigin memilih origin frontend yang layak untuk URL verifikasi
// QR: gunakan origin dev bila request dari localhost, selain itu origin prod.
// Mengembalikan string kosong bila tidak ada origin terkonfigurasi.
func pickFrontendOrigin(host string, isTLS bool) string {
	if config.AppConfig == nil || len(config.AppConfig.AllowedOrigins) == 0 {
		return ""
	}
	dev := ""
	prod := ""
	for _, o := range config.AppConfig.AllowedOrigins {
		o = strings.TrimSpace(o)
		if o == "" {
			continue
		}
		if strings.Contains(o, "localhost") || strings.Contains(o, "127.0.0.1") {
			dev = o
		} else {
			prod = o
		}
	}
	if strings.Contains(host, "localhost") || strings.Contains(host, "127.0.0.1") {
		return strings.TrimSuffix(dev, "/")
	}
	return strings.TrimSuffix(prod, "/")
}

func servePDF(c *gin.Context, data []byte, filename string) {
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%q", filename))
	c.Data(http.StatusOK, "application/pdf", data)
}
