package usecase

import (
	"context"
	"strings"

	"github.com/rasyarhmt/desa-bahontobungku/domain"
	"github.com/rasyarhmt/desa-bahontobungku/dto"
	"github.com/rasyarhmt/desa-bahontobungku/utils"
)

type suratTemplateUsecase struct {
	templateRepo domain.SuratTemplateRepository
	fieldRepo    domain.SuratTemplateFieldRepository
}

func NewSuratTemplateUsecase(
	templateRepo domain.SuratTemplateRepository,
	fieldRepo domain.SuratTemplateFieldRepository,
) SuratTemplateUsecase {
	return &suratTemplateUsecase{
		templateRepo: templateRepo,
		fieldRepo:    fieldRepo,
	}
}

var validTemplateStatus = map[string]bool{
	domain.TemplateStatusAktif:    true,
	domain.TemplateStatusNonaktif: true,
}

func validateTemplateStatus(status string) error {
	if status == "" {
		return nil
	}
	if !validTemplateStatus[status] {
		return domain.NewValidation("status tidak valid, gunakan 'aktif' or 'nonaktif'")
	}
	return nil
}

func (u *suratTemplateUsecase) Create(ctx context.Context, req dto.SuratTemplateCreateRequestDTO, file *UploadedFile) error {
	relPath, err := storeTemplate(file, true)
	if err != nil {
		return err
	}
	committed := false
	defer func() {
		if !committed && relPath != "" {
			_ = utils.DeleteEncryptedFile(relPath)
		}
	}()
	req.FileTemplate = relPath

	if strings.TrimSpace(req.Kode) == "" {
		return domain.NewValidation("kode wajib diisi")
	}
	if strings.TrimSpace(req.NamaTemplate) == "" {
		return domain.NewValidation("nama_template wajib diisi")
	}
	if err := validateTemplateStatus(req.Status); err != nil {
		return err
	}

	status := strings.TrimSpace(req.Status)
	if status == "" {
		status = domain.TemplateStatusAktif
	}

	existing, err := u.templateRepo.GetByKode(ctx, strings.TrimSpace(req.Kode))
	if err != nil {
		return err
	}
	if existing != nil {
		return domain.NewValidation("kode template sudah digunakan")
	}

	t := &domain.SuratTemplate{
		Kode:         strings.TrimSpace(req.Kode),
		NamaTemplate: req.NamaTemplate,
		FileTemplate: req.FileTemplate,
		Deskripsi:    req.Deskripsi,
		Status:       status,
	}
	templateID, err := u.templateRepo.Create(ctx, t)
	if err != nil {
		return err
	}
	if _, err := ensureTemplateFields(ctx, templateID, file.Content, u.fieldRepo); err != nil {
		_, _ = u.templateRepo.Delete(ctx, templateID)
		return err
	}
	committed = true
	return nil
}

func (u *suratTemplateUsecase) GetAll(ctx context.Context) ([]dto.SuratTemplateResponseDTO, error) {
	list, err := u.templateRepo.GetAll(ctx)
	if err != nil {
		return nil, err
	}
	return mapToDTOList(list, templateToDTO), nil
}

func (u *suratTemplateUsecase) GetByID(ctx context.Context, id int) (*dto.SuratTemplateResponseDTO, error) {
	if id <= 0 {
		return nil, domain.NewValidation("id wajib diisi")
	}
	t, err := u.templateRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if t == nil {
		return nil, domain.NewNotFound("template tidak ditemukan")
	}
	return templateToDTO(t), nil
}

