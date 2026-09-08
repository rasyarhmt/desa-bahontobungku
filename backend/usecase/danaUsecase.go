package usecase

import (
	"context"
	"errors"
	"strings"

	"github.com/rasyarhmt/desa-bahontobungku/domain"
	"github.com/rasyarhmt/desa-bahontobungku/dto"
)

type danaUsecase struct {
	danaRepo domain.DanaRepository
}

func NewDanaUsecase(danaRepo domain.DanaRepository) domain.DanaUsecase {
	return &danaUsecase{danaRepo: danaRepo}
}

func validateDanaBulanTahun(tahun, bulan int) error {
	if tahun < 2000 || tahun > 2100 {
		return errors.New("tahun tidak valid")
	}
	if bulan < 1 || bulan > 12 {
		return errors.New("bulan tidak valid (1-12)")
	}
	return nil
}

func (u *danaUsecase) CreateMasuk(ctx context.Context, req dto.DanaMasukCreateRequestDTO) (*dto.DanaMasukResponseDTO, error) {
	if req.Jumlah <= 0 {
		return nil, errors.New("jumlah wajib diisi dan harus lebih dari 0")
	}
	if strings.TrimSpace(req.Sumber) == "" {
		return nil, errors.New("sumber wajib diisi")
	}
	if strings.TrimSpace(req.Keterangan) == "" {
		return nil, errors.New("keterangan wajib diisi")
	}
	if err := validateDanaBulanTahun(req.Tahun, req.Bulan); err != nil {
		return nil, err
	}

	d := &domain.DanaMasuk{
		Tahun:      req.Tahun,
		Bulan:      req.Bulan,
		Jumlah:     req.Jumlah,
		Sumber:     strings.TrimSpace(req.Sumber),
		Keterangan: strings.TrimSpace(req.Keterangan),
	}

	if err := u.danaRepo.CreateMasuk(ctx, d); err != nil {
		return nil, err
	}
	return danaMasukToDTO(d), nil
}

func (u *danaUsecase) CreateKeluar(ctx context.Context, req dto.DanaKeluarCreateRequestDTO) (*dto.DanaKeluarResponseDTO, error) {
	if req.Jumlah <= 0 {
		return nil, errors.New("jumlah wajib diisi dan harus lebih dari 0")
	}
	if strings.TrimSpace(req.Kategori) == "" {
		return nil, errors.New("kategori wajib diisi")
	}
	if strings.TrimSpace(req.Keterangan) == "" {
		return nil, errors.New("keterangan wajib diisi")
	}
	if err := validateDanaBulanTahun(req.Tahun, req.Bulan); err != nil {
		return nil, err
	}

	d := &domain.DanaKeluar{
		Tahun:      req.Tahun,
		Bulan:      req.Bulan,
		Jumlah:     req.Jumlah,
		Kategori:   strings.TrimSpace(req.Kategori),
		Keterangan: strings.TrimSpace(req.Keterangan),
	}

	if err := u.danaRepo.CreateKeluar(ctx, d); err != nil {
		return nil, err
	}
	return danaKeluarToDTO(d), nil
}

func (u *danaUsecase) GetAllMasuk(ctx context.Context) ([]dto.DanaMasukResponseDTO, error) {
	list, err := u.danaRepo.GetAllMasuk(ctx)
	if err != nil {
		return nil, err
	}
	return danaMasukToDTOList(list), nil
}

func (u *danaUsecase) GetAllKeluar(ctx context.Context) ([]dto.DanaKeluarResponseDTO, error) {
	list, err := u.danaRepo.GetAllKeluar(ctx)
	if err != nil {
		return nil, err
	}
	return danaKeluarToDTOList(list), nil
}

func (u *danaUsecase) GetMasukByID(ctx context.Context, id int) (*dto.DanaMasukResponseDTO, error) {
	if id <= 0 {
		return nil, errors.New("id wajib diisi")
	}
	d, err := u.danaRepo.GetMasukByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if d == nil {
		return nil, errors.New("dana masuk tidak ditemukan")
	}
	return danaMasukToDTO(d), nil
}

func (u *danaUsecase) GetKeluarByID(ctx context.Context, id int) (*dto.DanaKeluarResponseDTO, error) {
	if id <= 0 {
		return nil, errors.New("id wajib diisi")
	}
	d, err := u.danaRepo.GetKeluarByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if d == nil {
		return nil, errors.New("dana keluar tidak ditemukan")
	}
	return danaKeluarToDTO(d), nil
}

func (u *danaUsecase) UpdateMasuk(ctx context.Context, id int, req dto.DanaMasukUpdateRequestDTO) error {
	if id <= 0 {
		return errors.New("id wajib diisi")
	}

	existing, err := u.danaRepo.GetMasukByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("dana masuk tidak ditemukan")
	}

	d := &domain.DanaMasuk{
		ID:         existing.ID,
		Tahun:      existing.Tahun,
		Bulan:      existing.Bulan,
		Jumlah:     existing.Jumlah,
		Sumber:     existing.Sumber,
		Keterangan: existing.Keterangan,
	}
	if req.Tahun != nil {
		d.Tahun = *req.Tahun
	}
	if req.Bulan != nil {
		d.Bulan = *req.Bulan
	}
	if req.Jumlah != nil {
		if *req.Jumlah <= 0 {
			return errors.New("jumlah harus lebih dari 0")
		}
		d.Jumlah = *req.Jumlah
	}
	if req.Sumber != nil {
		if strings.TrimSpace(*req.Sumber) == "" {
			return errors.New("sumber tidak boleh kosong")
		}
		d.Sumber = strings.TrimSpace(*req.Sumber)
	}
	if req.Keterangan != nil {
		if strings.TrimSpace(*req.Keterangan) == "" {
			return errors.New("keterangan tidak boleh kosong")
		}
		d.Keterangan = strings.TrimSpace(*req.Keterangan)
	}
	if err := validateDanaBulanTahun(d.Tahun, d.Bulan); err != nil {
		return err
	}

	return u.danaRepo.UpdateMasuk(ctx, id, d)
}

