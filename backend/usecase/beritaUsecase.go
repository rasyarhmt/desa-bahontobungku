package usecase

import (
	"context"
	"strings"
	"time"

	"github.com/rasyarhmt/desa-bahontobungku/domain"
	"github.com/rasyarhmt/desa-bahontobungku/dto"
	"github.com/rasyarhmt/desa-bahontobungku/utils"
)

var validBeritaStatus = map[string]bool{
	domain.BeritaStatusDraft:       true,
	domain.BeritaStatusDipublikasi: true,
}

func parseBeritaTanggal(value string) (time.Time, error) {
	return parseSuratDate(value)
}

type beritaUsecase struct {
	beritaRepo domain.BeritaRepository
}

func NewBeritaUsecase(beritaRepo domain.BeritaRepository) BeritaUsecase {
	return &beritaUsecase{beritaRepo: beritaRepo}
}

func (u *beritaUsecase) Create(ctx context.Context, req dto.BeritaCreateRequestDTO, foto *UploadedFile) (*dto.BeritaResponseDTO, error) {
	fotoPath, err := storeBeritaPhoto(foto)
	if err != nil {
		return nil, err
	}
	committed := false
	defer func() {
		if !committed && fotoPath != "" {
			_ = utils.DeleteBeritaImage(fotoPath)
		}
	}()

	if strings.TrimSpace(req.Judul) == "" {
		return nil, domain.NewValidation("judul wajib diisi")
	}
	if strings.TrimSpace(req.Isi) == "" {
		return nil, domain.NewValidation("isi wajib diisi")
	}
	if strings.TrimSpace(req.Penulis) == "" {
		return nil, domain.NewValidation("penulis wajib diisi")
	}
	if strings.TrimSpace(req.TanggalTerbit) == "" {
		return nil, domain.NewValidation("tanggalTerbit wajib diisi")
	}
	tanggal, err := parseBeritaTanggal(req.TanggalTerbit)
	if err != nil {
		return nil, err
	}

	status := strings.ToLower(strings.TrimSpace(req.Status))
	if status == "" {
		status = domain.BeritaStatusDraft
	}
	if !validBeritaStatus[status] {
		return nil, domain.NewValidation("status tidak valid")
	}

	b := &domain.Berita{
		Foto:          fotoPath,
		Judul:         strings.TrimSpace(req.Judul),
		Isi:           req.Isi,
		TanggalTerbit: tanggal,
		Penulis:       strings.TrimSpace(req.Penulis),
		Status:        status,
	}

	if err := u.beritaRepo.Create(ctx, b); err != nil {
		return nil, err
	}
	committed = true
	return beritaToDTO(b), nil
}

func (u *beritaUsecase) GetAll(ctx context.Context) ([]dto.BeritaResponseDTO, error) {
	list, err := u.beritaRepo.GetPublished(ctx)
	if err != nil {
		return nil, err
	}
	return beritaToDTOList(list), nil
}

func (u *beritaUsecase) GetAllAdmin(ctx context.Context) ([]dto.BeritaResponseDTO, error) {
	list, err := u.beritaRepo.GetAll(ctx)
	if err != nil {
		return nil, err
	}
	return beritaToDTOList(list), nil
}

func (u *beritaUsecase) GetByStatus(ctx context.Context, status string) ([]dto.BeritaResponseDTO, error) {
	status = strings.ToLower(strings.TrimSpace(status))
	// Publik hanya boleh melihat berita yang dipublikasi
	if status != domain.BeritaStatusDipublikasi {
		return []dto.BeritaResponseDTO{}, nil
	}
	list, err := u.beritaRepo.GetPublished(ctx)
	if err != nil {
		return nil, err
	}
	return beritaToDTOList(list), nil
}

func (u *beritaUsecase) GetByID(ctx context.Context, id int) (*dto.BeritaResponseDTO, error) {
	if id <= 0 {
		return nil, domain.NewValidation("id wajib diisi")
	}
	b, err := u.beritaRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if b == nil || b.Status != domain.BeritaStatusDipublikasi {
		return nil, domain.NewNotFound("berita tidak ditemukan")
	}
	return beritaToDTO(b), nil
}

func (u *beritaUsecase) GetByIDAdmin(ctx context.Context, id int) (*dto.BeritaResponseDTO, error) {
	if id <= 0 {
		return nil, domain.NewValidation("id wajib diisi")
	}
	b, err := u.beritaRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if b == nil {
		return nil, domain.NewNotFound("berita tidak ditemukan")
	}
	return beritaToDTO(b), nil
}

