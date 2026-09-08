package usecase

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/rasyarhmt/desa-bahontobungku/domain"
	"github.com/rasyarhmt/desa-bahontobungku/dto"
)

func parsePengumumanTanggal(value string) (time.Time, error) {
	return parseSuratDate(value)
}

type pengumumanUsecase struct {
	pengumumanRepo domain.PengumumanRepository
}

func NewPengumumanUsecase(pengumumanRepo domain.PengumumanRepository) domain.PengumumanUsecase {
	return &pengumumanUsecase{pengumumanRepo: pengumumanRepo}
}

func (u *pengumumanUsecase) Create(ctx context.Context, req dto.PengumumanCreateRequestDTO) (*dto.PengumumanResponseDTO, error) {
	judul := strings.TrimSpace(req.Judul)
	isi := strings.TrimSpace(req.Isi)
	tanggalMulai := strings.TrimSpace(req.TanggalMulai)
	tanggalSelesai := strings.TrimSpace(req.TanggalSelesai)

	if judul == "" {
		return nil, errors.New("judul wajib diisi")
	}
	if isi == "" {
		return nil, errors.New("isi wajib diisi")
	}
	mulai, err := parsePengumumanTanggal(tanggalMulai)
	if err != nil {
		return nil, err
	}
	selesai, err := parsePengumumanTanggal(tanggalSelesai)
	if err != nil {
		return nil, err
	}
	if selesai.Before(mulai) {
		return nil, errors.New("tanggal selesai harus setelah atau sama dengan tanggal mulai")
	}

	p := &domain.Pengumuman{
		Judul:          judul,
		Isi:            isi,
		TanggalMulai:   mulai,
		TanggalSelesai: selesai,
	}

	if err := u.pengumumanRepo.Create(ctx, p); err != nil {
		return nil, err
	}
	return pengumumanToDTO(p), nil
}

func (u *pengumumanUsecase) GetAll(ctx context.Context) ([]dto.PengumumanResponseDTO, error) {
	list, err := u.pengumumanRepo.GetAll(ctx)
	if err != nil {
		return nil, err
	}
	return pengumumanToDTOList(list), nil
}

func (u *pengumumanUsecase) GetByID(ctx context.Context, id int) (*dto.PengumumanResponseDTO, error) {
	if id <= 0 {
		return nil, errors.New("id wajib diisi")
	}
	p, err := u.pengumumanRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if p == nil {
		return nil, errors.New("pengumuman tidak ditemukan")
	}
	return pengumumanToDTO(p), nil
}

func (u *pengumumanUsecase) Update(ctx context.Context, id int, req dto.PengumumanUpdateRequestDTO) error {
	if id <= 0 {
		return errors.New("id wajib diisi")
	}

	existing, err := u.pengumumanRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("pengumuman tidak ditemukan")
	}

	p := &domain.Pengumuman{
		ID:             existing.ID,
		Judul:          existing.Judul,
		Isi:            existing.Isi,
		TanggalMulai:   existing.TanggalMulai,
		TanggalSelesai: existing.TanggalSelesai,
	}

	if req.Judul != nil {
		if strings.TrimSpace(*req.Judul) == "" {
			return errors.New("judul tidak boleh kosong")
		}
		p.Judul = strings.TrimSpace(*req.Judul)
	}
	if req.Isi != nil {
		if strings.TrimSpace(*req.Isi) == "" {
			return errors.New("isi tidak boleh kosong")
		}
		p.Isi = strings.TrimSpace(*req.Isi)
	}
	if req.TanggalMulai != nil {
		mulai, err := parsePengumumanTanggal(*req.TanggalMulai)
		if err != nil {
			return err
		}
		p.TanggalMulai = mulai
	}
	if req.TanggalSelesai != nil {
		selesai, err := parsePengumumanTanggal(*req.TanggalSelesai)
		if err != nil {
			return err
		}
		p.TanggalSelesai = selesai
	}
	if p.TanggalSelesai.Before(p.TanggalMulai) {
		return errors.New("tanggal selesai harus setelah atau sama dengan tanggal mulai")
	}

	return u.pengumumanRepo.Update(ctx, id, p)
}

func (u *pengumumanUsecase) Delete(ctx context.Context, id int) error {
	if id <= 0 {
		return errors.New("id wajib diisi")
	}

	existing, err := u.pengumumanRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("pengumuman tidak ditemukan")
	}

	deleted, err := u.pengumumanRepo.Delete(ctx, id)
	if err != nil {
		return err
	}
	if !deleted {
		return errors.New("pengumuman tidak ditemukan")
	}
	return nil
}

func pengumumanToDTO(p *domain.Pengumuman) *dto.PengumumanResponseDTO {
	return &dto.PengumumanResponseDTO{
		ID:             p.ID,
		Judul:          p.Judul,
		Isi:            p.Isi,
		TanggalMulai:   p.TanggalMulai,
		TanggalSelesai: p.TanggalSelesai,
		CreatedAt:      p.CreatedAt,
		UpdatedAt:      p.UpdatedAt,
	}
}

func pengumumanToDTOList(list []domain.Pengumuman) []dto.PengumumanResponseDTO {
	result := make([]dto.PengumumanResponseDTO, 0, len(list))
	for i := range list {
		result = append(result, *pengumumanToDTO(&list[i]))
	}
	return result
}
