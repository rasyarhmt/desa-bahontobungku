package usecase

import (
	"context"
	"strings"

	"github.com/rasyarhmt/desa-bahontobungku/domain"
	"github.com/rasyarhmt/desa-bahontobungku/dto"
	"github.com/rasyarhmt/desa-bahontobungku/utils"
)

type aparaturUsecase struct {
	aparaturRepo domain.AparaturRepository
}

func NewAparaturUsecase(aparaturRepo domain.AparaturRepository) AparaturUsecase {
	return &aparaturUsecase{aparaturRepo: aparaturRepo}
}

func (u *aparaturUsecase) Create(ctx context.Context, req dto.AparaturCreateRequestDTO, foto *UploadedFile) (*dto.AparaturResponseDTO, error) {
	fotoPath, err := storeAparaturPhoto(foto)
	if err != nil {
		return nil, err
	}
	committed := false
	defer func() {
		if !committed && fotoPath != "" {
			_ = utils.DeleteAparaturPhoto(fotoPath)
		}
	}()

	nama := strings.TrimSpace(req.Nama)
	jabatan := strings.TrimSpace(req.Jabatan)
	if nama == "" {
		return nil, domain.NewValidation("nama wajib diisi")
	}
	if jabatan == "" {
		return nil, domain.NewValidation("jabatan wajib diisi")
	}

	nip := strings.TrimSpace(req.Nip)
	if nip != "" {
		existing, err := u.aparaturRepo.GetByNIP(ctx, nip)
		if err != nil {
			return nil, err
		}
		if existing != nil {
			return nil, domain.NewValidation("NIP aparatur sudah terdaftar")
		}
	}

	a := &domain.Aparatur{
		Nama:    nama,
		Nip:     nip,
		Jabatan: jabatan,
		Telepon: strings.TrimSpace(req.Telepon),
		Foto:    fotoPath,
	}

	if err := u.aparaturRepo.Create(ctx, a); err != nil {
		return nil, err
	}
	committed = true
	return aparaturToDTO(a), nil
}

func (u *aparaturUsecase) GetAll(ctx context.Context) ([]dto.AparaturResponseDTO, error) {
	list, err := u.aparaturRepo.GetAll(ctx)
	if err != nil {
		return nil, err
	}
	return aparaturToDTOList(list), nil
}

func (u *aparaturUsecase) GetByID(ctx context.Context, id int) (*dto.AparaturResponseDTO, error) {
	if id <= 0 {
		return nil, domain.NewValidation("id wajib diisi")
	}
	a, err := u.aparaturRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if a == nil {
		return nil, domain.NewNotFound("aparatur tidak ditemukan")
	}
	return aparaturToDTO(a), nil
}

func (u *aparaturUsecase) GetByNIP(ctx context.Context, nip string) (*dto.AparaturResponseDTO, error) {
	nip = strings.TrimSpace(nip)
	if nip == "" {
		return nil, domain.NewValidation("NIP wajib diisi")
	}
	a, err := u.aparaturRepo.GetByNIP(ctx, nip)
	if err != nil {
		return nil, err
	}
	if a == nil {
		return nil, domain.NewNotFound("aparatur tidak ditemukan")
	}
	return aparaturToDTO(a), nil
}

func (u *aparaturUsecase) Update(ctx context.Context, id int, req dto.AparaturUpdateRequestDTO, foto *UploadedFile) error {
	if id <= 0 {
		return domain.NewValidation("id wajib diisi")
	}

	newFoto, err := storeAparaturPhoto(foto)
	if err != nil {
		return err
	}
	committed := false
	defer func() {
		if !committed && newFoto != "" {
			_ = utils.DeleteAparaturPhoto(newFoto)
		}
	}()

	existing, err := u.aparaturRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return domain.NewNotFound("aparatur tidak ditemukan")
	}

	a := &domain.Aparatur{
		ID:      existing.ID,
		Nama:    existing.Nama,
		Nip:     existing.Nip,
		Jabatan: existing.Jabatan,
		Telepon: existing.Telepon,
		Foto:    existing.Foto,
	}

	if req.Nama != nil {
		if strings.TrimSpace(*req.Nama) == "" {
			return domain.NewValidation("nama tidak boleh kosong")
		}
		a.Nama = strings.TrimSpace(*req.Nama)
	}
	if req.Jabatan != nil {
		if strings.TrimSpace(*req.Jabatan) == "" {
			return domain.NewValidation("jabatan tidak boleh kosong")
		}
		a.Jabatan = strings.TrimSpace(*req.Jabatan)
	}
	if req.Nip != nil {
		a.Nip = strings.TrimSpace(*req.Nip)
	}
	if a.Nip != existing.Nip && a.Nip != "" {
		dup, err := u.aparaturRepo.GetByNIP(ctx, a.Nip)
		if err != nil {
			return err
		}
		if dup != nil {
			return domain.NewValidation("NIP aparatur sudah terdaftar")
		}
	}
	if req.Telepon != nil {
		a.Telepon = strings.TrimSpace(*req.Telepon)
	}

	newFotoUsed := false
	if newFoto != "" {
		a.Foto = newFoto
		newFotoUsed = existing.Foto != "" && existing.Foto != a.Foto
	}

	if err := u.aparaturRepo.Update(ctx, id, a); err != nil {
		return err
	}
	committed = true

	if newFotoUsed {
		if err := utils.DeleteAparaturPhoto(existing.Foto); err != nil {
			return err
		}
	}
	return nil
}

func (u *aparaturUsecase) Delete(ctx context.Context, id int) error {
	if id <= 0 {
		return domain.NewValidation("id wajib diisi")
	}
	existing, err := u.aparaturRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return domain.NewNotFound("aparatur tidak ditemukan")
	}
	deleted, err := u.aparaturRepo.Delete(ctx, id)
	if err != nil {
		return err
	}
	if !deleted {
		return domain.NewNotFound("aparatur tidak ditemukan")
	}
	if existing.Foto != "" {
		if err := utils.DeleteAparaturPhoto(existing.Foto); err != nil {
			return err
		}
	}
	return nil
}

func aparaturToDTO(a *domain.Aparatur) *dto.AparaturResponseDTO {
	return &dto.AparaturResponseDTO{
		ID:        a.ID,
		Nama:      a.Nama,
		Nip:       a.Nip,
		Jabatan:   a.Jabatan,
		Telepon:   a.Telepon,
		Foto:      a.Foto,
		HasFoto:   a.Foto != "",
		CreatedAt: a.CreatedAt,
		UpdatedAt: a.UpdatedAt,
	}
}

func aparaturToDTOList(list []domain.Aparatur) []dto.AparaturResponseDTO {
	return mapToDTOList(list, aparaturToDTO)
}