func (u *beritaUsecase) Update(ctx context.Context, id int, req dto.BeritaUpdateRequestDTO, foto *UploadedFile) error {
	if id <= 0 {
		return domain.NewValidation("id wajib diisi")
	}

	newFoto, err := storeBeritaPhoto(foto)
	if err != nil {
		return err
	}
	committed := false
	defer func() {
		if !committed && newFoto != "" {
			_ = utils.DeleteBeritaImage(newFoto)
		}
	}()

	existing, err := u.beritaRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return domain.NewNotFound("berita tidak ditemukan")
	}

	b := &domain.Berita{
		ID:            existing.ID,
		Foto:          existing.Foto,
		Judul:         existing.Judul,
		Isi:           existing.Isi,
		TanggalTerbit: existing.TanggalTerbit,
		Penulis:       existing.Penulis,
		Status:        existing.Status,
	}

	if req.Judul != nil {
		if strings.TrimSpace(*req.Judul) == "" {
			return domain.NewValidation("judul tidak boleh kosong")
		}
		b.Judul = strings.TrimSpace(*req.Judul)
	}
	if req.Isi != nil {
		if strings.TrimSpace(*req.Isi) == "" {
			return domain.NewValidation("isi tidak boleh kosong")
		}
		b.Isi = *req.Isi
	}
	if req.Penulis != nil {
		if strings.TrimSpace(*req.Penulis) == "" {
			return domain.NewValidation("penulis tidak boleh kosong")
		}
		b.Penulis = strings.TrimSpace(*req.Penulis)
	}
	if req.TanggalTerbit != nil {
		tanggal, err := parseBeritaTanggal(*req.TanggalTerbit)
		if err != nil {
			return err
		}
		b.TanggalTerbit = tanggal
	}
	if req.Status != nil {
		status := strings.ToLower(strings.TrimSpace(*req.Status))
		if !validBeritaStatus[status] {
			return domain.NewValidation("status tidak valid")
		}
		b.Status = status
	}

	// Penanganan foto: prioritas foto baru > deleteFoto > pertahankan foto lama
	newFotoUsed := false
	if req.DeleteFoto && existing.Foto != "" {
		b.Foto = ""
	}
	if newFoto != "" {
		b.Foto = newFoto
		newFotoUsed = existing.Foto != "" && existing.Foto != b.Foto
	}

	if err := u.beritaRepo.Update(ctx, id, b); err != nil {
		return err
	}
	committed = true

	if newFotoUsed {
		if err := utils.DeleteBeritaImage(existing.Foto); err != nil {
			return err
		}
	}
	if req.DeleteFoto && existing.Foto != "" && !newFotoUsed {
		if err := utils.DeleteBeritaImage(existing.Foto); err != nil {
			return err
		}
	}

	return nil
}

func (u *beritaUsecase) ToggleStatus(ctx context.Context, id int) (*dto.BeritaResponseDTO, error) {
	if id <= 0 {
		return nil, domain.NewValidation("id wajib diisi")
	}
	b, err := u.beritaRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if b == nil {
		return nil, domain.NewNotFound("berita tidak ditemukan")
	}

	if b.Status == domain.BeritaStatusDipublikasi {
		b.Status = domain.BeritaStatusDraft
	} else {
		b.Status = domain.BeritaStatusDipublikasi
	}

	if err := u.beritaRepo.Update(ctx, id, b); err != nil {
		return nil, err
	}
	return beritaToDTO(b), nil
}

func (u *beritaUsecase) Delete(ctx context.Context, id int) error {
	if id <= 0 {
		return domain.NewValidation("id wajib diisi")
	}

	existing, err := u.beritaRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return domain.NewNotFound("berita tidak ditemukan")
	}

	deleted, err := u.beritaRepo.Delete(ctx, id)
	if err != nil {
		return err
	}
	if !deleted {
		return domain.NewNotFound("berita tidak ditemukan")
	}

	if existing.Foto != "" {
		if err := utils.DeleteBeritaImage(existing.Foto); err != nil {
			return err
		}
	}
	return nil
}

func beritaToDTO(b *domain.Berita) *dto.BeritaResponseDTO {
	return &dto.BeritaResponseDTO{
		ID:            b.ID,
		Foto:          b.Foto,
		HasFoto:       b.Foto != "",
		Judul:         b.Judul,
		Isi:           b.Isi,
		TanggalTerbit: b.TanggalTerbit,
		Penulis:       b.Penulis,
		Status:        b.Status,
		CreatedAt:     b.CreatedAt,
		UpdatedAt:     b.UpdatedAt,
	}
}

func beritaToDTOList(list []domain.Berita) []dto.BeritaResponseDTO {
	return mapToDTOList(list, beritaToDTO)
}
