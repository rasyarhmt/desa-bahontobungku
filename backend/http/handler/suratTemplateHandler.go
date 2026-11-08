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

type suratTemplateHandler struct {
	templateUsecase usecase.SuratTemplateUsecase
}

func NewSuratTemplateHandler(templateUsecase usecase.SuratTemplateUsecase) SuratTemplateHandler {
	return &suratTemplateHandler{templateUsecase: templateUsecase}
}

// Create godoc
// @Summary      Tambah template surat baru
// @Description  Upload file template DOCX (.docx) form-data multipart: field file_template, kode, nama_template, deskripsi, status. File dienkripsi menjadi .docx.enc
// @Tags         surat-template
// @Accept       mpfd
// @Produce      json
// @Security     BearerAuth
// @Param        file_template        formData  file     true   "File template DOCX (.docx)"
// @Param        kode                 formData  string   true   "Kode unik template"        example(SK_DOMISILI)
// @Param        nama_template        formData  string   true   "Nama template"             example("Surat Keterangan Domisili")
// @Param        deskripsi            formData  string   false  "Deskripsi template"
// @Param        status               formData  string   false  "aktif / nonaktif"          example(aktif)
// @Success      201      {object}  helpers.HttpResponse
// @Failure      400      {object}  helpers.HttpResponse
// @Failure      401      {object}  helpers.HttpResponse
// @Router       /surat-template [post]
func (h *suratTemplateHandler) Create(c *gin.Context) {
	fileHeader, _ := c.FormFile("file_template")
	file, ok := readUploadedFile(c, fileHeader, "Gagal membaca file template")
	if !ok {
		return
	}

	req := dto.SuratTemplateCreateRequestDTO{
		Kode:         strings.TrimSpace(c.PostForm("kode")),
		NamaTemplate: strings.TrimSpace(c.PostForm("nama_template")),
		Deskripsi:    strings.TrimSpace(c.PostForm("deskripsi")),
		Status:       strings.TrimSpace(c.PostForm("status")),
	}

	if err := h.templateUsecase.Create(c.Request.Context(), req, file); err != nil {
		logrus.WithError(err).Error("handler.SuratTemplate.Create: failed")
		helpers.RespondError(c, err)
		return
	}

	helpers.Response(c, helpers.HttpResponse{
		Code:    http.StatusCreated,
		Message: "Template surat berhasil ditambahkan",
	})
}

