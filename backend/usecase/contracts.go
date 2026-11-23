package usecase

import (
	"context"

	"github.com/rasyarhmt/desa-bahontobungku/dto"
)

// UploadedFile adalah representasi transport-agnostic dari file yang diunggah.
type UploadedFile struct {
	Filename    string
	Size        int64
	Content     []byte
	ContentType string
}

type (
	AparaturUsecase interface {
		Create(ctx context.Context, req dto.AparaturCreateRequestDTO, foto *UploadedFile) (*dto.AparaturResponseDTO, error)
		GetAll(ctx context.Context) ([]dto.AparaturResponseDTO, error)
		GetByID(ctx context.Context, id int) (*dto.AparaturResponseDTO, error)
		GetByNIP(ctx context.Context, nip string) (*dto.AparaturResponseDTO, error)
		Update(ctx context.Context, id int, req dto.AparaturUpdateRequestDTO, foto *UploadedFile) error
		Delete(ctx context.Context, id int) error
	}

	AuthUsecase interface {
		Login(ctx context.Context, req dto.LoginRequestDTO, userAgent, ipAddress string) (*dto.LoginResponseDTO, error)
		RefreshToken(ctx context.Context, req dto.RefreshTokenRequestDTO, userAgent, ipAddress string) (*dto.RefreshTokenResponseDTO, error)
		Logout(ctx context.Context, refreshToken string) error
	}

	BeritaUsecase interface {
		Create(ctx context.Context, req dto.BeritaCreateRequestDTO, foto *UploadedFile) (*dto.BeritaResponseDTO, error)
		GetAll(ctx context.Context) ([]dto.BeritaResponseDTO, error)
		GetAllAdmin(ctx context.Context) ([]dto.BeritaResponseDTO, error)
		GetByStatus(ctx context.Context, status string) ([]dto.BeritaResponseDTO, error)
		GetByID(ctx context.Context, id int) (*dto.BeritaResponseDTO, error)
		GetByIDAdmin(ctx context.Context, id int) (*dto.BeritaResponseDTO, error)
		Update(ctx context.Context, id int, req dto.BeritaUpdateRequestDTO, foto *UploadedFile) error
		ToggleStatus(ctx context.Context, id int) (*dto.BeritaResponseDTO, error)
		Delete(ctx context.Context, id int) error
	}

	DanaUsecase interface {
		CreateMasuk(ctx context.Context, req dto.DanaMasukCreateRequestDTO) (*dto.DanaMasukResponseDTO, error)
		CreateKeluar(ctx context.Context, req dto.DanaKeluarCreateRequestDTO) (*dto.DanaKeluarResponseDTO, error)
		GetAllMasuk(ctx context.Context) ([]dto.DanaMasukResponseDTO, error)
		GetAllKeluar(ctx context.Context) ([]dto.DanaKeluarResponseDTO, error)
		GetMasukByID(ctx context.Context, id int) (*dto.DanaMasukResponseDTO, error)
		GetKeluarByID(ctx context.Context, id int) (*dto.DanaKeluarResponseDTO, error)
		UpdateMasuk(ctx context.Context, id int, req dto.DanaMasukUpdateRequestDTO) error
		UpdateKeluar(ctx context.Context, id int, req dto.DanaKeluarUpdateRequestDTO) error
		DeleteMasuk(ctx context.Context, id int) error
		DeleteKeluar(ctx context.Context, id int) error
		GetSummary(ctx context.Context, tahun int) ([]dto.DanaSummaryItemDTO, error)
		GetDetail(ctx context.Context, tahun int) (*dto.DanaDetailDTO, error)
	}

	LogCetakSuratUsecase interface {
		Ajukan(ctx context.Context, idPelayanan int, req dto.AjukanSuratRequestDTO, requestHost string, isTLS bool) (*dto.AjukanSuratResponseDTO, error)
		GetAll(ctx context.Context) ([]dto.LogCetakSuratResponseDTO, error)
		GetByID(ctx context.Context, id int) (*dto.LogCetakSuratResponseDTO, error)
		DownloadByKode(ctx context.Context, kodeUnik string) ([]byte, string, error)
		DownloadByID(ctx context.Context, id int) ([]byte, string, error)
		Resmikan(ctx context.Context, id int, nomorSurat string) error
		Verifikasi(ctx context.Context, kodeUnik string) (*dto.LogCetakSuratVerifikasiDTO, error)
	}

	MediaUsecase interface {
		Create(ctx context.Context, req dto.MediaCreateRequestDTO, file, thumbnail *UploadedFile) (*dto.MediaResponseDTO, error)
		GetAll(ctx context.Context) ([]dto.MediaResponseDTO, error)
		GetByID(ctx context.Context, id int) (*dto.MediaResponseDTO, error)
		Update(ctx context.Context, id int, req dto.MediaUpdateRequestDTO, file *UploadedFile) error
		Delete(ctx context.Context, id int) error
	}

	PelayananUsecase interface {
		Create(ctx context.Context, req dto.PelayananCreateRequestDTO) error
		GetAll(ctx context.Context) ([]dto.PelayananResponseDTO, error)
		GetByID(ctx context.Context, id int) (*dto.PelayananResponseDTO, error)
		GetTemplateFields(ctx context.Context, id int) ([]dto.TemplateFieldDTO, error)
		Update(ctx context.Context, id int, req dto.PelayananUpdateRequestDTO) error
		Delete(ctx context.Context, id int) error
		ToggleStatus(ctx context.Context, id int) error
	}

	PendudukUsecase interface {
		Create(ctx context.Context, req dto.PendudukRequestDTO) error
		GetByNIK(ctx context.Context, nik string) (*dto.PendudukResponseDTO, error)
		GetAll(ctx context.Context) ([]dto.PendudukResponseDTO, error)
		ExportXLSX(ctx context.Context) ([]byte, error)
		GetKepalaKeluarga(ctx context.Context) ([]dto.PendudukResponseDTO, error)
		Update(ctx context.Context, req dto.PendudukUpdateRequestDTO) error
		Delete(ctx context.Context, nik string) error
		CountTotal(ctx context.Context) (int, error)
		CountKepalaKeluarga(ctx context.Context) (int, error)
		CountLakiLaki(ctx context.Context) (int, error)
		CountPerempuan(ctx context.Context) (int, error)
		GetReligiStats(ctx context.Context) ([]dto.ReligiStatsDTO, error)
		GetUmurStats(ctx context.Context) ([]dto.UmurStatsDTO, error)
	}

	PengumumanUsecase interface {
		Create(ctx context.Context, req dto.PengumumanCreateRequestDTO) (*dto.PengumumanResponseDTO, error)
		GetAll(ctx context.Context) ([]dto.PengumumanResponseDTO, error)
		GetByID(ctx context.Context, id int) (*dto.PengumumanResponseDTO, error)
		Update(ctx context.Context, id int, req dto.PengumumanUpdateRequestDTO) error
		Delete(ctx context.Context, id int) error
	}

	StatusKeluargaUsecase interface {
		Create(ctx context.Context, req dto.StatusKeluargaCreateRequestDTO) (*dto.StatusKeluargaResponseDTO, error)
		GetAll(ctx context.Context, includeInactive bool) ([]dto.StatusKeluargaResponseDTO, error)
		GetByID(ctx context.Context, id int) (*dto.StatusKeluargaResponseDTO, error)
		Update(ctx context.Context, id int, req dto.StatusKeluargaUpdateRequestDTO) error
		Delete(ctx context.Context, id int) error
		ToggleActive(ctx context.Context, id int) error
	}

	SuratMasukUsecase interface {
		Create(ctx context.Context, req dto.SuratMasukCreateRequestDTO, file *UploadedFile) error
		GetAll(ctx context.Context) ([]dto.SuratMasukResponseDTO, error)
		GetByID(ctx context.Context, id int) (*dto.SuratMasukResponseDTO, error)
		Update(ctx context.Context, id int, req dto.SuratMasukUpdateRequestDTO, file *UploadedFile) error
		Delete(ctx context.Context, id int) error
		DownloadFile(ctx context.Context, id int) ([]byte, string, error)
	}

	SuratKeluarUsecase interface {
		Create(ctx context.Context, req dto.SuratKeluarCreateRequestDTO, file *UploadedFile) error
		GetAll(ctx context.Context) ([]dto.SuratKeluarResponseDTO, error)
		GetByID(ctx context.Context, id int) (*dto.SuratKeluarResponseDTO, error)
		Update(ctx context.Context, id int, req dto.SuratKeluarUpdateRequestDTO, file *UploadedFile) error
		Delete(ctx context.Context, id int) error
		DownloadFile(ctx context.Context, id int) ([]byte, string, error)
	}

	SuratTemplateUsecase interface {
		Create(ctx context.Context, req dto.SuratTemplateCreateRequestDTO, file *UploadedFile) error
		GetAll(ctx context.Context) ([]dto.SuratTemplateResponseDTO, error)
		GetByID(ctx context.Context, id int) (*dto.SuratTemplateResponseDTO, error)
		Update(ctx context.Context, id int, req dto.SuratTemplateUpdateRequestDTO, file *UploadedFile) error
		Delete(ctx context.Context, id int) error
		ToggleStatus(ctx context.Context, id int) error
		GetFields(ctx context.Context, id int) ([]dto.TemplateFieldDTO, error)
		UpdateFields(ctx context.Context, id int, req dto.TemplateFieldsUpdateRequestDTO) error
		Preview(ctx context.Context, id int) ([]byte, string, error)
	}

	UserUsecase interface {
		GetCurrentUser(ctx context.Context, userID int) (*dto.UserResponseDTO, error)
		UpdateProfile(ctx context.Context, userID int, req dto.UpdateProfileRequestDTO) error
		AddUser(ctx context.Context, req dto.AddUserRequestDTO) error
		GetAllUsers(ctx context.Context) ([]dto.UserResponseDTO, error)
		DeleteUser(ctx context.Context, callerID, id int) error
		TransferSuperadmin(ctx context.Context, fromID, toID int) error
		ResetPassword(ctx context.Context, email string) error
	}
)
