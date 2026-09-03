package usecase

import (
	"context"
	"errors"
	"strings"

	"github.com/rasyarhmt/desa-bahontobungku/domain"
	"github.com/rasyarhmt/desa-bahontobungku/dto"
	"github.com/rasyarhmt/desa-bahontobungku/utils"
)

type suratTemplateUsecase struct {
	templateRepo domain.SuratTemplateRepository
}

func NewSuratTemplateUsecase(templateRepo domain.SuratTemplateRepository) domain.SuratTemplateUsecase {
	return &suratTemplateUsecase{templateRepo: templateRepo}
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
		return errors.New("status tidak valid, gunakan 'aktif' or 'nonaktif'")
	}
	return nil
}

func (u *suratTemplateUsecase) Create(ctx context.Context, req dto.SuratTemplateCreateRequestDTO) error {
	if strings.TrimSpace(req.Kode) == "" {
		return errors.New("kode wajib diisi")
	}
	if strings.TrimSpace(req.NamaTemplate) == "" {
		return errors.New("nama_template wajib diisi")
	}
	if strings.TrimSpace(req.FileTemplate) == "" {
		return errors.New("file_template wajib diupload")
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
		return errors.New("kode template sudah digunakan")
	}

	t := &domain.SuratTemplate{
		Kode:         strings.TrimSpace(req.Kode),
		NamaTemplate: req.NamaTemplate,
		FileTemplate: req.FileTemplate,
		Deskripsi:    req.Deskripsi,
		Status:       status,
	}
	_, err = u.templateRepo.Create(ctx, t)
	return err
}

func (u *suratTemplateUsecase) GetAll(ctx context.Context) ([]dto.SuratTemplateResponseDTO, error) {
	list, err := u.templateRepo.GetAll(ctx)
	if err != nil {
		return nil, err
	}
	result := make([]dto.SuratTemplateResponseDTO, 0, len(list))
	for i := range list {
		result = append(result, *templateToDTO(&list[i]))
	}
	return result, nil
}

func (u *suratTemplateUsecase) GetByID(ctx context.Context, id int) (*dto.SuratTemplateResponseDTO, error) {
	if id <= 0 {
		return nil, errors.New("id wajib diisi")
	}
	t, err := u.templateRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if t == nil {
		return nil, errors.New("template tidak ditemukan")
	}
	return templateToDTO(t), nil
}

func (u *suratTemplateUsecase) Update(ctx context.Context, id int, req dto.SuratTemplateUpdateRequestDTO) error {
	if id <= 0 {
		return errors.New("id wajib diisi")
	}

	existing, err := u.templateRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("template tidak ditemukan")
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
	if req.FileTemplate != nil {
		t.FileTemplate = *req.FileTemplate
		newFileUsed = *req.FileTemplate != existing.FileTemplate
	}
	if req.Deskripsi != nil {
		t.Deskripsi = *req.Deskripsi
	}

	if err := u.templateRepo.Update(ctx, id, t); err != nil {
		if newFileUsed {
			_ = utils.DeleteEncryptedFile(t.FileTemplate)
		}
		return err
	}

	if newFileUsed {
		if err := utils.DeleteEncryptedFile(existing.FileTemplate); err != nil {
			return err
		}
	}

	return nil
}

func (u *suratTemplateUsecase) Delete(ctx context.Context, id int) error {
	if id <= 0 {
		return errors.New("id wajib diisi")
	}

	existing, err := u.templateRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("template tidak ditemukan")
	}

	deleted, err := u.templateRepo.Delete(ctx, id)
	if err != nil {
		return err
	}
	if !deleted {
		return errors.New("template tidak ditemukan")
	}

	if err := utils.DeleteEncryptedFile(existing.FileTemplate); err != nil {
		return err
	}
	return nil
}

func (u *suratTemplateUsecase) ToggleStatus(ctx context.Context, id int) error {
	if id <= 0 {
		return errors.New("id wajib diisi")
	}
	existing, err := u.templateRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("template tidak ditemukan")
	}

	newStatus := domain.TemplateStatusAktif
	if existing.Status == domain.TemplateStatusAktif {
		newStatus = domain.TemplateStatusNonaktif
	}
	return u.templateRepo.UpdateStatus(ctx, id, newStatus)
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
