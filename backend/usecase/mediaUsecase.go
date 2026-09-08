package usecase

import (
	"context"
	"errors"
	"strings"

	"github.com/rasyarhmt/desa-bahontobungku/domain"
	"github.com/rasyarhmt/desa-bahontobungku/dto"
	"github.com/rasyarhmt/desa-bahontobungku/utils"
)

var validMediaTipe = map[string]bool{
	domain.MediaTipeFoto:    true,
	domain.MediaTipeVideo:   true,
	domain.MediaTipeDokumen: true,
}

type mediaUsecase struct {
	mediaRepo domain.MediaRepository
}

func NewMediaUsecase(mediaRepo domain.MediaRepository) domain.MediaUsecase {
	return &mediaUsecase{mediaRepo: mediaRepo}
}

func (u *mediaUsecase) Create(ctx context.Context, req dto.MediaCreateRequestDTO) (*dto.MediaResponseDTO, error) {
	nama := strings.TrimSpace(req.Nama)
	deskripsi := strings.TrimSpace(req.Deskripsi)
	tipe := strings.ToLower(strings.TrimSpace(req.Tipe))

	if nama == "" {
		return nil, errors.New("nama wajib diisi")
	}
	if deskripsi == "" {
		return nil, errors.New("deskripsi wajib diisi")
	}
	if !validMediaTipe[tipe] {
		return nil, errors.New("tipe media tidak valid (foto/video/dokumen)")
	}
	if strings.TrimSpace(req.File) == "" {
		return nil, errors.New("file wajib diunggah")
	}
	if tipe == domain.MediaTipeVideo && strings.TrimSpace(req.Thumbnail) == "" {
		return nil, errors.New("thumbnail wajib diisi untuk tipe video")
	}

	m := &domain.Media{
		Nama:      nama,
		Tipe:      tipe,
		File:      strings.TrimSpace(req.File),
		Deskripsi: deskripsi,
		Thumbnail: strings.TrimSpace(req.Thumbnail),
	}

	if err := u.mediaRepo.Create(ctx, m); err != nil {
		return nil, err
	}
	return mediaToDTO(m), nil
}

func (u *mediaUsecase) GetAll(ctx context.Context) ([]dto.MediaResponseDTO, error) {
	list, err := u.mediaRepo.GetAll(ctx)
	if err != nil {
		return nil, err
	}
	return mediaToDTOList(list), nil
}

func (u *mediaUsecase) GetByID(ctx context.Context, id int) (*dto.MediaResponseDTO, error) {
	if id <= 0 {
		return nil, errors.New("id wajib diisi")
	}
	m, err := u.mediaRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if m == nil {
		return nil, errors.New("media tidak ditemukan")
	}
	return mediaToDTO(m), nil
}

func (u *mediaUsecase) Update(ctx context.Context, id int, req dto.MediaUpdateRequestDTO) error {
	if id <= 0 {
		return errors.New("id wajib diisi")
	}

	existing, err := u.mediaRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("media tidak ditemukan")
	}

	m := &domain.Media{
		ID:        existing.ID,
		Nama:      existing.Nama,
		Tipe:      existing.Tipe,
		File:      existing.File,
		Deskripsi: existing.Deskripsi,
		Thumbnail: existing.Thumbnail,
	}

	if req.Nama != nil {
		if strings.TrimSpace(*req.Nama) == "" {
			return errors.New("nama tidak boleh kosong")
		}
		m.Nama = strings.TrimSpace(*req.Nama)
	}
	if req.Tipe != nil {
		tipe := strings.ToLower(strings.TrimSpace(*req.Tipe))
		if !validMediaTipe[tipe] {
			return errors.New("tipe media tidak valid (foto/video/dokumen)")
		}
		m.Tipe = tipe
	}
	if req.Deskripsi != nil {
		if strings.TrimSpace(*req.Deskripsi) == "" {
			return errors.New("deskripsi tidak boleh kosong")
		}
		m.Deskripsi = strings.TrimSpace(*req.Deskripsi)
	}
	if req.Thumbnail != nil {
		m.Thumbnail = strings.TrimSpace(*req.Thumbnail)
	}

	// Ganti file utama bila diunggah file baru
	newFileUsed := false
	if req.File != nil && strings.TrimSpace(*req.File) != "" {
		m.File = strings.TrimSpace(*req.File)
		newFileUsed = existing.File != "" && existing.File != m.File
	}

	if m.Tipe == domain.MediaTipeVideo && m.Thumbnail == "" {
		return errors.New("thumbnail wajib diisi untuk tipe video")
	}

	if err := u.mediaRepo.Update(ctx, id, m); err != nil {
		if newFileUsed {
			_ = utils.DeleteMediaFile(m.File)
		}
		return err
	}

	if newFileUsed {
		if err := utils.DeleteMediaFile(existing.File); err != nil {
			return err
		}
	}
	return nil
}

func (u *mediaUsecase) Delete(ctx context.Context, id int) error {
	if id <= 0 {
		return errors.New("id wajib diisi")
	}
	existing, err := u.mediaRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("media tidak ditemukan")
	}
	deleted, err := u.mediaRepo.Delete(ctx, id)
	if err != nil {
		return err
	}
	if !deleted {
		return errors.New("media tidak ditemukan")
	}
	if existing.File != "" {
		if err := utils.DeleteMediaFile(existing.File); err != nil {
			return err
		}
	}
	if existing.Thumbnail != "" {
		_ = utils.DeleteMediaFile(existing.Thumbnail)
	}
	return nil
}

func mediaToDTO(m *domain.Media) *dto.MediaResponseDTO {
	return &dto.MediaResponseDTO{
		ID:        m.ID,
		Nama:      m.Nama,
		Tipe:      m.Tipe,
		Deskripsi: m.Deskripsi,
		File:      m.File,
		Thumbnail: m.Thumbnail,
		HasThumb:  m.Thumbnail != "",
		CreatedAt: m.CreatedAt,
		UpdatedAt: m.UpdatedAt,
	}
}

func mediaToDTOList(list []domain.Media) []dto.MediaResponseDTO {
	result := make([]dto.MediaResponseDTO, 0, len(list))
	for i := range list {
		result = append(result, *mediaToDTO(&list[i]))
	}
	return result
}
