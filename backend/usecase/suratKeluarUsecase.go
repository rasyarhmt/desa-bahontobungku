package usecase

import (
	"context"
	"path/filepath"
	"strings"

	"github.com/rasyarhmt/desa-bahontobungku/domain"
	"github.com/rasyarhmt/desa-bahontobungku/dto"
	"github.com/rasyarhmt/desa-bahontobungku/utils"
)

type suratKeluarUsecase struct {
	suratRepo domain.SuratKeluarRepository
}

func NewSuratKeluarUsecase(suratRepo domain.SuratKeluarRepository) SuratKeluarUsecase {
	return &suratKeluarUsecase{suratRepo: suratRepo}
}

func (u *suratKeluarUsecase) Create(ctx context.Context, req dto.SuratKeluarCreateRequestDTO, file *UploadedFile) error {
	relPath, err := storeSuratArchive(file, true)
	if err != nil {
		return err
	}
	committed := false
	defer func() {
		if !committed && relPath != "" {
			_ = utils.DeleteArchiveFile(relPath)
		}
	}()
	req.File = relPath

	if strings.TrimSpace(req.NomorSurat) == "" {
		return domain.NewValidation("nomorSurat wajib diisi")
	}
	if strings.TrimSpace(req.Penerima) == "" {
		return domain.NewValidation("penerima wajib diisi")
	}
	if strings.TrimSpace(req.TanggalKirim) == "" {
		return domain.NewValidation("tanggalKirim wajib diisi")
	}
	tanggal, err := parseSuratDate(req.TanggalKirim)
	if err != nil {
		return err
	}

	existing, err := u.suratRepo.GetByNomorSurat(ctx, strings.TrimSpace(req.NomorSurat))
	if err != nil {
		return err
	}
	if existing != nil {
		return domain.NewValidation("nomor surat sudah digunakan")
	}

	s := &domain.SuratKeluar{
		NomorSurat:   strings.TrimSpace(req.NomorSurat),
		Penerima:     strings.TrimSpace(req.Penerima),
		Perihal:      nil,
		TanggalKirim: tanggal,
		File:         strings.TrimSpace(req.File),
		IDLogCetak:   req.IDLogCetak,
	}
	if v := strings.TrimSpace(req.Perihal); v != "" {
		s.Perihal = &v
	}

	if _, err = u.suratRepo.Create(ctx, s); err != nil {
		return err
	}
	committed = true
	return nil
}

func (u *suratKeluarUsecase) GetAll(ctx context.Context) ([]dto.SuratKeluarResponseDTO, error) {
	list, err := u.suratRepo.GetAll(ctx)
	if err != nil {
		return nil, err
	}
	return mapToDTOList(list, suratKeluarToDTO), nil
}

func (u *suratKeluarUsecase) GetByID(ctx context.Context, id int) (*dto.SuratKeluarResponseDTO, error) {
	if id <= 0 {
		return nil, domain.NewValidation("id wajib diisi")
	}
	s, err := u.suratRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if s == nil {
		return nil, domain.NewNotFound("surat keluar tidak ditemukan")
	}
	return suratKeluarToDTO(s), nil
}

