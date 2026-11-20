package usecase

import (
	"context"
	"fmt"
	"path/filepath"
	"strings"
	"time"

	"github.com/rasyarhmt/desa-bahontobungku/domain"
	"github.com/rasyarhmt/desa-bahontobungku/dto"
	"github.com/rasyarhmt/desa-bahontobungku/utils"
)

const dateLayout = "2006-01-02"

func parseSuratDate(value string) (time.Time, error) {
	t, err := time.Parse(dateLayout, strings.TrimSpace(value))
	if err != nil {
		return time.Time{}, domain.NewValidation("format tanggal tidak valid, gunakan YYYY-MM-DD")
	}
	return t, nil
}

type suratMasukUsecase struct {
	suratRepo domain.SuratMasukRepository
}

func NewSuratMasukUsecase(suratRepo domain.SuratMasukRepository) SuratMasukUsecase {
	return &suratMasukUsecase{suratRepo: suratRepo}
}

func (u *suratMasukUsecase) Create(ctx context.Context, req dto.SuratMasukCreateRequestDTO, file *UploadedFile) error {
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
	if strings.TrimSpace(req.Pengirim) == "" {
		return domain.NewValidation("pengirim wajib diisi")
	}
	if strings.TrimSpace(req.TanggalTerima) == "" {
		return domain.NewValidation("tanggalTerima wajib diisi")
	}
	tanggal, err := parseSuratDate(req.TanggalTerima)
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

	s := &domain.SuratMasuk{
		NomorSurat:    strings.TrimSpace(req.NomorSurat),
		Pengirim:      strings.TrimSpace(req.Pengirim),
		Perihal:       nil,
		TanggalTerima: tanggal,
		File:          strings.TrimSpace(req.File),
	}
	if v := strings.TrimSpace(req.Perihal); v != "" {
		s.Perihal = &v
	}

	sEnc, err := encryptSuratMasuk(s)
	if err != nil {
		return err
	}

	if _, err = u.suratRepo.Create(ctx, sEnc); err != nil {
		return err
	}
	committed = true
	return nil
}

func (u *suratMasukUsecase) GetAll(ctx context.Context) ([]dto.SuratMasukResponseDTO, error) {
	list, err := u.suratRepo.GetAll(ctx)
	if err != nil {
		return nil, err
	}
	result := make([]dto.SuratMasukResponseDTO, 0, len(list))
	for i := range list {
		dec, err := decryptSuratMasuk(&list[i])
		if err != nil {
			return nil, err
		}
		result = append(result, *suratMasukToDTO(dec))
	}
	return result, nil
}

func (u *suratMasukUsecase) GetByID(ctx context.Context, id int) (*dto.SuratMasukResponseDTO, error) {
	if id <= 0 {
		return nil, domain.NewValidation("id wajib diisi")
	}
	s, err := u.suratRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if s == nil {
		return nil, domain.NewNotFound("surat masuk tidak ditemukan")
	}
	s, err = decryptSuratMasuk(s)
	if err != nil {
		return nil, err
	}
	return suratMasukToDTO(s), nil
}

