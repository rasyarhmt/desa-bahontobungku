package usecase

import (
	"context"
	"strconv"
	"strings"

	"github.com/rasyarhmt/desa-bahontobungku/domain"
	"github.com/rasyarhmt/desa-bahontobungku/dto"
)

type statusKeluargaUsecase struct {
	statusKeluargaRepo domain.StatusKeluargaRepository
}

func NewStatusKeluargaUsecase(statusKeluargaRepo domain.StatusKeluargaRepository) StatusKeluargaUsecase {
	return &statusKeluargaUsecase{statusKeluargaRepo: statusKeluargaRepo}
}

func normalizeNamaStatus(nama string) string {
	return strings.ToLower(strings.Join(strings.Fields(nama), " "))
}

func isReservedStatus(nama string) bool {
	return normalizeNamaStatus(nama) == domain.NamaStatusKepalaKeluarga
}

func validateNamaStatus(nama string) error {
	if normalizeNamaStatus(nama) == "" {
		return domain.NewValidation("nama status wajib diisi")
	}
	if len([]rune(nama)) > 100 {
		return domain.NewValidation("nama status maksimal 100 karakter")
	}
	return nil
}

func (u *statusKeluargaUsecase) Create(ctx context.Context, req dto.StatusKeluargaCreateRequestDTO) (*dto.StatusKeluargaResponseDTO, error) {
	if err := validateNamaStatus(req.Nama); err != nil {
		return nil, err
	}
	nama := normalizeNamaStatus(req.Nama)

	existing, err := u.statusKeluargaRepo.GetByNama(ctx, nama)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		return nil, domain.NewValidation("status keluarga dengan nama tersebut sudah ada")
	}

	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	s := &domain.StatusKeluarga{Nama: nama, IsActive: isActive}
	id, err := u.statusKeluargaRepo.Create(ctx, s)
	if err != nil {
		return nil, err
	}
	s.ID = id

	created, err := u.statusKeluargaRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if created == nil {
		return statusKeluargaToDTO(s), nil
	}
	return statusKeluargaToDTO(created), nil
}

func (u *statusKeluargaUsecase) GetAll(ctx context.Context, includeInactive bool) ([]dto.StatusKeluargaResponseDTO, error) {
	list, err := u.statusKeluargaRepo.GetAll(ctx)
	if err != nil {
		return nil, err
	}

	result := make([]dto.StatusKeluargaResponseDTO, 0, len(list))
	for i := range list {
		if !includeInactive && !list[i].IsActive {
			continue
		}
		result = append(result, *statusKeluargaToDTO(&list[i]))
	}
	return result, nil
}

func (u *statusKeluargaUsecase) GetByID(ctx context.Context, id int) (*dto.StatusKeluargaResponseDTO, error) {
	if id <= 0 {
		return nil, domain.NewValidation("id tidak valid")
	}
	s, err := u.statusKeluargaRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if s == nil {
		return nil, domain.NewNotFound("status keluarga tidak ditemukan")
	}
	return statusKeluargaToDTO(s), nil
}

func (u *statusKeluargaUsecase) Update(ctx context.Context, id int, req dto.StatusKeluargaUpdateRequestDTO) error {
	if id <= 0 {
		return domain.NewValidation("id tidak valid")
	}

	existing, err := u.statusKeluargaRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return domain.NewNotFound("status keluarga tidak ditemukan")
	}

	s := &domain.StatusKeluarga{Nama: existing.Nama, IsActive: existing.IsActive}

	if req.Nama != nil {
		if err := validateNamaStatus(*req.Nama); err != nil {
			return err
		}
		namaBaru := normalizeNamaStatus(*req.Nama)
		if namaBaru != existing.Nama {
			if isReservedStatus(existing.Nama) {
				return domain.NewValidation("nama \"" + existing.Nama + "\" tidak dapat diubah karena dipakai oleh sistem")
			}
			duplikat, err := u.statusKeluargaRepo.GetByNama(ctx, namaBaru)
			if err != nil {
				return err
			}
			if duplikat != nil && duplikat.ID != id {
				return domain.NewValidation("status keluarga dengan nama tersebut sudah ada")
			}
		}
		s.Nama = namaBaru
	}

	if req.IsActive != nil {
		if !*req.IsActive && isReservedStatus(existing.Nama) {
			return domain.NewValidation("status \"" + existing.Nama + "\" tidak dapat dinonaktifkan karena dipakai oleh sistem")
		}
		s.IsActive = *req.IsActive
	}

	return u.statusKeluargaRepo.Update(ctx, id, s)
}

func (u *statusKeluargaUsecase) Delete(ctx context.Context, id int) error {
	if id <= 0 {
		return domain.NewValidation("id tidak valid")
	}

	existing, err := u.statusKeluargaRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return domain.NewNotFound("status keluarga tidak ditemukan")
	}

	if isReservedStatus(existing.Nama) {
		return domain.NewValidation("status \"" + existing.Nama + "\" tidak dapat dihapus karena dipakai oleh sistem")
	}

	pengguna, err := u.statusKeluargaRepo.CountPengguna(ctx, id)
	if err != nil {
		return err
	}
	if pengguna > 0 {
		return domain.NewValidation("status keluarga masih digunakan oleh " + strconv.Itoa(pengguna) + " penduduk")
	}

	deleted, err := u.statusKeluargaRepo.Delete(ctx, id)
	if err != nil {
		return err
	}
	if !deleted {
		return domain.NewNotFound("status keluarga tidak ditemukan")
	}
	return nil
}

func (u *statusKeluargaUsecase) ToggleActive(ctx context.Context, id int) error {
	if id <= 0 {
		return domain.NewValidation("id tidak valid")
	}

	existing, err := u.statusKeluargaRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return domain.NewNotFound("status keluarga tidak ditemukan")
	}

	if existing.IsActive && isReservedStatus(existing.Nama) {
		return domain.NewValidation("status \"" + existing.Nama + "\" tidak dapat dinonaktifkan karena dipakai oleh sistem")
	}

	_, err = u.statusKeluargaRepo.ToggleActive(ctx, id)
	return err
}

func statusKeluargaToDTO(s *domain.StatusKeluarga) *dto.StatusKeluargaResponseDTO {
	return &dto.StatusKeluargaResponseDTO{
		ID:        s.ID,
		Nama:      s.Nama,
		IsActive:  s.IsActive,
		CreatedAt: s.CreatedAt,
		UpdatedAt: s.UpdatedAt,
	}
}