func (u *suratTemplateUsecase) Update(ctx context.Context, id int, req dto.SuratTemplateUpdateRequestDTO, file *UploadedFile) error {
	if id <= 0 {
		return domain.NewValidation("id wajib diisi")
	}

	newFile, err := storeTemplate(file, false)
	if err != nil {
		return err
	}
	committed := false
	defer func() {
		if !committed && newFile != "" {
			_ = utils.DeleteEncryptedFile(newFile)
		}
	}()
	if newFile != "" {
		req.FileTemplate = &newFile
	}

	existing, err := u.templateRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return domain.NewNotFound("template tidak ditemukan")
	}

	t := &domain.SuratTemplate{
		Kode:         existing.Kode,
		NamaTemplate: existing.NamaTemplate,
		FileTemplate: existing.FileTemplate,
		Deskripsi:    existing.Deskripsi,
	}

	if req.Kode != nil {
		t.Kode = *req.Kode
	}

	if req.NamaTemplate != nil {
		t.NamaTemplate = *req.NamaTemplate
	}

	newFileUsed := false
	if req.FileTemplate != nil && strings.TrimSpace(*req.FileTemplate) != "" {
		t.FileTemplate = strings.TrimSpace(*req.FileTemplate)
		newFileUsed = *req.FileTemplate != existing.FileTemplate
	}
	if req.Deskripsi != nil {
		t.Deskripsi = *req.Deskripsi
	}

	if err := u.templateRepo.Update(ctx, id, t); err != nil {
		return err
	}
	committed = true

	if newFileUsed {
		if err := utils.DeleteEncryptedFile(existing.FileTemplate); err != nil {
			return err
		}
	}

	if newFileUsed && file != nil {
		if _, err := ensureTemplateFields(ctx, id, file.Content, u.fieldRepo); err != nil {
			return err
		}
	}

	return nil
}

func (u *suratTemplateUsecase) Delete(ctx context.Context, id int) error {
	if id <= 0 {
		return domain.NewValidation("id wajib diisi")
	}

	existing, err := u.templateRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return domain.NewNotFound("template tidak ditemukan")
	}

	deleted, err := u.templateRepo.Delete(ctx, id)
	if err != nil {
		return err
	}
	if !deleted {
		return domain.NewNotFound("template tidak ditemukan")
	}

	if err := utils.DeleteEncryptedFile(existing.FileTemplate); err != nil {
		return err
	}
	return nil
}

func (u *suratTemplateUsecase) ToggleStatus(ctx context.Context, id int) error {
	if id <= 0 {
		return domain.NewValidation("id wajib diisi")
	}
	existing, err := u.templateRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return domain.NewNotFound("template tidak ditemukan")
	}

	newStatus := domain.TemplateStatusAktif
	if existing.Status == domain.TemplateStatusAktif {
		newStatus = domain.TemplateStatusNonaktif
	}
	return u.templateRepo.UpdateStatus(ctx, id, newStatus)
}

func (u *suratTemplateUsecase) GetFields(
	ctx context.Context,
	id int,
) ([]dto.TemplateFieldDTO, error) {
	if id <= 0 {
		return nil, domain.NewValidation("id wajib diisi")
	}

	t, err := u.templateRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if t == nil {
		return nil, domain.NewNotFound("template tidak ditemukan")
	}

	content, err := utils.DecryptFileContent(t.FileTemplate)
	if err != nil {
		return nil, domain.NewInternal("Gagal membaca template surat terenkripsi", err)
	}

	fields, err := ensureTemplateFields(ctx, id, content, u.fieldRepo)
	if err != nil {
		return nil, err
	}
	return templateFieldsToDTO(fields), nil
}

