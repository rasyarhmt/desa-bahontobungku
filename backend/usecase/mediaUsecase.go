package usecase

import (
	"context"
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

func NewMediaUsecase(mediaRepo domain.MediaRepository) MediaUsecase {
	return &mediaUsecase{mediaRepo: mediaRepo}
}

func (u *mediaUsecase) Create(ctx context.Context, req dto.MediaCreateRequestDTO, file, thumbnail *UploadedFile) (*dto.MediaResponseDTO, error) {
	nama := strings.TrimSpace(req.Nama)
	deskripsi := strings.TrimSpace(req.Deskripsi)
	tipe := strings.ToLower(strings.TrimSpace(req.Tipe))

	if _, ok := mediaAllowedTypes[tipe]; !ok {
		return nil, domain.NewValidation("Tipe media tidak valid (foto/video/dokumen)")
	}
	if file == nil {
		return nil, domain.NewValidation("File media wajib diunggah")
	}

	filePath, err := storeMediaFile(file, tipe)
	if err != nil {
		return nil, err
	}
	committed := false
	var thumbPath string
	defer func() {
		if !committed {
			_ = utils.DeleteMediaFile(filePath)
			if thumbPath != "" {
				_ = utils.DeleteMediaFile(thumbPath)
			}
		}
	}()

	thumbPath, err = storeMediaThumbnail(thumbnail)
	if err != nil {
		return nil, err
	}

	if nama == "" {
		return nil, domain.NewValidation("nama wajib diisi")
	}

	m := &domain.Media{
		Nama:      nama,
		Tipe:      tipe,
		File:      filePath,
		Deskripsi: deskripsi,
		Thumbnail: thumbPath,
	}

	if err := u.mediaRepo.Create(ctx, m); err != nil {
		return nil, err
	}
	committed = true
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
		return nil, domain.NewValidation("id wajib diisi")
	}
	m, err := u.mediaRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if m == nil {
		return nil, domain.NewNotFound("media tidak ditemukan")
	}
	return mediaToDTO(m), nil
}

func (u *mediaUsecase) Update(ctx context.Context, id int, req dto.MediaUpdateRequestDTO, file *UploadedFile) error {
	if id <= 0 {
		return domain.NewValidation("id wajib diisi")
	}

	newFile, err := storeMediaFileUpdate(file)
	if err != nil {
		return err
	}
	committed := false
	defer func() {
		if !committed && newFile != "" {
			_ = utils.DeleteMediaFile(newFile)
		}
	}()

	existing, err := u.mediaRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return domain.NewNotFound("media tidak ditemukan")
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
			return domain.NewValidation("nama tidak boleh kosong")
		}
		m.Nama = strings.TrimSpace(*req.Nama)
	}
	if req.Tipe != nil {
		tipe := strings.ToLower(strings.TrimSpace(*req.Tipe))
		if !validMediaTipe[tipe] {
			return domain.NewValidation("tipe media tidak valid (foto/video/dokumen)")
		}
		m.Tipe = tipe
	}
	if req.Deskripsi != nil {
		m.Deskripsi = strings.TrimSpace(*req.Deskripsi)
	}
	if req.Thumbnail != nil {
		m.Thumbnail = strings.TrimSpace(*req.Thumbnail)
	}

	// Ganti file utama bila diunggah file baru
	newFileUsed := false
	if newFile != "" {
		m.File = newFile
		newFileUsed = existing.File != "" && existing.File != m.File
	}

	if err := u.mediaRepo.Update(ctx, id, m); err != nil {
		return err
	}
	committed = true

	if newFileUsed {
		if err := utils.DeleteMediaFile(existing.File); err != nil {
			return err
		}
	}
	return nil
}

func (u *mediaUsecase) Delete(ctx context.Context, id int) error {
	if id <= 0 {
		return domain.NewValidation("id wajib diisi")
	}
	existing, err := u.mediaRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return domain.NewNotFound("media tidak ditemukan")
	}
	deleted, err := u.mediaRepo.Delete(ctx, id)
	if err != nil {
		return err
	}
	if !deleted {
		return domain.NewNotFound("media tidak ditemukan")
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
	return mapToDTOList(list, mediaToDTO)
}