func (u *suratKeluarUsecase) Update(ctx context.Context, id int, req dto.SuratKeluarUpdateRequestDTO, file *UploadedFile) error {
	if id <= 0 {
		return domain.NewValidation("id wajib diisi")
	}

	newFile, err := storeSuratArchive(file, false)
	if err != nil {
		return err
	}
	committed := false
	defer func() {
		if !committed && newFile != "" {
			_ = utils.DeleteArchiveFile(newFile)
		}
	}()
	if newFile != "" {
		req.File = &newFile
	}

	existing, err := u.suratRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return domain.NewNotFound("surat keluar tidak ditemukan")
	}

	s := &domain.SuratKeluar{
		ID:           existing.ID,
		NomorSurat:   existing.NomorSurat,
		Penerima:     existing.Penerima,
		Perihal:      existing.Perihal,
		TanggalKirim: existing.TanggalKirim,
		File:         existing.File,
		IDLogCetak:   existing.IDLogCetak,
	}

	if req.NomorSurat != nil {
		nomor := strings.TrimSpace(*req.NomorSurat)
		if nomor == "" {
			return domain.NewValidation("nomorSurat tidak boleh kosong")
		}
		if nomor != existing.NomorSurat {
			dup, err := u.suratRepo.GetByNomorSurat(ctx, nomor)
			if err != nil {
				return err
			}
			if dup != nil {
				return domain.NewValidation("nomor surat sudah digunakan")
			}
		}
		s.NomorSurat = nomor
	}
	if req.Penerima != nil {
		if strings.TrimSpace(*req.Penerima) == "" {
			return domain.NewValidation("penerima tidak boleh kosong")
		}
		s.Penerima = strings.TrimSpace(*req.Penerima)
	}
	if req.Perihal != nil {
		v := strings.TrimSpace(*req.Perihal)
		if v == "" {
			s.Perihal = nil
		} else {
			s.Perihal = &v
		}
	}
	if req.TanggalKirim != nil {
		tanggal, err := parseSuratDate(*req.TanggalKirim)
		if err != nil {
			return err
		}
		s.TanggalKirim = tanggal
	}
	if req.IDLogCetak != nil {
		s.IDLogCetak = req.IDLogCetak
	}

	newFileUsed := false
	if req.DeleteFile && existing.File != "" {
		s.File = ""
	}
	if req.File != nil && strings.TrimSpace(*req.File) != "" {
		s.File = strings.TrimSpace(*req.File)
		newFileUsed = existing.File != "" && existing.File != s.File
	}

	if err := u.suratRepo.Update(ctx, id, s); err != nil {
		return err
	}
	committed = true

	if newFileUsed {
		if err := utils.DeleteArchiveFile(existing.File); err != nil {
			return err
		}
	}
	if req.DeleteFile && existing.File != "" && !newFileUsed {
		if err := utils.DeleteArchiveFile(existing.File); err != nil {
			return err
		}
	}

	return nil
}

func (u *suratKeluarUsecase) Delete(ctx context.Context, id int) error {
	if id <= 0 {
		return domain.NewValidation("id wajib diisi")
	}

	existing, err := u.suratRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return domain.NewNotFound("surat keluar tidak ditemukan")
	}

	deleted, err := u.suratRepo.Delete(ctx, id)
	if err != nil {
		return err
	}
	if !deleted {
		return domain.NewNotFound("surat keluar tidak ditemukan")
	}

	if existing.File != "" {
		if err := utils.DeleteArchiveFile(existing.File); err != nil {
			return err
		}
	}
	return nil
}

func (u *suratKeluarUsecase) DownloadFile(ctx context.Context, id int) ([]byte, string, error) {
	if id <= 0 {
		return nil, "", domain.NewValidation("id wajib diisi")
	}
	s, err := u.suratRepo.GetByID(ctx, id)
	if err != nil {
		return nil, "", err
	}
	if s == nil {
		return nil, "", domain.NewNotFound("surat keluar tidak ditemukan")
	}
	if s.File == "" {
		return nil, "", domain.NewNotFound("surat keluar tidak memiliki file")
	}
	plain, err := utils.DecryptArchiveFile(s.File)
	if err != nil {
		return nil, "", err
	}
	name := strings.TrimSuffix(filepath.Base(s.File), filepath.Ext(s.File))
	return plain, name, nil
}

func suratKeluarToDTO(s *domain.SuratKeluar) *dto.SuratKeluarResponseDTO {
	out := &dto.SuratKeluarResponseDTO{
		ID:           s.ID,
		NomorSurat:   s.NomorSurat,
		Penerima:     s.Penerima,
		Perihal:      s.Perihal,
		TanggalKirim: s.TanggalKirim,
		File:         s.File,
		HasFile:      s.File != "",
		IDLogCetak:   s.IDLogCetak,
		CreatedAt:    s.CreatedAt,
		UpdatedAt:    s.UpdatedAt,
	}
	return out
}