func (u *suratTemplateUsecase) UpdateFields(
	ctx context.Context,
	id int,
	req dto.TemplateFieldsUpdateRequestDTO,
) error {
	if id <= 0 {
		return domain.NewValidation("id wajib diisi")
	}

	t, err := u.templateRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if t == nil {
		return domain.NewNotFound("template tidak ditemukan")
	}

	content, err := utils.DecryptFileContent(t.FileTemplate)
	if err != nil {
		return domain.NewInternal("Gagal membaca template surat terenkripsi", err)
	}
	placeholders, err := utils.ExtractDOCXPlaceholders(content)
	if err != nil {
		return err
	}

	allowed := make(map[string]bool)
	for _, raw := range placeholders {
		key := strings.TrimSpace(raw)
		if key == "" || isBuiltinTemplateFieldKey(key) {
			continue
		}
		allowed[key] = true
	}
	if len(allowed) == 0 {
		return domain.NewValidation("template tidak memiliki field yang dapat dikonfigurasi")
	}

	seen := make(map[string]bool, len(req.Fields))
	fields := make([]domain.SuratTemplateField, 0, len(req.Fields))
	for i, item := range req.Fields {
		key := strings.TrimSpace(item.Key)
		if key == "" {
			return domain.NewValidation("key field wajib diisi")
		}
		if err := validateFieldKeyLength(key); err != nil {
			return err
		}
		if !allowed[key] {
			return domain.NewValidation("field " + key + " tidak ada di template")
		}
		if seen[key] {
			return domain.NewValidation("field " + key + " duplikat")
		}
		seen[key] = true

		label := strings.TrimSpace(item.Label)
		if label == "" {
			return domain.NewValidation("label field " + key + " wajib diisi")
		}

		tipe := strings.TrimSpace(item.Tipe)
		if !domain.ValidFieldTipe[tipe] {
			return domain.NewValidation("tipe field " + key + " tidak valid")
		}

		options := make([]string, 0, len(item.Options))
		for _, opt := range item.Options {
			opt = strings.TrimSpace(opt)
			if opt != "" {
				options = append(options, opt)
			}
		}
		if tipe == domain.FieldTipeSelect && len(options) == 0 {
			return domain.NewValidation("options field " + key + " wajib diisi")
		}

		required := true
		if item.Required != nil {
			required = *item.Required
		}
		urutan := item.Urutan
		if urutan <= 0 {
			urutan = i + 1
		}

		fields = append(fields, domain.SuratTemplateField{
			IDTemplate: id,
			FieldKey:   key,
			Label:      label,
			Tipe:       tipe,
			Options:    options,
			Required:   required,
			Urutan:     urutan,
		})
	}

	if len(seen) != len(allowed) {
		return domain.NewValidation("semua field template harus dikonfigurasi")
	}
	return u.fieldRepo.SyncFields(ctx, id, fields)
}

// Preview menghasilkan PDF dari file template DOCX (placeholder tetap tampil)
// agar admin dapat melihat isi template sebelum dipakai warga.
func (u *suratTemplateUsecase) Preview(ctx context.Context, id int) ([]byte, string, error) {
	if id <= 0 {
		return nil, "", domain.NewValidation("id wajib diisi")
	}

	t, err := u.templateRepo.GetByID(ctx, id)
	if err != nil {
		return nil, "", err
	}
	if t == nil {
		return nil, "", domain.NewNotFound("template tidak ditemukan")
	}

	content, err := utils.DecryptFileContent(t.FileTemplate)
	if err != nil {
		return nil, "", domain.NewInternal("Gagal membaca template surat terenkripsi", err)
	}

	pdfBytes, err := utils.DOCXToPDF(content)
	if err != nil {
		return nil, "", domain.NewInternal("Gagal membuat preview template surat", err)
	}

	filename := "template-surat.pdf"
	if strings.TrimSpace(t.Kode) != "" {
		filename = "template-" + t.Kode + ".pdf"
	}
	return pdfBytes, filename, nil
}

func templateToDTO(t *domain.SuratTemplate) *dto.SuratTemplateResponseDTO {
	return &dto.SuratTemplateResponseDTO{
		ID:           t.ID,
		Kode:         t.Kode,
		NamaTemplate: t.NamaTemplate,
		FileTemplate: t.FileTemplate,
		Deskripsi:    t.Deskripsi,
		Status:       t.Status,
		CreatedAt:    t.CreatedAt,
		UpdatedAt:    t.UpdatedAt,
	}
}