// GetAll godoc
// @Summary      Get all template surat
// @Tags         surat-template
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  helpers.HttpResponse{data=[]dto.SuratTemplateResponseDTO}
// @Failure      401  {object}  helpers.HttpResponse
// @Failure      500  {object}  helpers.HttpResponse
// @Router       /surat-template [get]
func (h *suratTemplateHandler) GetAll(c *gin.Context) {
	list, err := h.templateUsecase.GetAll(c.Request.Context())
	if err != nil {
		logrus.WithError(err).Error("handler.SuratTemplate.GetAll: failed")
		helpers.Response(c, helpers.HttpResponse{
			Code:    http.StatusInternalServerError,
			Message: "Gagal mengambil daftar template surat",
		})
		return
	}

	helpers.Response(c, helpers.HttpResponse{
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
// @Success      200    {object}  helpers.HttpResponse{data=dto.SuratTemplateResponseDTO}
// @Failure      400    {object}  helpers.HttpResponse
// @Failure      401    {object}  helpers.HttpResponse
// @Failure      404    {object}  helpers.HttpResponse
// @Router       /surat-template/{id} [get]
func (h *suratTemplateHandler) GetByID(c *gin.Context) {
	id, ok := parseIDParam(c, "ID template tidak valid")
	if !ok {
		return
	}

	t, err := h.templateUsecase.GetByID(c.Request.Context(), id)
	if err != nil {
		logrus.WithError(err).Error("handler.SuratTemplate.GetByID: failed")
		helpers.RespondError(c, err)
		return
	}

	helpers.Response(c, helpers.HttpResponse{
		Code:    http.StatusOK,
		Message: "Template surat berhasil diambil",
		Data:    t,
	})
}

// Update godoc
// @Summary      Update template surat
// @Description  Upload multipart, file_template (.docx) opsional. Jika tidak diupload, file lama dipertahankan
// @Tags         surat-template
// @Accept       mpfd
// @Produce      json
// @Security     BearerAuth
// @Param        id                 path      integer  true   "ID template"
// @Param        kode               formData  string   true   "Kode unik template"        example(SK_DOMISILI)
// @Param        file_template      formData  file     false  "File template DOCX (.docx, opsional)"
// @Param        nama_template      formData  string   false  "Nama template"             example("Surat Keterangan Domisili")
// @Param        deskripsi          formData  string   false  "Deskripsi template"
// @Success      200      {object}  helpers.HttpResponse
// @Failure      400      {object}  helpers.HttpResponse
// @Failure      401      {object}  helpers.HttpResponse
// @Failure      404      {object}  helpers.HttpResponse
// @Router       /surat-template/{id} [put]
func (h *suratTemplateHandler) Update(c *gin.Context) {
	id, ok := parseIDParam(c, "ID template tidak valid")
	if !ok {
		return
	}

	req := dto.SuratTemplateUpdateRequestDTO{}
	if v := strings.TrimSpace(c.PostForm("nama_template")); v != "" {
		req.NamaTemplate = &v
	}
	if v := strings.TrimSpace(c.PostForm("deskripsi")); v != "" {
		req.Deskripsi = &v
	}

	fileHeader, _ := c.FormFile("file_template")
	file, ok := readUploadedFile(c, fileHeader, "Gagal membaca file template")
	if !ok {
		return
	}

	if err := h.templateUsecase.Update(c.Request.Context(), id, req, file); err != nil {
		logrus.WithError(err).Error("handler.SuratTemplate.Update: failed")
		helpers.RespondError(c, err)
		return
	}

	helpers.Response(c, helpers.HttpResponse{
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
// @Success      200    {object}  helpers.HttpResponse
// @Failure      400    {object}  helpers.HttpResponse
// @Failure      401    {object}  helpers.HttpResponse
// @Failure      404    {object}  helpers.HttpResponse
// @Router       /surat-template/{id} [delete]
func (h *suratTemplateHandler) Delete(c *gin.Context) {
	id, ok := parseIDParam(c, "ID template tidak valid")
	if !ok {
		return
	}

	if err := h.templateUsecase.Delete(c.Request.Context(), id); err != nil {
		logrus.WithError(err).Error("handler.SuratTemplate.Delete: failed")
		helpers.RespondError(c, err)
		return
	}

	helpers.Response(c, helpers.HttpResponse{
		Code:    http.StatusOK,
		Message: "Template surat berhasil dihapus",
	})
}

// Preview godoc
// @Summary      Preview template surat sebagai PDF
// @Description  Konversi file template DOCX menjadi PDF untuk dilihat admin (placeholder tetap tampil)
// @Tags         surat-template
// @Produce      application/pdf
// @Security     BearerAuth
// @Param        id  path  integer  true  "ID template"
// @Success      200  {string}  string
// @Failure      400  {object}  helpers.HttpResponse
// @Failure      401  {object}  helpers.HttpResponse
// @Failure      404  {object}  helpers.HttpResponse
// @Router       /surat-template/{id}/preview [get]
func (h *suratTemplateHandler) Preview(c *gin.Context) {
	id, ok := parseIDParam(c, "ID template tidak valid")
	if !ok {
		return
	}

	pdfBytes, filename, err := h.templateUsecase.Preview(c.Request.Context(), id)
	if err != nil {
		logrus.WithError(err).Error("handler.SuratTemplate.Preview: failed")
		helpers.RespondError(c, err)
		return
	}

	servePDF(c, pdfBytes, filename)
}

// ToggleStatus godoc
// @Summary      Toggle status template (aktif/nonaktif)
// @Tags         surat-template
// @Produce      json
// @Security     BearerAuth
// @Param        id     path      integer  true  "ID template"
// @Success      200    {object}  helpers.HttpResponse
// @Failure      400    {object}  helpers.HttpResponse
// @Failure      401    {object}  helpers.HttpResponse
// @Failure      404    {object}  helpers.HttpResponse
// @Router       /surat-template/{id}/toggle-status [put]
func (h *suratTemplateHandler) ToggleStatus(c *gin.Context) {
	id, ok := parseIDParam(c, "ID template tidak valid")
	if !ok {
		return
	}

	if err := h.templateUsecase.ToggleStatus(c.Request.Context(), id); err != nil {
		logrus.WithError(err).Error("handler.SuratTemplate.ToggleStatus: failed")
		helpers.RespondError(c, err)
		return
	}

	helpers.Response(c, helpers.HttpResponse{
		Code:    http.StatusOK,
		Message: "Status template surat berhasil diubah",
	})
}

// GetFields godoc
// @Summary      Daftar metadata field template surat
// @Tags         surat-template
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      integer  true  "ID template"
// @Success      200  {object}  helpers.HttpResponse{data=[]dto.TemplateFieldDTO}
// @Failure      400  {object}  helpers.HttpResponse
// @Failure      401  {object}  helpers.HttpResponse
// @Failure      404  {object}  helpers.HttpResponse
// @Router       /surat-template/{id}/fields [get]
func (h *suratTemplateHandler) GetFields(c *gin.Context) {
	id, ok := parseIDParam(c, "ID template tidak valid")
	if !ok {
		return
	}

	fields, err := h.templateUsecase.GetFields(c.Request.Context(), id)
	if err != nil {
		logrus.WithError(err).Error("handler.SuratTemplate.GetFields: failed")
		helpers.RespondError(c, err)
		return
	}

	helpers.Response(c, helpers.HttpResponse{
		Code:    http.StatusOK,
		Message: "Field template berhasil diambil",
		Data:    fields,
	})
}

// UpdateFields godoc
// @Summary      Simpan metadata field template surat
// @Tags         surat-template
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id    path  integer                          true  "ID template"
// @Param        body  body  dto.TemplateFieldsUpdateRequestDTO true  "Daftar field"
// @Success      200   {object}  helpers.HttpResponse
// @Failure      400   {object}  helpers.HttpResponse
// @Failure      401   {object}  helpers.HttpResponse
// @Failure      404   {object}  helpers.HttpResponse
// @Router       /surat-template/{id}/fields [put]
func (h *suratTemplateHandler) UpdateFields(c *gin.Context) {
	id, ok := parseIDParam(c, "ID template tidak valid")
	if !ok {
		return
	}

	var req dto.TemplateFieldsUpdateRequestDTO
	if err := c.ShouldBindJSON(&req); err != nil {
		helpers.Response(c, helpers.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: "Format request tidak valid",
		})
		return
	}

	if err := h.templateUsecase.UpdateFields(c.Request.Context(), id, req); err != nil {
		logrus.WithError(err).Error("handler.SuratTemplate.UpdateFields: failed")
		helpers.RespondError(c, err)
		return
	}

	helpers.Response(c, helpers.HttpResponse{
		Code:    http.StatusOK,
		Message: "Field template berhasil diperbarui",
	})
}