func (u *danaUsecase) UpdateKeluar(ctx context.Context, id int, req dto.DanaKeluarUpdateRequestDTO) error {
	if id <= 0 {
		return errors.New("id wajib diisi")
	}

	existing, err := u.danaRepo.GetKeluarByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("dana keluar tidak ditemukan")
	}

	d := &domain.DanaKeluar{
		ID:         existing.ID,
		Tahun:      existing.Tahun,
		Bulan:      existing.Bulan,
		Jumlah:     existing.Jumlah,
		Kategori:   existing.Kategori,
		Keterangan: existing.Keterangan,
	}
	if req.Tahun != nil {
		d.Tahun = *req.Tahun
	}
	if req.Bulan != nil {
		d.Bulan = *req.Bulan
	}
	if req.Jumlah != nil {
		if *req.Jumlah <= 0 {
			return errors.New("jumlah harus lebih dari 0")
		}
		d.Jumlah = *req.Jumlah
	}
	if req.Kategori != nil {
		if strings.TrimSpace(*req.Kategori) == "" {
			return errors.New("kategori tidak boleh kosong")
		}
		d.Kategori = strings.TrimSpace(*req.Kategori)
	}
	if req.Keterangan != nil {
		if strings.TrimSpace(*req.Keterangan) == "" {
			return errors.New("keterangan tidak boleh kosong")
		}
		d.Keterangan = strings.TrimSpace(*req.Keterangan)
	}
	if err := validateDanaBulanTahun(d.Tahun, d.Bulan); err != nil {
		return err
	}

	return u.danaRepo.UpdateKeluar(ctx, id, d)
}

func (u *danaUsecase) DeleteMasuk(ctx context.Context, id int) error {
	if id <= 0 {
		return errors.New("id wajib diisi")
	}
	existing, err := u.danaRepo.GetMasukByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("dana masuk tidak ditemukan")
	}
	deleted, err := u.danaRepo.DeleteMasuk(ctx, id)
	if err != nil {
		return err
	}
	if !deleted {
		return errors.New("dana masuk tidak ditemukan")
	}
	return nil
}

func (u *danaUsecase) DeleteKeluar(ctx context.Context, id int) error {
	if id <= 0 {
		return errors.New("id wajib diisi")
	}
	existing, err := u.danaRepo.GetKeluarByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("dana keluar tidak ditemukan")
	}
	deleted, err := u.danaRepo.DeleteKeluar(ctx, id)
	if err != nil {
		return err
	}
	if !deleted {
		return errors.New("dana keluar tidak ditemukan")
	}
	return nil
}

func (u *danaUsecase) GetSummary(ctx context.Context, tahun int) ([]dto.DanaSummaryItemDTO, error) {
	if err := validateDanaBulanTahun(tahun, 1); err != nil {
		return nil, err
	}
	pemasukan, pengeluaran, err := u.danaRepo.GetSummaryByYear(ctx, tahun)
	if err != nil {
		return nil, err
	}
	return []dto.DanaSummaryItemDTO{*pemasukan, *pengeluaran}, nil
}

func (u *danaUsecase) GetDetail(ctx context.Context, tahun int) (*dto.DanaDetailDTO, error) {
	if err := validateDanaBulanTahun(tahun, 1); err != nil {
		return nil, err
	}
	return u.danaRepo.GetDetailByYear(ctx, tahun)
}

func danaMasukToDTO(d *domain.DanaMasuk) *dto.DanaMasukResponseDTO {
	return &dto.DanaMasukResponseDTO{
		ID:         d.ID,
		Tahun:      d.Tahun,
		Bulan:      d.Bulan,
		Jumlah:     d.Jumlah,
		Sumber:     d.Sumber,
		Keterangan: d.Keterangan,
		CreatedAt:  d.CreatedAt,
		UpdatedAt:  d.UpdatedAt,
	}
}

func danaMasukToDTOList(list []domain.DanaMasuk) []dto.DanaMasukResponseDTO {
	result := make([]dto.DanaMasukResponseDTO, 0, len(list))
	for i := range list {
		result = append(result, *danaMasukToDTO(&list[i]))
	}
	return result
}

func danaKeluarToDTO(d *domain.DanaKeluar) *dto.DanaKeluarResponseDTO {
	return &dto.DanaKeluarResponseDTO{
		ID:         d.ID,
		Tahun:      d.Tahun,
		Bulan:      d.Bulan,
		Jumlah:     d.Jumlah,
		Kategori:   d.Kategori,
		Keterangan: d.Keterangan,
		CreatedAt:  d.CreatedAt,
		UpdatedAt:  d.UpdatedAt,
	}
}

func danaKeluarToDTOList(list []domain.DanaKeluar) []dto.DanaKeluarResponseDTO {
	result := make([]dto.DanaKeluarResponseDTO, 0, len(list))
	for i := range list {
		result = append(result, *danaKeluarToDTO(&list[i]))
	}
	return result
}
