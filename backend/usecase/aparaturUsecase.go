package usecase

import (
	"context"
	"errors"
	"strings"

	"github.com/rasyarhmt/desa-bahontobungku/domain"
	"github.com/rasyarhmt/desa-bahontobungku/dto"
	"github.com/rasyarhmt/desa-bahontobungku/utils"
)

type aparaturUsecase struct {
	aparaturRepo domain.AparaturRepository
}

func NewAparaturUsecase(aparaturRepo domain.AparaturRepository) domain.AparaturUsecase {
	return &aparaturUsecase{aparaturRepo: aparaturRepo}
}

func (u *aparaturUsecase) Create(ctx context.Context, req dto.AparaturCreateRequestDTO) (*dto.AparaturResponseDTO, error) {
	nama := strings.TrimSpace(req.Nama)
	jabatan := strings.TrimSpace(req.Jabatan)
	if nama == "" {
		return nil, errors.New("nama wajib diisi")
	}
	if jabatan == "" {
		return nil, errors.New("jabatan wajib diisi")
	}

	nip := strings.TrimSpace(req.Nip)
	if nip != "" {
		existing, err := u.aparaturRepo.GetByNIP(ctx, nip)
		if err != nil {
			return nil, err
		}
		if existing != nil {
			return nil, errors.New("NIP aparatur sudah terdaftar")
		}
	}

	a := &domain.Aparatur{
		Nama:    nama,
		Nip:     nip,
		Jabatan: jabatan,
		Telepon: strings.TrimSpace(req.Telepon),
		Foto:    strings.TrimSpace(req.Foto),
	}

	if err := u.aparaturRepo.Create(ctx, a); err != nil {
		return nil, err
	}
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
		return nil, errors.New("id wajib diisi")
	}
	a, err := u.aparaturRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if a == nil {
		return nil, errors.New("aparatur tidak ditemukan")
	}
	return aparaturToDTO(a), nil
}

func (u *aparaturUsecase) GetByNIP(ctx context.Context, nip string) (*dto.AparaturResponseDTO, error) {
	nip = strings.TrimSpace(nip)
	if nip == "" {
		return nil, errors.New("NIP wajib diisi")
	}
	a, err := u.aparaturRepo.GetByNIP(ctx, nip)
	if err != nil {
		return nil, err
	}
	if a == nil {
		return nil, errors.New("aparatur tidak ditemukan")
	}
	return aparaturToDTO(a), nil
}

func (u *aparaturUsecase) Update(ctx context.Context, id int, req dto.AparaturUpdateRequestDTO) error {
	if id <= 0 {
		return errors.New("id wajib diisi")
	}

	existing, err := u.aparaturRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("aparatur tidak ditemukan")
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
			return errors.New("nama tidak boleh kosong")
		}
		a.Nama = strings.TrimSpace(*req.Nama)
	}
	if req.Jabatan != nil {
		if strings.TrimSpace(*req.Jabatan) == "" {
			return errors.New("jabatan tidak boleh kosong")
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
			return errors.New("NIP aparatur sudah terdaftar")
		}
	}
	if req.Telepon != nil {
		a.Telepon = strings.TrimSpace(*req.Telepon)
	}

	newFotoUsed := false
	if req.Foto != nil && strings.TrimSpace(*req.Foto) != "" {
		a.Foto = strings.TrimSpace(*req.Foto)
		newFotoUsed = existing.Foto != "" && existing.Foto != a.Foto
	}

	if err := u.aparaturRepo.Update(ctx, id, a); err != nil {
		if newFotoUsed {
			_ = utils.DeleteAparaturPhoto(a.Foto)
		}
		return err
	}

	if newFotoUsed {
		if err := utils.DeleteAparaturPhoto(existing.Foto); err != nil {
			return err
		}
	}
	return nil
}

func (u *aparaturUsecase) Delete(ctx context.Context, id int) error {
	if id <= 0 {
		return errors.New("id wajib diisi")
	}
	existing, err := u.aparaturRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("aparatur tidak ditemukan")
	}
	deleted, err := u.aparaturRepo.Delete(ctx, id)
	if err != nil {
		return err
	}
	if !deleted {
		return errors.New("aparatur tidak ditemukan")
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
	result := make([]dto.AparaturResponseDTO, 0, len(list))
	for i := range list {
		result = append(result, *aparaturToDTO(&list[i]))
	}
	return result
}
