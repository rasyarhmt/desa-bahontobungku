package usecase

import (
	"context"
	"strings"

	"github.com/rasyarhmt/desa-bahontobungku/domain"
	"github.com/rasyarhmt/desa-bahontobungku/dto"
	"github.com/rasyarhmt/desa-bahontobungku/utils"
)

type pelayananUsecase struct {
	pelayananRepo domain.PelayananRepository
	templateRepo  domain.SuratTemplateRepository
	fieldRepo     domain.SuratTemplateFieldRepository
}

func NewPelayananUsecase(
	pelayananRepo domain.PelayananRepository,
	templateRepo domain.SuratTemplateRepository,
	fieldRepo domain.SuratTemplateFieldRepository,
) PelayananUsecase {
	return &pelayananUsecase{
		pelayananRepo: pelayananRepo,
		templateRepo:  templateRepo,
		fieldRepo:     fieldRepo,
	}
}

var validPelayananStatus = map[string]bool{
	domain.PelayananStatusAktif:    true,
	domain.PelayananStatusNonaktif: true,
}

func validatePelayananStatus(status string) error {
	if status == "" {
		return nil
	}
	if !validPelayananStatus[status] {
		return domain.NewValidation("status tidak valid, gunakan 'aktif' or 'nonaktif'")
	}
	return nil
}

func (u *pelayananUsecase) validateTemplateExists(ctx context.Context, id int) error {
	if id <= 0 {
		return domain.NewValidation("id_surat_template tidak valid")
	}
	t, err := u.templateRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if t == nil {
		return domain.NewNotFound("template surat tidak ditemukan")
	}
	return nil
}

func (u *pelayananUsecase) Create(ctx context.Context, req dto.PelayananCreateRequestDTO) error {
	if strings.TrimSpace(req.NamaLayanan) == "" {
		return domain.NewValidation("nama_layanan wajib diisi")
	}
	if strings.TrimSpace(req.Deskripsi) == "" {
		return domain.NewValidation("deskripsi wajib diisi")
	}
	if err := validatePelayananStatus(req.Status); err != nil {
		return err
	}
	if req.IDSuratTemplate <= 0 {
		return domain.NewValidation("template surat wajib dipilih")
	}
	if err := u.validateTemplateExists(ctx, req.IDSuratTemplate); err != nil {
		return err
	}

	status := strings.TrimSpace(req.Status)
	if status == "" {
		status = domain.PelayananStatusAktif
	}

	p := &domain.Pelayanan{
		NamaLayanan:     strings.TrimSpace(req.NamaLayanan),
		Deskripsi:       strings.TrimSpace(req.Deskripsi),
		IDSuratTemplate: req.IDSuratTemplate,
		Status:          status,
	}
	_, err := u.pelayananRepo.Create(ctx, p)
	return err
}

func (u *pelayananUsecase) GetAll(ctx context.Context) ([]dto.PelayananResponseDTO, error) {
	list, err := u.pelayananRepo.GetAll(ctx)
	if err != nil {
		return nil, err
	}
	return mapToDTOList(list, pelayananToDTO), nil
}

func (u *pelayananUsecase) GetByID(ctx context.Context, id int) (*dto.PelayananResponseDTO, error) {
	if id <= 0 {
		return nil, domain.NewValidation("id wajib diisi")
	}
	p, err := u.pelayananRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if p == nil {
		return nil, domain.NewNotFound("pelayanan tidak ditemukan")
	}
	return pelayananToDTO(p), nil
}

// GetTemplateFields mengekstrak key placeholder {{ key }} dari file template
// DOCX milik pelayanan. Key bawaan (nama_pemohon, nik_pemohon) dikeluarkan
// karena selalu wajib diisi lewat form warga. Urutan sesuai kemunculan.
func (u *pelayananUsecase) GetTemplateFields(
	ctx context.Context,
	id int,
) ([]dto.TemplateFieldDTO, error) {
	if id <= 0 {
		return nil, domain.NewValidation("id wajib diisi")
	}

	p, err := u.pelayananRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if p == nil {
		return nil, domain.NewNotFound("pelayanan tidak ditemukan")
	}
	if p.IDSuratTemplate <= 0 {
		return []dto.TemplateFieldDTO{}, nil
	}

	tpl, err := u.templateRepo.GetByID(ctx, p.IDSuratTemplate)
	if err != nil {
		return nil, err
	}
	if tpl == nil {
		return nil, domain.NewNotFound("template surat tidak ditemukan")
	}

	templateBytes, err := utils.DecryptFileContent(tpl.FileTemplate)
	if err != nil {
		return nil, domain.NewInternal("Gagal membaca template surat terenkripsi", err)
	}

	fields, err := ensureTemplateFields(ctx, tpl.ID, templateBytes, u.fieldRepo)
	if err != nil {
		return nil, err
	}
	return templateFieldsToDTO(fields), nil
}

func (u *pelayananUsecase) Update(ctx context.Context, id int, req dto.PelayananUpdateRequestDTO) error {
	if id <= 0 {
		return domain.NewValidation("id wajib diisi")
	}

	existing, err := u.pelayananRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return domain.NewNotFound("pelayanan tidak ditemukan")
	}

	if req.IDSuratTemplate != nil {
		if err := u.validateTemplateExists(ctx, *req.IDSuratTemplate); err != nil {
			return err
		}
	}

	p := &domain.Pelayanan{
		NamaLayanan:     existing.NamaLayanan,
		Deskripsi:       existing.Deskripsi,
		IDSuratTemplate: existing.IDSuratTemplate,
	}

	if req.NamaLayanan != nil {
		p.NamaLayanan = *req.NamaLayanan
	}
	if req.Deskripsi != nil {
		p.Deskripsi = *req.Deskripsi
	}
	if req.IDSuratTemplate != nil {
		p.IDSuratTemplate = *req.IDSuratTemplate
	}

	return u.pelayananRepo.Update(ctx, id, p)
}

func (u *pelayananUsecase) Delete(ctx context.Context, id int) error {
	if id <= 0 {
		return domain.NewValidation("id wajib diisi")
	}

	deleted, err := u.pelayananRepo.Delete(ctx, id)
	if err != nil {
		return err
	}
	if !deleted {
		return domain.NewNotFound("pelayanan tidak ditemukan")
	}
	return nil
}

func (u *pelayananUsecase) ToggleStatus(ctx context.Context, id int) error {
	if id <= 0 {
		return domain.NewValidation("id wajib diisi")
	}
	existing, err := u.pelayananRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return domain.NewNotFound("pelayanan tidak ditemukan")
	}

	newStatus := domain.PelayananStatusAktif
	if existing.Status == domain.PelayananStatusAktif {
		newStatus = domain.PelayananStatusNonaktif
	}
	return u.pelayananRepo.UpdateStatus(ctx, id, newStatus)
}

func pelayananToDTO(p *domain.Pelayanan) *dto.PelayananResponseDTO {
	return &dto.PelayananResponseDTO{
		ID:              p.ID,
		NamaLayanan:     p.NamaLayanan,
		Deskripsi:       p.Deskripsi,
		IDSuratTemplate: p.IDSuratTemplate,
		Status:          p.Status,
		CreatedAt:       p.CreatedAt,
		UpdatedAt:       p.UpdatedAt,
	}
}