func (u *suratMasukUsecase) Update(ctx context.Context, id int, req dto.SuratMasukUpdateRequestDTO, file *UploadedFile) error {
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
		return domain.NewNotFound("surat masuk tidak ditemukan")
	}
	existing, err = decryptSuratMasuk(existing)
	if err != nil {
		return err
	}

	s := &domain.SuratMasuk{
		ID:            existing.ID,
		NomorSurat:    existing.NomorSurat,
		Pengirim:      existing.Pengirim,
		Perihal:       existing.Perihal,
		TanggalTerima: existing.TanggalTerima,
		File:          existing.File,
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
	if req.Pengirim != nil {
		if strings.TrimSpace(*req.Pengirim) == "" {
			return domain.NewValidation("pengirim tidak boleh kosong")
		}
		s.Pengirim = strings.TrimSpace(*req.Pengirim)
	}
	if req.Perihal != nil {
		v := strings.TrimSpace(*req.Perihal)
		if v == "" {
			s.Perihal = nil
		} else {
			s.Perihal = &v
		}
	}
	if req.TanggalTerima != nil {
		tanggal, err := parseSuratDate(*req.TanggalTerima)
		if err != nil {
			return err
		}
		s.TanggalTerima = tanggal
	}

	// Penanganan file: prioritas file baru > deleteFile > pertahankan file lama
	newFileUsed := false
	if req.DeleteFile && existing.File != "" {
		s.File = ""
	}
	if req.File != nil && strings.TrimSpace(*req.File) != "" {
		s.File = strings.TrimSpace(*req.File)
		newFileUsed = existing.File != "" && existing.File != s.File
	}

	sEnc, err := encryptSuratMasuk(s)
	if err != nil {
		return err
	}
	if err := u.suratRepo.Update(ctx, id, sEnc); err != nil {
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

func (u *suratMasukUsecase) Delete(ctx context.Context, id int) error {
	if id <= 0 {
		return domain.NewValidation("id wajib diisi")
	}

	existing, err := u.suratRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return domain.NewNotFound("surat masuk tidak ditemukan")
	}

	deleted, err := u.suratRepo.Delete(ctx, id)
	if err != nil {
		return err
	}
	if !deleted {
		return domain.NewNotFound("surat masuk tidak ditemukan")
	}

	if existing.File != "" {
		if err := utils.DeleteArchiveFile(existing.File); err != nil {
			return err
		}
	}
	return nil
}

func (u *suratMasukUsecase) DownloadFile(ctx context.Context, id int) ([]byte, string, error) {
	if id <= 0 {
		return nil, "", domain.NewValidation("id wajib diisi")
	}
	s, err := u.suratRepo.GetByID(ctx, id)
	if err != nil {
		return nil, "", err
	}
	if s == nil {
		return nil, "", domain.NewNotFound("surat masuk tidak ditemukan")
	}
	if s.File == "" {
		return nil, "", domain.NewNotFound("surat masuk tidak memiliki file")
	}
	plain, err := utils.DecryptArchiveFile(s.File)
	if err != nil {
		return nil, "", err
	}
	name := strings.TrimSuffix(filepath.Base(s.File), filepath.Ext(s.File))
	return plain, name, nil
}

func suratMasukToDTO(s *domain.SuratMasuk) *dto.SuratMasukResponseDTO {
	out := &dto.SuratMasukResponseDTO{
		ID:            s.ID,
		NomorSurat:    s.NomorSurat,
		Pengirim:      s.Pengirim,
		Perihal:       s.Perihal,
		TanggalTerima: s.TanggalTerima,
		File:          s.File,
		HasFile:       s.File != "",
		CreatedAt:     s.CreatedAt,
		UpdatedAt:     s.UpdatedAt,
	}
	return out
}

func encryptSuratMasuk(s *domain.SuratMasuk) (*domain.SuratMasuk, error) {
	if s == nil {
		return nil, nil
	}
	res := *s
	key := utils.GetMasterKEK()

	if res.Pengirim != "" {
		enc, err := utils.EncryptString(res.Pengirim, key)
		if err != nil {
			return nil, err
		}
		res.Pengirim = enc
	}
	if res.Perihal != nil && *res.Perihal != "" {
		enc, err := utils.EncryptString(*res.Perihal, key)
		if err != nil {
			return nil, err
		}
		res.Perihal = &enc
	}
	return &res, nil
}

func decryptSuratMasuk(s *domain.SuratMasuk) (*domain.SuratMasuk, error) {
	if s == nil {
		return nil, nil
	}
	res := *s
	key := utils.GetMasterKEK()

	plainPengirim, err := utils.DecryptString(s.Pengirim, key)
	if err != nil {
		return nil, domain.NewInternal("Gagal mendekripsi data surat masuk", fmt.Errorf("pengirim: %w", err))
	}
	res.Pengirim = plainPengirim

	if s.Perihal != nil {
		plainPerihal, err := utils.DecryptString(*s.Perihal, key)
		if err != nil {
			return nil, domain.NewInternal("Gagal mendekripsi data surat masuk", fmt.Errorf("perihal: %w", err))
		}
		res.Perihal = &plainPerihal
	}
	return &res, nil
}
